"""
Tests for the Dashboard service and endpoint.
Covers: aggregated response shape, overdue flagging, pipeline sorting.
"""

import uuid
from datetime import date, timedelta

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application, ApplicationStatus
from app.schemas.dashboard import DashboardSummary
from app.services.auth import AuthService
from app.services.dashboard import compute_attention_items, compute_pipeline_items

# ─── Helpers ──────────────────────────────────────────────────────


def _make_app(
    user_id: uuid.UUID,
    status: ApplicationStatus,
    next_action_date: date | None = None,
    next_action: str | None = None,
    company: str = "Acme",
    role: str = "Engineer",
) -> Application:
    return Application(
        id=uuid.uuid4(),
        user_id=user_id,
        company=company,
        role=role,
        status=status,
        applied_date=date.today() - timedelta(days=10),
        next_action=next_action,
        next_action_date=next_action_date,
    )


async def _register_and_token(db: AsyncSession, settings) -> tuple[uuid.UUID, str]:
    auth = AuthService(settings)
    user = await auth.register_user(
        db,
        email=f"dash-{uuid.uuid4().hex[:8]}@test.com",
        password="testpass",
    )
    token, _ = auth.create_access_token(str(user.id))
    return user.id, token


# ─── Unit: compute_attention_items ────────────────────────────────


def test_overdue_items_flagged() -> None:
    """Applications with next_action_date in the past appear as overdue."""
    today = date(2026, 3, 13)
    user_id = uuid.uuid4()

    apps = [
        _make_app(user_id, ApplicationStatus.APPLIED, today - timedelta(days=3), "Follow up"),
        _make_app(
            user_id, ApplicationStatus.PHONE_SCREEN, today + timedelta(days=2), "Tech screen"
        ),
    ]
    items = compute_attention_items(apps, today)
    assert len(items) == 2
    overdue = [i for i in items if i.attention_type == "overdue"]
    upcoming = [i for i in items if i.attention_type == "upcoming"]
    assert len(overdue) == 1
    assert overdue[0].days_until == -3
    assert len(upcoming) == 1
    assert upcoming[0].days_until == 2


def test_no_attention_for_terminal_statuses() -> None:
    """Accepted and rejected applications are never in needs-attention."""
    today = date(2026, 3, 13)
    user_id = uuid.uuid4()

    apps = [
        _make_app(user_id, ApplicationStatus.ACCEPTED, today - timedelta(days=1), "Onboard"),
        _make_app(user_id, ApplicationStatus.REJECTED, today - timedelta(days=2), "Appeal"),
    ]
    items = compute_attention_items(apps, today)
    assert len(items) == 0


def test_no_attention_for_no_action_date() -> None:
    """Applications without a next_action_date are not flagged."""
    today = date(2026, 3, 13)
    user_id = uuid.uuid4()

    apps = [_make_app(user_id, ApplicationStatus.APPLIED, next_action_date=None)]
    items = compute_attention_items(apps, today)
    assert len(items) == 0


def test_attention_items_capped_at_five() -> None:
    """At most 5 attention items are returned."""
    today = date(2026, 3, 13)
    user_id = uuid.uuid4()

    apps = [
        _make_app(user_id, ApplicationStatus.APPLIED, today - timedelta(days=i), f"Action {i}")
        for i in range(1, 8)
    ]
    items = compute_attention_items(apps, today)
    assert len(items) == 5


def test_overdue_before_upcoming_in_order() -> None:
    """Overdue items appear before upcoming, overdue sorted most-overdue-first."""
    today = date(2026, 3, 13)
    user_id = uuid.uuid4()

    apps = [
        _make_app(user_id, ApplicationStatus.APPLIED, today + timedelta(days=1), "Upcoming 1"),
        _make_app(user_id, ApplicationStatus.APPLIED, today - timedelta(days=5), "Overdue 5"),
        _make_app(user_id, ApplicationStatus.APPLIED, today - timedelta(days=1), "Overdue 1"),
    ]
    items = compute_attention_items(apps, today)
    assert items[0].days_until == -5  # most overdue first
    assert items[1].days_until == -1
    assert items[2].days_until == 1  # upcoming last


def test_upcoming_boundary_exactly_7_days() -> None:
    """next_action_date exactly 7 days away is included; 8 days is not."""
    today = date(2026, 3, 13)
    user_id = uuid.uuid4()

    apps = [
        _make_app(user_id, ApplicationStatus.APPLIED, today + timedelta(days=7), "In window"),
        _make_app(user_id, ApplicationStatus.APPLIED, today + timedelta(days=8), "Out of window"),
    ]
    items = compute_attention_items(apps, today)
    assert len(items) == 1
    assert items[0].days_until == 7


# ─── Unit: compute_pipeline_items ─────────────────────────────────


