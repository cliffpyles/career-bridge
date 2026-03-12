"""Resume and ResumeVersion models."""

import uuid
from datetime import datetime, timezone
from typing import Any

import sqlalchemy as sa
from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Resume(SQLModel, table=True):
    __tablename__ = "resumes"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
    )
    user_id: uuid.UUID = Field(index=True)
    name: str = Field(index=True)
    version: int = Field(default=1)
    # Structured array of section objects stored as JSONB
    sections: list[Any] = Field(
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


class ResumeVersion(SQLModel, table=True):
    __tablename__ = "resume_versions"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
    )
    resume_id: uuid.UUID = Field(index=True)
    version: int
    name: str
    sections: list[Any] = Field(
        default_factory=list,
        sa_column=sa.Column(sa.JSON, nullable=False, server_default="[]"),
    )
    created_at: datetime = Field(
        default_factory=utcnow,
        sa_column=sa.Column(sa.DateTime(timezone=True), nullable=False),
    )
