"""Pydantic schemas for the Dashboard aggregation endpoint."""

import uuid
from datetime import date

from pydantic import BaseModel

from app.models.application import ApplicationStatus


class AttentionItem(BaseModel):
    """A single application requiring the user's attention."""

    application_id: uuid.UUID
    company: str
    role: str
    status: ApplicationStatus
    next_action: str | None
    next_action_date: date | None
    days_until: int  # negative = overdue
    attention_type: str  # "overdue" | "upcoming"


class PipelineItem(BaseModel):
    """A compact summary of an active application for the pipeline list."""

    application_id: uuid.UUID
    company: str
    role: str
    status: ApplicationStatus
    next_action: str | None
    next_action_date: date | None


class DashboardStats(BaseModel):
    total_active: int
    total_archived: int


class DashboardSummary(BaseModel):
    needs_attention: list[AttentionItem]
    active_pipeline: list[PipelineItem]
    stats: DashboardStats
