"""Jobs router — job board search, job detail, and saved jobs management."""

import uuid

from fastapi import APIRouter, HTTPException, Query, status

from app.crud.experience import ExperienceCRUD
from app.crud.job import get_job_crud, get_saved_job_crud
from app.deps import CurrentUser, DBSession
from app.models.job import RemoteType
from app.schemas.job import (
    JobCreate,
    JobResponse,
    SavedJobCreate,
    SavedJobResponse,
)
from app.services.job_match import compute_match_score

router = APIRouter(tags=["jobs"])


def _get_exp_crud(db: DBSession) -> ExperienceCRUD:
    return ExperienceCRUD(db)


# ─── Helper ───────────────────────────────────────────────────────────────────


def _annotate_job(job, saved_ids: set, experiences, include_score: bool) -> JobResponse:
    """Build a JobResponse, annotating is_saved and match_score."""
    resp = JobResponse.model_validate(job)
    resp.is_saved = job.id in saved_ids
    if include_score:
        resp.match_score = compute_match_score(job, experiences)
    return resp


# ─── Job endpoints ────────────────────────────────────────────────────────────


@router.get("/jobs", response_model=list[JobResponse])
async def list_jobs(
    current_user: CurrentUser,
    db: DBSession,
    q: str | None = Query(default=None),
    location: str | None = Query(default=None),
    remote_type: RemoteType | None = Query(default=None),
    salary_min: int | None = Query(default=None, ge=0),
    salary_max: int | None = Query(default=None, ge=0),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
) -> list[JobResponse]:
    job_crud = get_job_crud(db)
    saved_crud = get_saved_job_crud(db)
    exp_crud = _get_exp_crud(db)

    jobs = await job_crud.search(
        q=q,
        location=location,
        remote_type=remote_type.value if remote_type else None,
        salary_min=salary_min,
        salary_max=salary_max,
        skip=skip,
        limit=limit,
    )
    saved_ids = await saved_crud.get_saved_job_ids_for_user(current_user.id)
    experiences = await exp_crud.list_for_user(current_user.id, limit=500)

    return [_annotate_job(j, saved_ids, experiences, include_score=True) for j in jobs]


@router.post("/jobs", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    data: JobCreate,
    current_user: CurrentUser,
    db: DBSession,
) -> JobResponse:
    """Manually add a job to the board."""
    job_crud = get_job_crud(db)
    job = await job_crud.create(data)
    saved_crud = get_saved_job_crud(db)
    saved_ids = await saved_crud.get_saved_job_ids_for_user(current_user.id)
    exp_crud = _get_exp_crud(db)
    experiences = await exp_crud.list_for_user(current_user.id, limit=500)
    return _annotate_job(job, saved_ids, experiences, include_score=True)


@router.get("/jobs/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: uuid.UUID,
    current_user: CurrentUser,
    db: DBSession,
) -> JobResponse:
    job_crud = get_job_crud(db)
    job = await job_crud.get_or_404(job_id)
    saved_crud = get_saved_job_crud(db)
    saved_ids = await saved_crud.get_saved_job_ids_for_user(current_user.id)
    exp_crud = _get_exp_crud(db)
    experiences = await exp_crud.list_for_user(current_user.id, limit=500)
    return _annotate_job(job, saved_ids, experiences, include_score=True)


# ─── Saved jobs endpoints ─────────────────────────────────────────────────────


@router.get("/saved-jobs", response_model=list[SavedJobResponse])
async def list_saved_jobs(
    current_user: CurrentUser,
    db: DBSession,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
) -> list[SavedJobResponse]:
    saved_crud = get_saved_job_crud(db)
    job_crud = get_job_crud(db)
    exp_crud = _get_exp_crud(db)

    saved = await saved_crud.list_for_user(current_user.id, skip=skip, limit=limit)
    saved_ids = {s.job_id for s in saved}
    experiences = await exp_crud.list_for_user(current_user.id, limit=500)

    responses: list[SavedJobResponse] = []
    for sv in saved:
        job = await job_crud.get(sv.job_id)
        if job is None:
            continue
        job_resp = _annotate_job(job, saved_ids, experiences, include_score=True)
        responses.append(
            SavedJobResponse(
                id=sv.id,
                user_id=sv.user_id,
                job_id=sv.job_id,
                saved_at=sv.saved_at,
                notes=sv.notes,
                job=job_resp,
            )
        )
    return responses


@router.post(
    "/saved-jobs",
    response_model=SavedJobResponse,
    status_code=status.HTTP_201_CREATED,
)
async def save_job(
    data: SavedJobCreate,
    current_user: CurrentUser,
    db: DBSession,
) -> SavedJobResponse:
    """Save a job to the user's saved list."""
    job_crud = get_job_crud(db)
    saved_crud = get_saved_job_crud(db)

    job = await job_crud.get_or_404(data.job_id)

    existing = await saved_crud.get_by_user_and_job(current_user.id, data.job_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Job is already saved",
        )

    saved = await saved_crud.create(data, user_id=current_user.id)

    saved_ids = await saved_crud.get_saved_job_ids_for_user(current_user.id)
    exp_crud = _get_exp_crud(db)
    experiences = await exp_crud.list_for_user(current_user.id, limit=500)
    job_resp = _annotate_job(job, saved_ids, experiences, include_score=True)

    return SavedJobResponse(
        id=saved.id,
        user_id=saved.user_id,
        job_id=saved.job_id,
        saved_at=saved.saved_at,
        notes=saved.notes,
        job=job_resp,
    )


@router.delete("/saved-jobs/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unsave_job(
    job_id: uuid.UUID,
    current_user: CurrentUser,
    db: DBSession,
) -> None:
    """Remove a job from the user's saved list (by job ID, not saved_job row ID)."""
    saved_crud = get_saved_job_crud(db)
    saved = await saved_crud.get_by_user_and_job(current_user.id, job_id)
    if saved is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved job not found",
        )
    await saved_crud.delete(saved)
