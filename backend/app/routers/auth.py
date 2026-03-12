"""Auth router — login, register, /me."""
from fastapi import APIRouter, Depends, HTTPException, status

from app.config import Settings, get_settings
from app.deps import CurrentUser, DBSession
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    db: DBSession,
    settings: Settings = Depends(get_settings),
) -> TokenResponse:
    auth_service = AuthService(settings)
    user = await auth_service.authenticate_user(db, data.email, data.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token, expires_in = auth_service.create_access_token(str(user.id))
    return TokenResponse(access_token=token, expires_in=expires_in)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    data: RegisterRequest,
    db: DBSession,
    settings: Settings = Depends(get_settings),
) -> TokenResponse:
    auth_service = AuthService(settings)
    try:
        user = await auth_service.register_user(db, data.email, data.password, data.name)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc
    token, expires_in = auth_service.create_access_token(str(user.id))
    return TokenResponse(access_token=token, expires_in=expires_in)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: CurrentUser) -> UserResponse:
    return UserResponse.model_validate(current_user)
