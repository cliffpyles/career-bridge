"""
Tests for Experience CRUD and router.
Covers: create, filter by type and tags, full-text search, PATCH, DELETE.
"""

import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.experience import ExperienceCRUD
from app.models.experience import ExperienceType
from app.schemas.experience import ExperienceCreate, ExperienceUpdate
from app.services.auth import AuthService

# ─── Helpers ─────────────────────────────────────────────────────


def make_crud(db: AsyncSession) -> ExperienceCRUD:
    return ExperienceCRUD(db)


async def create_test_user(db: AsyncSession, settings) -> tuple[uuid.UUID, str]:
    """Register a user and return (user_id, token)."""
    auth_service = AuthService(settings)
    user = await auth_service.register_user(
        db,
        email=f"exp-{uuid.uuid4().hex[:8]}@example.com",
        password="testpass123",
        name="Test User",
    )
    token, _ = auth_service.create_access_token(str(user.id))
    return user.id, token


# ─── CRUD unit tests ─────────────────────────────────────────────


@pytest.mark.asyncio
async def test_create_experience(db_session: AsyncSession) -> None:
    """ExperienceCRUD.create persists a new experience."""
    crud = make_crud(db_session)
    user_id = uuid.uuid4()
    exp = await crud.create(
        ExperienceCreate(
            type=ExperienceType.PROJECT,
            title="Redesigned checkout flow",
            organization="Acme Corp",
            description="Reduced cart abandonment by 23%.",
            tags=["react", "typescript"],
        ),
        user_id=user_id,
    )
    assert exp.id is not None
    assert exp.user_id == user_id
    assert exp.type == ExperienceType.PROJECT
    assert exp.title == "Redesigned checkout flow"
    assert "react" in exp.tags


@pytest.mark.asyncio
async def test_list_for_user_filters_by_type(db_session: AsyncSession) -> None:
    """list_for_user returns only entries matching the requested type."""
    crud = make_crud(db_session)
    user_id = uuid.uuid4()

    await crud.create(
        ExperienceCreate(type=ExperienceType.PROJECT, title="Project A"), user_id=user_id
    )
    await crud.create(ExperienceCreate(type=ExperienceType.SKILL, title="Python"), user_id=user_id)
    await crud.create(
        ExperienceCreate(type=ExperienceType.CERTIFICATION, title="AWS SAA"), user_id=user_id
    )

    projects = await crud.list_for_user(user_id, type=ExperienceType.PROJECT)
    skills = await crud.list_for_user(user_id, type=ExperienceType.SKILL)

    assert all(e.type == ExperienceType.PROJECT for e in projects)
    assert all(e.type == ExperienceType.SKILL for e in skills)
    assert len(projects) == 1
    assert len(skills) == 1


@pytest.mark.asyncio
async def test_list_for_user_excludes_other_users(db_session: AsyncSession) -> None:
    """list_for_user never returns another user's entries."""
    crud = make_crud(db_session)
    user_a = uuid.uuid4()
    user_b = uuid.uuid4()

    await crud.create(
        ExperienceCreate(type=ExperienceType.ROLE, title="User A Role"), user_id=user_a
    )
    await crud.create(
        ExperienceCreate(type=ExperienceType.ROLE, title="User B Role"), user_id=user_b
    )

    results_a = await crud.list_for_user(user_a)
    assert all(e.user_id == user_a for e in results_a)
    assert not any(e.title == "User B Role" for e in results_a)


@pytest.mark.asyncio
async def test_full_text_search(db_session: AsyncSession) -> None:
    """list_for_user filters by q across title, description, organization."""
    crud = make_crud(db_session)
    user_id = uuid.uuid4()

    await crud.create(
        ExperienceCreate(
            type=ExperienceType.PROJECT,
            title="Microservices migration",
            description="Moved to event-driven architecture",
        ),
        user_id=user_id,
    )
    await crud.create(
        ExperienceCreate(
            type=ExperienceType.SKILL,
            title="System Design",
            organization="Personal",
        ),
        user_id=user_id,
    )

    results = await crud.list_for_user(user_id, q="microservices")
    assert len(results) == 1
    assert results[0].title == "Microservices migration"

    results_org = await crud.list_for_user(user_id, q="personal")
    assert len(results_org) == 1
    assert results_org[0].title == "System Design"


@pytest.mark.asyncio
async def test_update_experience(db_session: AsyncSession) -> None:
    """update applies partial changes and bumps updated_at."""
    crud = make_crud(db_session)
    user_id = uuid.uuid4()
    exp = await crud.create(
        ExperienceCreate(type=ExperienceType.ROLE, title="Original Title"),
        user_id=user_id,
    )
    original_updated = exp.updated_at

    updated = await crud.update(exp, ExperienceUpdate(title="Updated Title", tags=["leadership"]))
    assert updated.title == "Updated Title"
    assert "leadership" in updated.tags
    assert updated.updated_at >= original_updated


@pytest.mark.asyncio
async def test_delete_experience(db_session: AsyncSession) -> None:
    """delete removes the record."""
    crud = make_crud(db_session)
    user_id = uuid.uuid4()
    exp = await crud.create(
        ExperienceCreate(type=ExperienceType.ACHIEVEMENT, title="Won hackathon"),
        user_id=user_id,
    )
    exp_id = exp.id
    await crud.delete(exp)
    result = await crud.get_for_user(exp_id, user_id)
    assert result is None


