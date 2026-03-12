"""
Tests for JWT auth service and auth endpoints.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings
from app.services.auth import AuthService


@pytest.fixture
def auth_service(test_settings: Settings) -> AuthService:
    return AuthService(test_settings)


# ─── Auth service unit tests ─────────────────────────────────────

def test_hash_password_returns_different_string(auth_service: AuthService) -> None:
    hashed = auth_service.hash_password("mysecret")
    assert hashed != "mysecret"
    assert len(hashed) > 10


def test_verify_password_correct(auth_service: AuthService) -> None:
    hashed = auth_service.hash_password("correct")
    assert auth_service.verify_password("correct", hashed) is True


def test_verify_password_wrong(auth_service: AuthService) -> None:
    hashed = auth_service.hash_password("correct")
    assert auth_service.verify_password("wrong", hashed) is False


def test_create_access_token_returns_string(auth_service: AuthService) -> None:
    token, expires_in = auth_service.create_access_token("user-123")
    assert isinstance(token, str)
    assert len(token) > 10
    assert expires_in > 0


def test_decode_token_returns_payload(auth_service: AuthService) -> None:
    """Created token decodes back to the user ID."""
    token, _ = auth_service.create_access_token("user-abc")
    payload = auth_service.decode_token(token)
    assert payload is not None
    assert payload["sub"] == "user-abc"


def test_decode_invalid_token_returns_none(auth_service: AuthService) -> None:
    """Malformed token returns None without raising."""
    result = auth_service.decode_token("not-a-jwt-token")
    assert result is None


def test_decode_token_with_wrong_key(auth_service: AuthService) -> None:
    """Token signed with wrong key returns None."""
    other_settings = Settings(secret_key="different-secret-key")  # type: ignore[call-arg]
    other_service = AuthService(other_settings)
    token, _ = other_service.create_access_token("user-xyz")
    result = auth_service.decode_token(token)
    assert result is None


# ─── Auth endpoint integration tests ─────────────────────────────

@pytest.mark.asyncio
async def test_register_and_login(client: AsyncClient) -> None:
    """Full flow: register, then login returns a valid token."""
    # Register
    reg = await client.post(
        "/api/auth/register",
        json={"email": "new@example.com", "password": "securepassword", "name": "New User"},
    )
    assert reg.status_code == 201
    assert "access_token" in reg.json()

    # Login with same credentials
    login = await client.post(
        "/api/auth/login",
        json={"email": "new@example.com", "password": "securepassword"},
    )
    assert login.status_code == 200
    token_data = login.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, db_session: AsyncSession, test_settings: Settings) -> None:
    """Login with wrong password returns 401."""
    auth_service = AuthService(test_settings)
    await auth_service.register_user(db_session, "wrong@example.com", "correct")

    response = await client.post(
        "/api/auth/login",
        json={"email": "wrong@example.com", "password": "incorrect"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_duplicate_registration(client: AsyncClient) -> None:
    """Registering the same email twice returns 409."""
    payload = {"email": "dup@example.com", "password": "password123"}
    first = await client.post("/api/auth/register", json=payload)
    assert first.status_code == 201
    second = await client.post("/api/auth/register", json=payload)
    assert second.status_code == 409


@pytest.mark.asyncio
async def test_get_me_requires_auth(client: AsyncClient) -> None:
    """/api/auth/me without token returns 403 (bearer scheme returns 403 when no header)."""
    response = await client.get("/api/auth/me")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_get_me_with_valid_token(
    client: AsyncClient,
    db_session: AsyncSession,
    test_settings: Settings,
) -> None:
    """/api/auth/me with valid token returns current user."""
    auth_service = AuthService(test_settings)
    user = await auth_service.register_user(db_session, "me@example.com", "password", "Me User")
    token, _ = auth_service.create_access_token(str(user.id))

    response = await client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "me@example.com"
    assert data["name"] == "Me User"
