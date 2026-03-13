"""
Celery application instance.

Import this module to get the configured Celery app:
    from app.workers.celery_app import celery_app
"""

from celery import Celery

from app.config import get_settings

_settings = get_settings()

celery_app = Celery(
    "career_bridge",
    broker=_settings.redis_url,
    backend=_settings.redis_url,
    include=["app.workers.resume_tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
)
