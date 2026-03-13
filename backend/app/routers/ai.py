"""
AI router — provider-agnostic AI endpoints.

Phase 6 endpoints:
  POST /api/ai/generate-resume  — SSE stream: progress tokens + final resume JSON
"""

from __future__ import annotations

import json
from collections.abc import AsyncGenerator
from typing import Any

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.crud.experience import ExperienceCRUD
from app.deps import AppSettings, CurrentUser, DBSession
from app.schemas.ai import GenerateResumeRequest
from app.services.ai.factory import get_ai_service
from app.services.resume_generation import ResumeGenerationService, experience_model_to_dict

router = APIRouter(prefix="/ai", tags=["ai"])


def _sse_token(text: str) -> str:
    """Format a text fragment as an SSE token event."""
    return f"data: {json.dumps({'token': text})}\n\n"


def _sse_event(payload: dict[str, Any]) -> str:
    """Format a structured payload as an SSE event."""
    return f"data: {json.dumps(payload)}\n\n"


def _sse_done() -> str:
    return "data: [DONE]\n\n"


@router.post("/generate-resume")
async def generate_resume(
    request: GenerateResumeRequest,
    current_user: CurrentUser,
    db: DBSession,
    settings: AppSettings,
) -> StreamingResponse:
    """
    Stream resume generation progress as Server-Sent Events.

    SSE event types:
      {token: string}              — incremental progress text to display
      {type: "complete", resume: {name, sections}}  — final generated resume
      {type: "error",   message: string}            — generation failed
    Final line: `data: [DONE]`

    The client should:
      1. Display token events as streaming progress text.
      2. On the "complete" event, create / navigate to the new resume.
      3. On "error", surface the message and allow the user to retry.
    """
    # Load experiences before entering the generator so the DB session
    # is not held open across yields.
    crud = ExperienceCRUD(db)
    experiences_orm = await crud.list_for_user(user_id=current_user.id, limit=500)
    experience_dicts = [experience_model_to_dict(e) for e in experiences_orm]

    async def event_stream() -> AsyncGenerator[str, None]:
        try:
            yield _sse_token("Analyzing your experience library…\n")

            ai_service = get_ai_service(settings)
            svc = ResumeGenerationService(ai_service)

            yield _sse_token("Selecting the most relevant experiences for this role…\n")

            selected = await svc.select_relevant_experiences(
                request.job_description, experience_dicts
            )

            selected_count = len(selected)
            yield _sse_token(
                f"Found {selected_count} relevant "
                f"{'experience' if selected_count == 1 else 'experiences'}. "
                "Building your tailored resume…\n"
            )

            sections = await svc.generate_resume_sections(request.job_description, selected)

            resume_name = request.name or "AI-Generated Resume"
            resume_payload = {
                "name": resume_name,
                "sections": sections,
            }

            yield _sse_token("Done. Opening your resume…\n")
            yield _sse_event({"type": "complete", "resume": resume_payload})
            yield _sse_done()

        except RuntimeError:
            # Provider not configured — surface a helpful message
            yield _sse_event(
                {
                    "type": "error",
                    "message": (
                        "AI provider is not configured. "
                        "Set AI_PROVIDER and the corresponding API key in your environment."
                    ),
                }
            )
            yield _sse_done()
        except Exception:  # noqa: BLE001
            yield _sse_event(
                {
                    "type": "error",
                    "message": (
                        "Something went wrong while generating your resume. "
                        "Your experience library is still intact — please try again."
                    ),
                }
            )
            yield _sse_done()

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering for SSE
        },
    )
