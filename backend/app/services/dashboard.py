"""Dashboard service — aggregates application data for the landing page."""

import uuid
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application, ApplicationStatus
from app.schemas.dashboard import AttentionItem, DashboardStats, DashboardSummary, PipelineItem

# Active statuses — applications still in the pipeline
_ACTIVE_STATUSES: set[ApplicationStatus] = {
    ApplicationStatus.APPLIED,
    ApplicationStatus.PHONE_SCREEN,
    ApplicationStatus.TECHNICAL,
    ApplicationStatus.ONSITE,
    ApplicationStatus.OFFER,
}

# Terminal statuses — archived applications
_TERMINAL_STATUSES: set[ApplicationStatus] = {
    ApplicationStatus.ACCEPTED,
    ApplicationStatus.REJECTED,
}

# How many days ahead counts as "upcoming"
_UPCOMING_WINDOW_DAYS = 7

# Max items in needs-attention list shown on the dashboard
_MAX_ATTENTION_ITEMS = 5


def compute_attention_items(
    applications: list[Application],
    today: date,
) -> list[AttentionItem]:
    """
    Determine which applications need attention.

    - Overdue: next_action_date < today
    - Upcoming: 0 <= days_until <= _UPCOMING_WINDOW_DAYS
    Sorted: overdue first (most overdue first), then upcoming (soonest first).
    """
    overdue: list[AttentionItem] = []
    upcoming: list[AttentionItem] = []

    for app in applications:
        if app.status in _TERMINAL_STATUSES:
            continue
        if app.next_action_date is None:
            continue

        days_until = (app.next_action_date - today).days

        if days_until < 0:
            overdue.append(
                AttentionItem(
                    application_id=app.id,
                    company=app.company,
                    role=app.role,
                    status=app.status,
                    next_action=app.next_action,
                    next_action_date=app.next_action_date,
                    days_until=days_until,
                    attention_type="overdue",
                )
            )
        elif days_until <= _UPCOMING_WINDOW_DAYS:
            upcoming.append(
                AttentionItem(
                    application_id=app.id,
                    company=app.company,
                    role=app.role,
                    status=app.status,
                    next_action=app.next_action,
                    next_action_date=app.next_action_date,
                    days_until=days_until,
                    attention_type="upcoming",
                )
            )

    # Sort overdue: most overdue first (most negative days_until first)
    overdue.sort(key=lambda x: x.days_until)
    # Sort upcoming: soonest first
    upcoming.sort(key=lambda x: x.days_until)

    return (overdue + upcoming)[:_MAX_ATTENTION_ITEMS]


def compute_pipeline_items(
    applications: list[Application],
    today: date,
) -> list[PipelineItem]:
    """
    Build the active pipeline list — in-progress applications sorted by
    next_action_date (soonest first; None sorts to end).
    """
    active = [app for app in applications if app.status in _ACTIVE_STATUSES]

    active.sort(
        key=lambda a: (
            a.next_action_date is None,
            a.next_action_date or date.max,
        )
    )

    return [
        PipelineItem(
            application_id=app.id,
            company=app.company,
            role=app.role,
            status=app.status,
            next_action=app.next_action,
            next_action_date=app.next_action_date,
        )
        for app in active
    ]


class DashboardService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_summary(self, user_id: uuid.UUID) -> DashboardSummary:
        result = await self._db.execute(select(Application).where(Application.user_id == user_id))
        applications: list[Application] = list(result.scalars().all())
        today = date.today()

        needs_attention = compute_attention_items(applications, today)
        active_pipeline = compute_pipeline_items(applications, today)

        total_active = sum(1 for a in applications if a.status in _ACTIVE_STATUSES)
        total_archived = sum(1 for a in applications if a.status in _TERMINAL_STATUSES)

        return DashboardSummary(
            needs_attention=needs_attention,
            active_pipeline=active_pipeline,
            stats=DashboardStats(
                total_active=total_active,
                total_archived=total_archived,
            ),
        )
