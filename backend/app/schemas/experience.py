"""Pydantic schemas for Experience request/response."""

import uuid
from datetime import date, datetime
from typing import Annotated

from pydantic import BaseModel, Field, field_validator

from app.models.experience import ExperienceType


class ExperienceCreate(BaseModel):
    type: ExperienceType
    title: Annotated[str, Field(min_length=1, max_length=500)]
    organization: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    description: str | None = None
    impact_metrics: str | None = None
    tags: list[str] = Field(default_factory=list)

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: list[str]) -> list[str]:
        cleaned = [tag.strip().lower() for tag in v if tag.strip()]
        return list(dict.fromkeys(cleaned))  # deduplicate while preserving order


class ExperienceUpdate(BaseModel):
    type: ExperienceType | None = None
    title: Annotated[str, Field(min_length=1, max_length=500)] | None = None
    organization: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    description: str | None = None
    impact_metrics: str | None = None
    tags: list[str] | None = None

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: list[str] | None) -> list[str] | None:
        if v is None:
            return v
        cleaned = [tag.strip().lower() for tag in v if tag.strip()]
        return list(dict.fromkeys(cleaned))


class ExperienceResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    type: ExperienceType
    title: str
    organization: str | None
    start_date: date | None
    end_date: date | None
    description: str | None
    impact_metrics: str | None
    tags: list[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ExperienceFilters(BaseModel):
    type: ExperienceType | None = None
    tag: str | None = None
    q: str | None = None
    skip: int = Field(default=0, ge=0)
    limit: int = Field(default=100, ge=1, le=500)
