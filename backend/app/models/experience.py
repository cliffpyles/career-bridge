"""Experience model — career history entries."""

import uuid
from datetime import date, datetime, timezone
from enum import Enum
from typing import Any

import sqlalchemy as sa
from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class ExperienceType(str, Enum):
    PROJECT = "PROJECT"
    ROLE = "ROLE"
    SKILL = "SKILL"
    ACHIEVEMENT = "ACHIEVEMENT"
    CERTIFICATION = "CERTIFICATION"


class Experience(SQLModel, table=True):
    __tablename__ = "experiences"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
    )
    user_id: uuid.UUID = Field(index=True)
    type: ExperienceType = Field(index=True)
    title: str = Field(index=True)
    organization: str | None = Field(default=None)
    start_date: date | None = Field(default=None)
    end_date: date | None = Field(default=None)
    description: str | None = Field(default=None)
    impact_metrics: str | None = Field(default=None)
    # Stored as JSON array; SQLite-safe for tests, PostgreSQL JSONB in production
    tags: list[Any] = Field(
        default_factory=list,
        sa_column=sa.Column(sa.JSON, nullable=False, server_default="[]"),
    )
    created_at: datetime = Field(
        default_factory=utcnow,
        sa_column=sa.Column(sa.DateTime(timezone=True), nullable=False),
    )
    updated_at: datetime = Field(
        default_factory=utcnow,
        sa_column=sa.Column(sa.DateTime(timezone=True), nullable=False),
    )
