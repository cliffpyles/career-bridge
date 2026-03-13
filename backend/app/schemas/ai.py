"""Pydantic schemas for AI service request/response."""

from pydantic import BaseModel, Field

from app.schemas.resume import ResumeCreate


class GenerateResumeRequest(BaseModel):
    """Request body for the resume generation endpoint."""

    job_description: str = Field(
        min_length=10,
        max_length=20_000,
        description="The full job posting or description to tailor the resume for.",
    )
    name: str | None = Field(
        default=None,
        max_length=200,
        description="Optional name for the generated resume. Defaults to 'AI-Generated Resume'.",
    )


class GenerateResumeResponse(BaseModel):
    """Final payload sent as the 'complete' SSE event."""

    resume: ResumeCreate
