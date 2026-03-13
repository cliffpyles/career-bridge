"""JobCRUD and SavedJobCRUD — job board data access."""

import uuid

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.base import BaseCRUD
from app.models.job import Job, SavedJob
from app.schemas.job import JobCreate, JobUpdate, SavedJobCreate


class JobCRUD(BaseCRUD[Job, JobCreate, JobUpdate]):
    model = Job

    async def search(
        self,
        *,
        q: str | None = None,
        location: str | None = None,
        remote_type: str | None = None,
        salary_min: int | None = None,
        salary_max: int | None = None,
        skip: int = 0,
        limit: int = 50,
    ) -> list[Job]:
        """Search jobs with optional text search, location, remote type, and salary filters."""
        stmt = sa.select(Job)

        if q:
            pattern = f"%{q.lower()}%"
            stmt = stmt.where(
                sa.or_(
                    sa.func.lower(Job.title).like(pattern),
                    sa.func.lower(Job.company).like(pattern),
                    sa.func.lower(Job.description).like(pattern),
                )
            )

        if location:
            stmt = stmt.where(sa.func.lower(Job.location).like(f"%{location.lower()}%"))

        if remote_type:
            stmt = stmt.where(Job.remote_type == remote_type)

        if salary_min is not None:
            # Job must have salary_max >= requested minimum
            stmt = stmt.where(
                sa.or_(
                    Job.salary_max >= salary_min,
                    sa.and_(Job.salary_min.is_(None), Job.salary_max.is_(None)),
                )
            )

        if salary_max is not None:
            # Job must have salary_min <= requested maximum
            stmt = stmt.where(
                sa.or_(
                    Job.salary_min <= salary_max,
                    sa.and_(Job.salary_min.is_(None), Job.salary_max.is_(None)),
                )
            )

        stmt = stmt.order_by(Job.posted_date.desc().nulls_last(), Job.created_at.desc())
        stmt = stmt.offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())


class SavedJobCRUD(BaseCRUD[SavedJob, SavedJobCreate, SavedJobCreate]):
    model = SavedJob

    async def get_by_user_and_job(self, user_id: uuid.UUID, job_id: uuid.UUID) -> SavedJob | None:
        """Fetch a SavedJob row by user and job ID."""
        stmt = sa.select(SavedJob).where(
            SavedJob.user_id == user_id,
            SavedJob.job_id == job_id,
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_for_user(
        self,
        user_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> list[SavedJob]:
        """List all saved jobs for a user, newest first."""
        stmt = (
            sa.select(SavedJob)
            .where(SavedJob.user_id == user_id)
            .order_by(SavedJob.saved_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_saved_job_ids_for_user(self, user_id: uuid.UUID) -> set[uuid.UUID]:
        """Return the set of job IDs the user has saved — used for bulk is_saved annotation."""
        stmt = sa.select(SavedJob.job_id).where(SavedJob.user_id == user_id)
        result = await self.db.execute(stmt)
        return {row[0] for row in result}


def get_job_crud(db: AsyncSession) -> JobCRUD:
    return JobCRUD(db)


def get_saved_job_crud(db: AsyncSession) -> SavedJobCRUD:
    return SavedJobCRUD(db)
