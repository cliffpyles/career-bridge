"""Pydantic schemas for Resume request/response."""

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ResumeCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    sections: list[Any] = Field(default_factory=list)


class ResumeUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    sections: list[Any] | None = None


class ResumeVersionResponse(BaseModel):
    id: uuid.UUID
    resume_id: uuid.UUID
    version: int
    name: str
    sections: list[Any]
    created_at: datetime

    model_config = {"from_attributes": True}


class ResumeResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    version: int
    sections: list[Any]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