@pytest.mark.asyncio
async def test_get_for_user_returns_none_for_wrong_user(db_session: AsyncSession) -> None:
    """get_for_user does not return entries owned by another user."""
    crud = make_crud(db_session)
    owner_id = uuid.uuid4()
    other_id = uuid.uuid4()
    exp = await crud.create(
        ExperienceCreate(type=ExperienceType.PROJECT, title="Private Project"),
        user_id=owner_id,
    )
    result = await crud.get_for_user(exp.id, other_id)
    assert result is None


# ─── Router integration tests ────────────────────────────────────


@pytest.mark.asyncio
async def test_router_create_experience(
    client: AsyncClient, db_session: AsyncSession, test_settings
) -> None:
    """POST /api/experiences creates an entry, returns 201."""
    _, token = await create_test_user(db_session, test_settings)

    response = await client.post(
        "/api/experiences",
        json={
            "type": "PROJECT",
            "title": "Built a recommendation engine",
            "organization": "Startup Inc",
            "description": "Improved CTR by 40% using collaborative filtering.",
            "tags": ["python", "machine-learning"],
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Built a recommendation engine"
    assert data["type"] == "PROJECT"
    assert "python" in data["tags"]
    assert "id" in data


@pytest.mark.asyncio
async def test_router_list_experiences(
    client: AsyncClient, db_session: AsyncSession, test_settings
) -> None:
    """GET /api/experiences returns all entries for the authenticated user."""
    _, token = await create_test_user(db_session, test_settings)
    headers = {"Authorization": f"Bearer {token}"}

    await client.post(
        "/api/experiences", json={"type": "SKILL", "title": "TypeScript"}, headers=headers
    )
    await client.post(
        "/api/experiences", json={"type": "SKILL", "title": "PostgreSQL"}, headers=headers
    )

    response = await client.get("/api/experiences", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    titles = {e["title"] for e in data}
    assert titles == {"TypeScript", "PostgreSQL"}


@pytest.mark.asyncio
async def test_router_filter_by_type(
    client: AsyncClient, db_session: AsyncSession, test_settings
) -> None:
    """GET /api/experiences?type=ROLE returns only ROLE entries."""
    _, token = await create_test_user(db_session, test_settings)
    headers = {"Authorization": f"Bearer {token}"}

    await client.post(
        "/api/experiences", json={"type": "ROLE", "title": "Senior Engineer"}, headers=headers
    )
    await client.post("/api/experiences", json={"type": "SKILL", "title": "Go"}, headers=headers)

    response = await client.get("/api/experiences?type=ROLE", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["type"] == "ROLE"


@pytest.mark.asyncio
async def test_router_search(client: AsyncClient, db_session: AsyncSession, test_settings) -> None:
    """GET /api/experiences?q= filters by keyword."""
    _, token = await create_test_user(db_session, test_settings)
    headers = {"Authorization": f"Bearer {token}"}

    await client.post(
        "/api/experiences",
        json={
            "type": "PROJECT",
            "title": "GraphQL API gateway",
            "description": "Built with Node.js",
        },
        headers=headers,
    )
    await client.post(
        "/api/experiences",
        json={"type": "SKILL", "title": "React Native"},
        headers=headers,
    )

    response = await client.get("/api/experiences?q=graphql", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert "GraphQL" in data[0]["title"]


@pytest.mark.asyncio
async def test_router_update_experience(
    client: AsyncClient, db_session: AsyncSession, test_settings
) -> None:
    """PATCH /api/experiences/:id updates fields."""
    _, token = await create_test_user(db_session, test_settings)
    headers = {"Authorization": f"Bearer {token}"}

    create_resp = await client.post(
        "/api/experiences",
        json={"type": "CERTIFICATION", "title": "AWS Cloud Practitioner"},
        headers=headers,
    )
    exp_id = create_resp.json()["id"]

    patch_resp = await client.patch(
        f"/api/experiences/{exp_id}",
        json={"title": "AWS Solutions Architect Associate", "tags": ["cloud", "aws"]},
        headers=headers,
    )
    assert patch_resp.status_code == 200
    updated = patch_resp.json()
    assert updated["title"] == "AWS Solutions Architect Associate"
    assert "aws" in updated["tags"]


@pytest.mark.asyncio
async def test_router_delete_experience(
    client: AsyncClient, db_session: AsyncSession, test_settings
) -> None:
    """DELETE /api/experiences/:id removes the entry, returns 204."""
    _, token = await create_test_user(db_session, test_settings)
    headers = {"Authorization": f"Bearer {token}"}

    create_resp = await client.post(
        "/api/experiences",
        json={"type": "ACHIEVEMENT", "title": "Employee of the Quarter"},
        headers=headers,
    )
    exp_id = create_resp.json()["id"]

    delete_resp = await client.delete(f"/api/experiences/{exp_id}", headers=headers)
    assert delete_resp.status_code == 204

    get_resp = await client.get(f"/api/experiences/{exp_id}", headers=headers)
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_router_requires_auth(client: AsyncClient) -> None:
    """All experience endpoints require authentication."""
    response = await client.get("/api/experiences")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_router_cannot_access_other_users_experience(
    client: AsyncClient, db_session: AsyncSession, test_settings
) -> None:
    """Users cannot read or modify another user's experience entries."""
    _, token_a = await create_test_user(db_session, test_settings)
    _, token_b = await create_test_user(db_session, test_settings)

    create_resp = await client.post(
        "/api/experiences",
        json={"type": "PROJECT", "title": "Private Work"},
        headers={"Authorization": f"Bearer {token_a}"},
    )
    exp_id = create_resp.json()["id"]

    get_resp = await client.get(
        f"/api/experiences/{exp_id}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert get_resp.status_code == 404

    delete_resp = await client.delete(
        f"/api/experiences/{exp_id}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert delete_resp.status_code == 404
