"""Application and ApplicationEvent models — job application pipeline tracking."""

import uuid
from datetime import date, datetime, timezone
from enum import Enum

import sqlalchemy as sa
from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class ApplicationStatus(str, Enum):
    APPLIED = "APPLIED"
    PHONE_SCREEN = "PHONE_SCREEN"
    TECHNICAL = "TECHNICAL"
    ONSITE = "ONSITE"
    OFFER = "OFFER"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"


APPLICATION_STATUS_ORDER: list[ApplicationStatus] = [
    ApplicationStatus.APPLIED,
    ApplicationStatus.PHONE_SCREEN,
    ApplicationStatus.TECHNICAL,
    ApplicationStatus.ONSITE,
    ApplicationStatus.OFFER,
    ApplicationStatus.ACCEPTED,
    ApplicationStatus.REJECTED,
]


class Application(SQLModel, table=True):
    __tablename__ = "applications"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
    )
    user_id: uuid.UUID = Field(index=True)
    company: str = Field(index=True)
    role: str = Field(index=True)
    url: str | None = Field(default=None)
    # Stored as VARCHAR to avoid PostgreSQL named enum type
    status: ApplicationStatus = Field(
        sa_column=sa.Column(sa.String(), nullable=False, index=True),
    )
    applied_date: date = Field(
        sa_column=sa.Column(sa.Date(), nullable=False),
    )
    next_action: str | None = Field(default=None)
    next_action_date: date | None = Field(
        default=None,
        sa_column=sa.Column(sa.Date(), nullable=True, index=True),
    )
    # FK to resumes — nullable (user may not have linked a resume yet)
    resume_id: uuid.UUID | None = Field(default=None, index=True)
    notes: str | None = Field(default=None)
    created_at: datetime = Field(
        default_factory=utcnow,
        sa_column=sa.Column(sa.DateTime(timezone=True), nullable=False),
    )
    updated_at: datetime = Field(
        default_factory=utcnow,
        sa_column=sa.Column(sa.DateTime(timezone=True), nullable=False),
    )


class ApplicationEvent(SQLModel, table=True):
    __tablename__ = "application_events"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
    )
    application_id: uuid.UUID = Field(index=True)
    event_type: str = Field(index=True)
    # Named `event_date` to avoid shadowing the `date` built-in type.
    event_date: date = Field(
        sa_column=sa.Column("date", sa.Date(), nullable=False),
    )
    notes: str | None = Field(default=None)
    created_at: datetime = Field(
        default_factory=utcnow,
        sa_column=sa.Column(sa.DateTime(timezone=True), nullable=False),
    )
