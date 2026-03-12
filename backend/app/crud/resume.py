"""ResumeCRUD — CRUD operations for resumes with version management."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import select

from app.crud.base import BaseCRUD
from app.models.resume import Resume, ResumeVersion
from app.schemas.resume import ResumeCreate, ResumeUpdate


class ResumeCRUD(BaseCRUD[Resume, ResumeCreate, ResumeUpdate]):
    model = Resume

    async def create(self, data: ResumeCreate, **extra: object) -> Resume:
        resume = await super().create(data, **extra)
        # Snapshot the initial version
        version = ResumeVersion(
            resume_id=resume.id,
            version=resume.version,
            name=resume.name,
            sections=resume.sections,
        )
        self.db.add(version)
        await self.db.commit()
        await self.db.refresh(resume)
        return resume

    async def list_for_user(
        self,
        user_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Resume]:
        stmt = (
            select(Resume)
            .where(Resume.user_id == user_id)
            .order_by(Resume.updated_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_for_user(
        self,
        resume_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> Resume | None:
        stmt = select(Resume).where(
            Resume.id == resume_id,
            Resume.user_id == user_id,
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def update(self, obj: Resume, data: ResumeUpdate) -> Resume:
        obj.version += 1
        obj.updated_at = datetime.now(timezone.utc)
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(obj, key, value)

        # Snapshot new version after applying changes
        version = ResumeVersion(
            resume_id=obj.id,
            version=obj.version,
            name=obj.name,
            sections=obj.sections,
        )
        self.db.add(version)
        self.db.add(obj)
        await self.db.commit()
        await self.db.refresh(obj)
        return obj

    async def list_versions(self, resume_id: uuid.UUID) -> list[ResumeVersion]:
        stmt = (
            select(ResumeVersion)
            .where(ResumeVersion.resume_id == resume_id)
            .order_by(ResumeVersion.version.desc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def restore_version(
        self,
        resume: Resume,
        version: ResumeVersion,
    ) -> Resume:
        resume.sections = version.sections
        resume.version += 1
        resume.updated_at = datetime.now(timezone.utc)

        restored = ResumeVersion(
            resume_id=resume.id,
            version=resume.version,
            name=resume.name,
            sections=resume.sections,
        )
        self.db.add(restored)
        self.db.add(resume)
        await self.db.commit()
        await self.db.refresh(resume)
        return resume
