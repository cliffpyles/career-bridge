"""Dashboard router — aggregated landing page data."""

from fastapi import APIRouter

from app.deps import CurrentUser, DBSession
from app.schemas.dashboard import DashboardSummary
from app.services.dashboard import DashboardService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardSummary)
async def get_dashboard(
    current_user: CurrentUser,
    db: DBSession,
) -> DashboardSummary:
    service = DashboardService(db)
    return await service.get_summary(current_user.id)
