"""ApplicationCRUD — extends BaseCRUD with status filtering and event management."""

import uuid

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.base import BaseCRUD
from app.models.application import Application, ApplicationEvent, ApplicationStatus
from app.schemas.application import (
    ApplicationCreate,
    ApplicationEventCreate,
    ApplicationUpdate,
)


class ApplicationCRUD(BaseCRUD[Application, ApplicationCreate, ApplicationUpdate]):
    model = Application

    async def list_for_user(
        self,
        user_id: uuid.UUID,
        *,
        status: ApplicationStatus | None = None,
        sort: str = "recent",
        skip: int = 0,
        limit: int = 100,
    ) -> list[Application]:
        """List applications for a user with optional status filter and sort."""
        stmt = sa.select(Application).where(Application.user_id == user_id)

        if status is not None:
            stmt = stmt.where(Application.status == status)

        if sort == "next_action":
            # Null next_action_date values sort last
            stmt = stmt.order_by(
                sa.nulls_last(Application.next_action_date.asc()),
                Application.updated_at.desc(),
            )
        else:
            stmt = stmt.order_by(Application.updated_at.desc())

        stmt = stmt.offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_for_user(self, id: uuid.UUID, user_id: uuid.UUID) -> Application | None:
        """Fetch a single application, verifying it belongs to the user."""
        stmt = sa.select(Application).where(
            Application.id == id,
            Application.user_id == user_id,
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def count_for_user(
        self, user_id: uuid.UUID, *, status: ApplicationStatus | None = None
    ) -> int:
        """Count applications for a user, optionally filtered by status."""
        stmt = (
            sa.select(sa.func.count())
            .select_from(Application)
            .where(Application.user_id == user_id)
        )
        if status is not None:
            stmt = stmt.where(Application.status == status)
        result = await self.db.execute(stmt)
        return result.scalar_one()

    # ─── Event management ─────────────────────────────────────────────────────

    async def list_events(self, application_id: uuid.UUID) -> list[ApplicationEvent]:
        """List events for an application in reverse-chronological order."""
        stmt = (
            sa.select(ApplicationEvent)
            .where(ApplicationEvent.application_id == application_id)
            .order_by(ApplicationEvent.event_date.desc(), ApplicationEvent.created_at.desc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def create_event(
        self, application_id: uuid.UUID, data: ApplicationEventCreate
    ) -> ApplicationEvent:
        """Create a new event for an application."""
        event = ApplicationEvent(
            application_id=application_id,
            event_type=data.event_type,
            event_date=data.event_date,
            notes=data.notes,
        )
        self.db.add(event)
        await self.db.commit()
        await self.db.refresh(event)
        return event


def get_application_crud(db: AsyncSession) -> ApplicationCRUD:
    return ApplicationCRUD(db)
