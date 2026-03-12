"""Resumes router — CRUD, version management, and file export."""

import uuid
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.crud.resume import ResumeCRUD
from app.deps import CurrentUser, DBSession
from app.schemas.resume import ResumeCreate, ResumeResponse, ResumeUpdate, ResumeVersionResponse
from app.services.resume_export import build_pdf, build_txt

router = APIRouter(prefix="/resumes", tags=["resumes"])


def get_crud(db: DBSession) -> ResumeCRUD:
    return ResumeCRUD(db)


@router.get("", response_model=list[ResumeResponse])
async def list_resumes(
    current_user: CurrentUser,
    crud: ResumeCRUD = Depends(get_crud),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
) -> list[ResumeResponse]:
    resumes = await crud.list_for_user(user_id=current_user.id, skip=skip, limit=limit)
    return [ResumeResponse.model_validate(r) for r in resumes]


@router.post("", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def create_resume(
    data: ResumeCreate,
    current_user: CurrentUser,
    crud: ResumeCRUD = Depends(get_crud),
) -> ResumeResponse:
    resume = await crud.create(data, user_id=current_user.id)
    return ResumeResponse.model_validate(resume)


@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: uuid.UUID,
    current_user: CurrentUser,
    crud: ResumeCRUD = Depends(get_crud),
) -> ResumeResponse:
    resume = await crud.get_for_user(resume_id, current_user.id)
    if resume is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    return ResumeResponse.model_validate(resume)


@router.patch("/{resume_id}", response_model=ResumeResponse)
async def update_resume(
    resume_id: uuid.UUID,
    data: ResumeUpdate,
    current_user: CurrentUser,
    crud: ResumeCRUD = Depends(get_crud),
) -> ResumeResponse:
    resume = await crud.get_for_user(resume_id, current_user.id)
    if resume is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    updated = await crud.update(resume, data)
    return ResumeResponse.model_validate(updated)


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume(
    resume_id: uuid.UUID,
    current_user: CurrentUser,
    crud: ResumeCRUD = Depends(get_crud),
) -> None:
    resume = await crud.get_for_user(resume_id, current_user.id)
    if resume is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    await crud.delete(resume)


@router.get("/{resume_id}/versions", response_model=list[ResumeVersionResponse])
async def list_versions(
    resume_id: uuid.UUID,
    current_user: CurrentUser,
    crud: ResumeCRUD = Depends(get_crud),
) -> list[ResumeVersionResponse]:
    resume = await crud.get_for_user(resume_id, current_user.id)
    if resume is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    versions = await crud.list_versions(resume_id)
    return [ResumeVersionResponse.model_validate(v) for v in versions]


@router.post("/{resume_id}/versions/{version_id}/restore", response_model=ResumeResponse)
async def restore_version(
    resume_id: uuid.UUID,
    version_id: uuid.UUID,
    current_user: CurrentUser,
    crud: ResumeCRUD = Depends(get_crud),
    db: DBSession = Depends(),
) -> ResumeResponse:
    resume = await crud.get_for_user(resume_id, current_user.id)
    if resume is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")

    from sqlalchemy import select

    from app.models.resume import ResumeVersion

    stmt = select(ResumeVersion).where(
        ResumeVersion.id == version_id,
        ResumeVersion.resume_id == resume_id,
    )
    result = await crud.db.execute(stmt)
    version = result.scalar_one_or_none()
    if version is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Version not found")

    restored = await crud.restore_version(resume, version)
    return ResumeResponse.model_validate(restored)


@router.post("/{resume_id}/export")
async def export_resume(
    resume_id: uuid.UUID,
    current_user: CurrentUser,
    crud: ResumeCRUD = Depends(get_crud),
    format: Literal["pdf", "txt"] = Query(default="pdf"),
) -> Response:
    resume = await crud.get_for_user(resume_id, current_user.id)
    if resume is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")

    safe_name = resume.name.replace(" ", "_").replace("/", "-")

    if format == "pdf":
        content = build_pdf(resume)
        return Response(
            content=content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{safe_name}_v{resume.version}.pdf"'
            },
        )

    # TXT fallback
    content = build_txt(resume)
    return Response(
        content=content,
        media_type="text/plain",
        headers={
            "Content-Disposition": f'attachment; filename="{safe_name}_v{resume.version}.txt"'
        },
    )
