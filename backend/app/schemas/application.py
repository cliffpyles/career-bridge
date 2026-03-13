"""Pydantic schemas for Application and ApplicationEvent request/response."""

import uuid
from datetime import date, datetime
from typing import Annotated

from pydantic import BaseModel, Field

from app.models.application import ApplicationStatus


class ApplicationCreate(BaseModel):
    company: Annotated[str, Field(min_length=1, max_length=500)]
    role: Annotated[str, Field(min_length=1, max_length=500)]
    url: str | None = None
    status: ApplicationStatus = ApplicationStatus.APPLIED
    applied_date: date
    next_action: str | None = None
    next_action_date: date | None = None
    resume_id: uuid.UUID | None = None
    notes: str | None = None


class ApplicationUpdate(BaseModel):
    company: Annotated[str, Field(min_length=1, max_length=500)] | None = None
    role: Annotated[str, Field(min_length=1, max_length=500)] | None = None
    url: str | None = None
    status: ApplicationStatus | None = None
    applied_date: date | None = None
    next_action: str | None = None
    next_action_date: date | None = None
    resume_id: uuid.UUID | None = None
    notes: str | None = None


class ApplicationResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    company: str
    role: str
    url: str | None
    status: ApplicationStatus
    applied_date: date
    next_action: str | None
    next_action_date: date | None
    resume_id: uuid.UUID | None
    notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ApplicationFilters(BaseModel):
    status: ApplicationStatus | None = None
    sort: str = Field(default="recent")  # "recent" | "next_action"
    skip: int = Field(default=0, ge=0)
    limit: int = Field(default=100, ge=1, le=500)


# ─── Application Events ───────────────────────────────────────────────────────


class ApplicationEventCreate(BaseModel):
    event_type: Annotated[str, Field(min_length=1, max_length=200)]
    event_date: date
    notes: str | None = None


class ApplicationEventResponse(BaseModel):
    id: uuid.UUID
    application_id: uuid.UUID
    event_type: str
    event_date: date
    notes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
