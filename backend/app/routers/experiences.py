"""Experiences router — CRUD for career history entries."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.crud.experience import ExperienceCRUD
from app.deps import CurrentUser, DBSession
from app.models.experience import ExperienceType
from app.schemas.experience import ExperienceCreate, ExperienceResponse, ExperienceUpdate

router = APIRouter(prefix="/experiences", tags=["experiences"])


def get_crud(db: DBSession) -> ExperienceCRUD:
    return ExperienceCRUD(db)


@router.get("", response_model=list[ExperienceResponse])
async def list_experiences(
    current_user: CurrentUser,
    crud: ExperienceCRUD = Depends(get_crud),
    type: ExperienceType | None = Query(default=None),
    tag: str | None = Query(default=None),
    q: str | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
) -> list[ExperienceResponse]:
    experiences = await crud.list_for_user(
        user_id=current_user.id,
        type=type,
        tag=tag,
        q=q,
        skip=skip,
        limit=limit,
    )
    return [ExperienceResponse.model_validate(e) for e in experiences]


@router.post("", response_model=ExperienceResponse, status_code=status.HTTP_201_CREATED)
async def create_experience(
    data: ExperienceCreate,
    current_user: CurrentUser,
    crud: ExperienceCRUD = Depends(get_crud),
) -> ExperienceResponse:
    experience = await crud.create(data, user_id=current_user.id)
    return ExperienceResponse.model_validate(experience)


@router.get("/{experience_id}", response_model=ExperienceResponse)
async def get_experience(
    experience_id: uuid.UUID,
    current_user: CurrentUser,
    crud: ExperienceCRUD = Depends(get_crud),
) -> ExperienceResponse:
    experience = await crud.get_for_user(experience_id, current_user.id)
    if experience is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experience not found")
    return ExperienceResponse.model_validate(experience)


@router.patch("/{experience_id}", response_model=ExperienceResponse)
async def update_experience(
    experience_id: uuid.UUID,
    data: ExperienceUpdate,
    current_user: CurrentUser,
    crud: ExperienceCRUD = Depends(get_crud),
) -> ExperienceResponse:
    experience = await crud.get_for_user(experience_id, current_user.id)
    if experience is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experience not found")
    updated = await crud.update(experience, data)
    return ExperienceResponse.model_validate(updated)


@router.delete("/{experience_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_experience(
    experience_id: uuid.UUID,
    current_user: CurrentUser,
    crud: ExperienceCRUD = Depends(get_crud),
) -> None:
    experience = await crud.get_for_user(experience_id, current_user.id)
    if experience is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experience not found")
    await crud.delete(experience)
