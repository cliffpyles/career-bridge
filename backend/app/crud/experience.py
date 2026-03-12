"""ExperienceCRUD — extends BaseCRUD with tag filtering, type filtering, and full-text search."""

import uuid

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.base import BaseCRUD
from app.models.experience import Experience, ExperienceType
from app.schemas.experience import ExperienceCreate, ExperienceUpdate


class ExperienceCRUD(BaseCRUD[Experience, ExperienceCreate, ExperienceUpdate]):
    model = Experience

    async def list_for_user(
        self,
        user_id: uuid.UUID,
        *,
        type: ExperienceType | None = None,
        tag: str | None = None,
        q: str | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Experience]:
        """List experiences for a user with optional type, tag, and text filters."""
        stmt = sa.select(Experience).where(Experience.user_id == user_id)

        if type is not None:
            stmt = stmt.where(Experience.type == type)

        if tag is not None:
            # Filter by tag presence in the JSON array
            # Works with both PostgreSQL JSON and SQLite JSON
            stmt = stmt.where(
                sa.func.json_each.table_valued(Experience.tags).c.value == tag  # type: ignore[attr-defined]
            )

        if q is not None and q.strip():
            search_term = f"%{q.strip().lower()}%"
            stmt = stmt.where(
                sa.or_(
                    sa.func.lower(Experience.title).like(search_term),
                    sa.func.lower(sa.func.coalesce(Experience.description, "")).like(search_term),
                    sa.func.lower(sa.func.coalesce(Experience.organization, "")).like(search_term),
                    sa.func.lower(sa.func.coalesce(Experience.impact_metrics, "")).like(
                        search_term
                    ),
                )
            )

        stmt = stmt.order_by(Experience.updated_at.desc()).offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_for_user(self, id: uuid.UUID, user_id: uuid.UUID) -> Experience | None:
        """Fetch a single experience, verifying it belongs to the user."""
        stmt = sa.select(Experience).where(
            Experience.id == id,
            Experience.user_id == user_id,
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def count_for_user(self, user_id: uuid.UUID) -> int:
        """Count experiences for a user."""
        stmt = (
            sa.select(sa.func.count()).select_from(Experience).where(Experience.user_id == user_id)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one()


def get_experience_crud(db: AsyncSession) -> ExperienceCRUD:
    return ExperienceCRUD(db)