def test_pipeline_excludes_terminal_statuses() -> None:
    """Pipeline list only contains active-status applications."""
    today = date(2026, 3, 13)
    user_id = uuid.uuid4()

    apps = [
        _make_app(user_id, ApplicationStatus.APPLIED),
        _make_app(user_id, ApplicationStatus.REJECTED),
        _make_app(user_id, ApplicationStatus.ACCEPTED),
    ]
    items = compute_pipeline_items(apps, today)
    assert len(items) == 1
    assert items[0].status == ApplicationStatus.APPLIED


def test_pipeline_sorted_by_next_action_date() -> None:
    """Pipeline sorted by next_action_date ascending; None sorts to end."""
    today = date(2026, 3, 13)
    user_id = uuid.uuid4()

    apps = [
        _make_app(user_id, ApplicationStatus.PHONE_SCREEN, today + timedelta(days=5)),
        _make_app(user_id, ApplicationStatus.APPLIED, today + timedelta(days=2)),
        _make_app(user_id, ApplicationStatus.ONSITE, None),
    ]
    items = compute_pipeline_items(apps, today)
    assert items[0].next_action_date == today + timedelta(days=2)
    assert items[1].next_action_date == today + timedelta(days=5)
    assert items[2].next_action_date is None


# ─── Integration: endpoint ────────────────────────────────────────


@pytest.mark.asyncio
async def test_dashboard_requires_auth(client: AsyncClient) -> None:
    """GET /api/dashboard without token returns 401/403."""
    response = await client.get("/api/dashboard")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_dashboard_empty_for_new_user(
    client: AsyncClient, db_session: AsyncSession, test_settings
) -> None:
    """New user with no applications gets an empty dashboard."""
    _, token = await _register_and_token(db_session, test_settings)

    response = await client.get(
        "/api/dashboard",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["needs_attention"] == []
    assert data["active_pipeline"] == []
    assert data["stats"]["total_active"] == 0
    assert data["stats"]["total_archived"] == 0


@pytest.mark.asyncio
async def test_dashboard_returns_aggregated_data(
    client: AsyncClient, db_session: AsyncSession, test_settings
) -> None:
    """Dashboard endpoint returns correctly shaped aggregated data."""
    from datetime import timedelta

    user_id, token = await _register_and_token(db_session, test_settings)
    today = date.today()

    # Create applications directly in DB
    apps = [
        Application(
            id=uuid.uuid4(),
            user_id=user_id,
            company="Stripe",
            role="Senior SWE",
            status=ApplicationStatus.PHONE_SCREEN,
            applied_date=today - timedelta(days=14),
            next_action="Technical interview",
            next_action_date=today + timedelta(days=2),
        ),
        Application(
            id=uuid.uuid4(),
            user_id=user_id,
            company="Vercel",
            role="Staff Engineer",
            status=ApplicationStatus.APPLIED,
            applied_date=today - timedelta(days=7),
            next_action="Follow up",
            next_action_date=today - timedelta(days=3),  # overdue
        ),
        Application(
            id=uuid.uuid4(),
            user_id=user_id,
            company="Acme",
            role="Engineer",
            status=ApplicationStatus.REJECTED,
            applied_date=today - timedelta(days=30),
        ),
    ]
    for app in apps:
        db_session.add(app)
    await db_session.commit()

    response = await client.get(
        "/api/dashboard",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()

    # Validate schema shape
    summary = DashboardSummary.model_validate(data)

    assert summary.stats.total_active == 2
    assert summary.stats.total_archived == 1

    # Overdue item should appear first
    assert len(summary.needs_attention) >= 1
    overdue = [i for i in summary.needs_attention if i.attention_type == "overdue"]
    assert len(overdue) == 1
    assert overdue[0].company == "Vercel"
    assert overdue[0].days_until < 0

    upcoming = [i for i in summary.needs_attention if i.attention_type == "upcoming"]
    assert len(upcoming) == 1
    assert upcoming[0].company == "Stripe"

    # Pipeline contains only active applications
    assert len(summary.active_pipeline) == 2
    companies = [p.company for p in summary.active_pipeline]
    assert "Acme" not in companies


@pytest.mark.asyncio
async def test_dashboard_does_not_leak_other_users_data(
    client: AsyncClient, db_session: AsyncSession, test_settings
) -> None:
    """Dashboard only returns data for the authenticated user."""

    user_id_a, token_a = await _register_and_token(db_session, test_settings)
    user_id_b, _ = await _register_and_token(db_session, test_settings)
    today = date.today()

    # User B has an application, user A has none
    app_b = Application(
        id=uuid.uuid4(),
        user_id=user_id_b,
        company="Other Co",
        role="Role",
        status=ApplicationStatus.APPLIED,
        applied_date=today,
    )
    db_session.add(app_b)
    await db_session.commit()

    response = await client.get(
        "/api/dashboard",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["active_pipeline"] == []
    assert data["stats"]["total_active"] == 0
