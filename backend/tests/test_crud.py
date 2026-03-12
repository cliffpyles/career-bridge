"""
Tests for BaseCRUD[T] generic CRUD operations.
Uses the User model as the test subject.
"""
import pytest
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.base import BaseCRUD
from app.models.user import User


class UserCreate(BaseModel):
    email: str
    name: str = ""
    hashed_password: str = ""
    is_active: bool = True
    is_verified: bool = False


class UserUpdate(BaseModel):
    name: str | None = None
    is_active: bool | None = None


class UserCRUD(BaseCRUD[User, UserCreate, UserUpdate]):
    model = User


@pytest.fixture
def user_crud(db_session: AsyncSession) -> UserCRUD:
    return UserCRUD(db_session)


@pytest.mark.asyncio
async def test_create(user_crud: UserCRUD) -> None:
    """BaseCRUD.create persists a new record and returns it."""
    user = await user_crud.create(UserCreate(email="test@example.com", name="Test User"))
    assert user.id is not None
    assert user.email == "test@example.com"
    assert user.name == "Test User"


@pytest.mark.asyncio
async def test_get(user_crud: UserCRUD) -> None:
    """BaseCRUD.get retrieves by primary key."""
    created = await user_crud.create(UserCreate(email="get@example.com"))
    fetched = await user_crud.get(created.id)
    assert fetched is not None
    assert fetched.id == created.id


@pytest.mark.asyncio
async def test_get_returns_none_for_missing(user_crud: UserCRUD) -> None:
    """BaseCRUD.get returns None for unknown ID."""
    import uuid
    result = await user_crud.get(uuid.uuid4())
    assert result is None


@pytest.mark.asyncio
async def test_get_or_404_raises_for_missing(user_crud: UserCRUD) -> None:
    """BaseCRUD.get_or_404 raises 404 HTTPException for missing records."""
    import uuid
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as exc_info:
        await user_crud.get_or_404(uuid.uuid4())
    assert exc_info.value.status_code == 404


@pytest.mark.asyncio
async def test_list(user_crud: UserCRUD) -> None:
    """BaseCRUD.list returns all records."""
    await user_crud.create(UserCreate(email="a@example.com"))
    await user_crud.create(UserCreate(email="b@example.com"))
    users = await user_crud.list()
    assert len(users) >= 2


@pytest.mark.asyncio
async def test_list_with_filter(user_crud: UserCRUD) -> None:
    """BaseCRUD.list supports equality filters."""
    await user_crud.create(UserCreate(email="active@example.com", is_active=True))
    await user_crud.create(UserCreate(email="inactive@example.com", is_active=False))
    active_users = await user_crud.list(is_active=True)
    inactive_users = await user_crud.list(is_active=False)
    assert all(u.is_active for u in active_users)
    assert all(not u.is_active for u in inactive_users)


@pytest.mark.asyncio
async def test_list_pagination(user_crud: UserCRUD) -> None:
    """BaseCRUD.list respects skip and limit."""
    for i in range(5):
        await user_crud.create(UserCreate(email=f"user{i}@example.com"))
    page = await user_crud.list(skip=0, limit=2)
    assert len(page) == 2


@pytest.mark.asyncio
async def test_update(user_crud: UserCRUD) -> None:
    """BaseCRUD.update applies partial updates."""
    user = await user_crud.create(UserCreate(email="update@example.com", name="Before"))
    updated = await user_crud.update(user, UserUpdate(name="After"))
    assert updated.name == "After"
    assert updated.email == "update@example.com"


@pytest.mark.asyncio
async def test_delete(user_crud: UserCRUD) -> None:
    """BaseCRUD.delete removes the record."""
    user = await user_crud.create(UserCreate(email="delete@example.com"))
    user_id = user.id
    await user_crud.delete(user)
    result = await user_crud.get(user_id)
    assert result is None


@pytest.mark.asyncio
async def test_count(user_crud: UserCRUD) -> None:
    """BaseCRUD.count returns the correct count."""
    await user_crud.create(UserCreate(email="count1@example.com"))
    await user_crud.create(UserCreate(email="count2@example.com"))
    count = await user_crud.count()
    assert count >= 2
