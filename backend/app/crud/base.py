"""
BaseCRUD[ModelT, CreateT, UpdateT] — generic CRUD operations.

All domain-specific CRUD classes extend this to get:
  create, get, get_or_404, list, update, delete, soft_delete

Features:
  - Pagination (skip / limit)
  - Optional soft-delete (sets deleted_at instead of removing the row)
  - Arbitrary filter kwargs forwarded as WHERE clauses
"""
from datetime import datetime, timezone
from typing import Any, Generic, TypeVar

from fastapi import HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import SQLModel

ModelT = TypeVar("ModelT", bound=SQLModel)
CreateT = TypeVar("CreateT", bound=BaseModel)
UpdateT = TypeVar("UpdateT", bound=BaseModel)


class BaseCRUD(Generic[ModelT, CreateT, UpdateT]):
    """
    Generic CRUD base class.

    Usage::

        class ExperienceCRUD(BaseCRUD[Experience, ExperienceCreate, ExperienceUpdate]):
            model = Experience
    """

    model: type[ModelT]

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, data: CreateT, **extra: Any) -> ModelT:
        """Create and persist a new record."""
        obj = self.model.model_validate({**data.model_dump(exclude_unset=False), **extra})
        self.db.add(obj)
        await self.db.commit()
        await self.db.refresh(obj)
        return obj

    async def get(self, id: Any) -> ModelT | None:
        """Return a record by primary key, or None."""
        return await self.db.get(self.model, id)

    async def get_or_404(self, id: Any) -> ModelT:
        """Return a record by primary key, or raise 404."""
        obj = await self.get(id)
        if obj is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"{self.model.__name__} not found",
            )
        return obj

    async def list(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        include_deleted: bool = False,
        **filters: Any,
    ) -> list[ModelT]:
        """
        List records with optional filtering, pagination, and soft-delete support.

        Any keyword argument that matches a column on the model is used as a
        WHERE clause (equality filter).
        """
        stmt = select(self.model)

        # Soft-delete support
        if not include_deleted and hasattr(self.model, "deleted_at"):
            stmt = stmt.where(self.model.deleted_at.is_(None))  # type: ignore[attr-defined]

        # Dynamic filters
        for key, value in filters.items():
            if value is not None and hasattr(self.model, key):
                stmt = stmt.where(getattr(self.model, key) == value)

        stmt = stmt.offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def update(self, obj: ModelT, data: UpdateT) -> ModelT:
        """Partially update an existing record with the fields provided in data."""
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(obj, key, value)

        if hasattr(obj, "updated_at"):
            obj.updated_at = datetime.now(timezone.utc)  # type: ignore[attr-defined]

        self.db.add(obj)
        await self.db.commit()
        await self.db.refresh(obj)
        return obj

    async def delete(self, obj: ModelT) -> None:
        """Hard delete a record."""
        await self.db.delete(obj)
        await self.db.commit()

    async def soft_delete(self, obj: ModelT) -> ModelT:
        """
        Soft-delete a record by setting deleted_at.
        Requires the model to have a deleted_at column.
        """
        if not hasattr(obj, "deleted_at"):
            raise TypeError(f"{type(obj).__name__} does not support soft delete")
        obj.deleted_at = datetime.now(timezone.utc)  # type: ignore[attr-defined]
        self.db.add(obj)
        await self.db.commit()
        await self.db.refresh(obj)
        return obj

    async def count(self, **filters: Any) -> int:
        """Return the count of records matching the given filters."""
        from sqlalchemy import func

        stmt = select(func.count()).select_from(self.model)
        for key, value in filters.items():
            if value is not None and hasattr(self.model, key):
                stmt = stmt.where(getattr(self.model, key) == value)
        result = await self.db.execute(stmt)
        return result.scalar_one()
