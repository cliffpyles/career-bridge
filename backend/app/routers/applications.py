"""Applications router — pipeline-based application tracking."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.crud.application import ApplicationCRUD
from app.deps import CurrentUser, DBSession
from app.models.application import ApplicationStatus
from app.schemas.application import (
    ApplicationCreate,
    ApplicationEventCreate,
    ApplicationEventResponse,
    ApplicationResponse,
    ApplicationUpdate,
)

router = APIRouter(prefix="/applications", tags=["applications"])


def get_crud(db: DBSession) -> ApplicationCRUD:
    return ApplicationCRUD(db)


# ─── Application CRUD ─────────────────────────────────────────────────────────


@router.get("", response_model=list[ApplicationResponse])
async def list_applications(
    current_user: CurrentUser,
    crud: ApplicationCRUD = Depends(get_crud),
    status: ApplicationStatus | None = Query(default=None),
    sort: str = Query(default="recent", pattern="^(recent|next_action)$"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
) -> list[ApplicationResponse]:
    applications = await crud.list_for_user(
        user_id=current_user.id,
        status=status,
        sort=sort,
        skip=skip,
        limit=limit,
    )
    return [ApplicationResponse.model_validate(a) for a in applications]


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    data: ApplicationCreate,
    current_user: CurrentUser,
    crud: ApplicationCRUD = Depends(get_crud),
) -> ApplicationResponse:
    application = await crud.create(data, user_id=current_user.id)
    return ApplicationResponse.model_validate(application)


@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: uuid.UUID,
    current_user: CurrentUser,
    crud: ApplicationCRUD = Depends(get_crud),
) -> ApplicationResponse:
    application = await crud.get_for_user(application_id, current_user.id)
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    return ApplicationResponse.model_validate(application)


@router.patch("/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: uuid.UUID,
    data: ApplicationUpdate,
    current_user: CurrentUser,
    crud: ApplicationCRUD = Depends(get_crud),
) -> ApplicationResponse:
    application = await crud.get_for_user(application_id, current_user.id)
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    updated = await crud.update(application, data)
    return ApplicationResponse.model_validate(updated)


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(
    application_id: uuid.UUID,
    current_user: CurrentUser,
    crud: ApplicationCRUD = Depends(get_crud),
) -> None:
    application = await crud.get_for_user(application_id, current_user.id)
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    await crud.delete(application)


# ─── Application Events ───────────────────────────────────────────────────────


@router.get("/{application_id}/events", response_model=list[ApplicationEventResponse])
async def list_events(
    application_id: uuid.UUID,
    current_user: CurrentUser,
    crud: ApplicationCRUD = Depends(get_crud),
) -> list[ApplicationEventResponse]:
    # Verify ownership
    application = await crud.get_for_user(application_id, current_user.id)
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    events = await crud.list_events(application_id)
    return [ApplicationEventResponse.model_validate(e) for e in events]


@router.post(
    "/{application_id}/events",
    response_model=ApplicationEventResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_event(
    application_id: uuid.UUID,
    data: ApplicationEventCreate,
    current_user: CurrentUser,
    crud: ApplicationCRUD = Depends(get_crud),
) -> ApplicationEventResponse:
    # Verify ownership
    application = await crud.get_for_user(application_id, current_user.id)
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    event = await crud.create_event(application_id, data)
    return ApplicationEventResponse.model_validate(event)
