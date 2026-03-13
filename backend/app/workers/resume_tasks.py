"""
Celery tasks for resume generation.

The SSE endpoint is the primary path for resume generation; these tasks
serve as the async fallback for environments where long-lived HTTP connections
are constrained (e.g. load balancers with short timeouts).

Usage (from application code)::

    from app.workers.resume_tasks import generate_resume_task
    task = generate_resume_task.delay(job_description, experience_dicts, name)
    result = task.get(timeout=120)  # blocks; use .AsyncResult in practice
"""

from __future__ import annotations

import asyncio
from typing import Any

from app.workers.celery_app import celery_app


@celery_app.task(bind=True, name="resume_tasks.generate_resume", max_retries=2)  # type: ignore[misc]
def generate_resume_task(
    self: Any,
    job_description: str,
    experience_dicts: list[dict[str, Any]],
    name: str | None = None,
) -> dict[str, Any]:
    """
    Generate a tailored resume from a job description and experience library.

    Args:
        job_description: Full job posting text.
        experience_dicts:  Pre-serialised experience records (from experience_model_to_dict).
        name:              Optional resume name; defaults to 'AI-Generated Resume'.

    Returns:
        dict matching ResumeCreate: {"name": "...", "sections": [...]}

    Raises:
        RuntimeError: If the AI provider is not configured.
    """
    from app.config import get_settings
    from app.services.ai.factory import get_ai_service
    from app.services.resume_generation import ResumeGenerationService

    settings = get_settings()
    ai_service = get_ai_service(settings)
    svc = ResumeGenerationService(ai_service)

    # Run the async generation in a fresh event loop for the Celery worker context.
    loop = asyncio.new_event_loop()
    try:
        result = loop.run_until_complete(svc.generate(job_description, experience_dicts, name))
    finally:
        loop.close()

    return result
