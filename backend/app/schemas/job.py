"""Pydantic schemas for Job and SavedJob request/response."""

import uuid
from datetime import date, datetime
from typing import Annotated

from pydantic import BaseModel, Field

from app.models.job import RemoteType


class JobCreate(BaseModel):
    title: Annotated[str, Field(min_length=1, max_length=500)]
    company: Annotated[str, Field(min_length=1, max_length=500)]
    location: str | None = None
    remote_type: RemoteType | None = None
    salary_min: int | None = None
    salary_max: int | None = None
    description: str | None = None
    url: str | None = None
    source: str | None = "manual"
    posted_date: date | None = None


class JobUpdate(BaseModel):
    title: Annotated[str, Field(min_length=1, max_length=500)] | None = None
    company: Annotated[str, Field(min_length=1, max_length=500)] | None = None
    location: str | None = None
    remote_type: RemoteType | None = None
    salary_min: int | None = None
    salary_max: int | None = None
    description: str | None = None
    url: str | None = None
    source: str | None = None
    posted_date: date | None = None


class JobResponse(BaseModel):
    id: uuid.UUID
    title: str
    company: str
    location: str | None
    remote_type: RemoteType | None
    salary_min: int | None
    salary_max: int | None
    description: str | None
    url: str | None
    source: str | None
    posted_date: date | None
    created_at: datetime
    # Computed fields — added by the router, not stored on the model
    match_score: int | None = None
    is_saved: bool = False

    model_config = {"from_attributes": True}


class SavedJobCreate(BaseModel):
    job_id: uuid.UUID
    notes: str | None = None


class SavedJobResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    job_id: uuid.UUID
    saved_at: datetime
    notes: str | None
    job: JobResponse

    model_config = {"from_attributes": True}


class JobFilters(BaseModel):
    q: str | None = None
    location: str | None = None
    remote_type: RemoteType | None = None
    salary_min: int | None = None
    salary_max: int | None = None
    skip: int = Field(default=0, ge=0)
    limit: int = Field(default=50, ge=1, le=200)
