"""Health check router."""
from datetime import datetime, timezone

from fastapi import APIRouter

from app.config import get_settings

router = APIRouter(tags=["health"])
settings = get_settings()


@router.get("/health")
async def health_check() -> dict:
    """
    Basic health check endpoint.
    Returns 200 OK when the application is running.
    """
    return {
        "status": "ok",
        "version": settings.app_version,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
