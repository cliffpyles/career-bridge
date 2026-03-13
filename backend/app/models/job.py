"""Job and SavedJob models — job board and saved jobs."""

import uuid
from datetime import date, datetime, timezone
from enum import Enum

import sqlalchemy as sa
from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class RemoteType(str, Enum):
    REMOTE = "REMOTE"
    HYBRID = "HYBRID"
    ONSITE = "ONSITE"


class Job(SQLModel, table=True):
    __tablename__ = "jobs"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
    )
    title: str = Field(index=True)
    company: str = Field(index=True)
    location: str | None = Field(default=None, index=True)
    # Stored as VARCHAR to avoid PostgreSQL named enum type complexity
    remote_type: str | None = Field(
        default=None,
        sa_column=sa.Column(sa.String(), nullable=True, index=True),
    )
    salary_min: int | None = Field(default=None)
    salary_max: int | None = Field(default=None)
    description: str | None = Field(default=None)
    url: str | None = Field(default=None)
    source: str | None = Field(default=None)  # "manual", "linkedin", "indeed", etc.
    posted_date: date | None = Field(
        default=None,
        sa_column=sa.Column(sa.Date(), nullable=True),
    )
    created_at: datetime = Field(
        default_factory=utcnow,
        sa_column=sa.Column(sa.DateTime(timezone=True), nullable=False),
    )


class SavedJob(SQLModel, table=True):
    __tablename__ = "saved_jobs"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
    )
    user_id: uuid.UUID = Field(index=True)
    job_id: uuid.UUID = Field(
        sa_column=sa.Column(
            sa.Uuid(),
            sa.ForeignKey("jobs.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        )
    )
    saved_at: datetime = Field(
        default_factory=utcnow,
        sa_column=sa.Column(sa.DateTime(timezone=True), nullable=False),
    )
    notes: str | None = Field(default=None)
