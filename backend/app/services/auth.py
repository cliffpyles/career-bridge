"""
Auth service — JWT token creation and validation, password hashing.
This is a local auth stub. In production you might swap in OAuth or SSO.
"""
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    # ─── Password helpers ─────────────────────────────────────────────

    def hash_password(self, password: str) -> str:
        return pwd_context.hash(password)

    def verify_password(self, plain: str, hashed: str) -> bool:
        return pwd_context.verify(plain, hashed)

    # ─── JWT helpers ──────────────────────────────────────────────────

    def create_access_token(self, user_id: str) -> tuple[str, int]:
        """Returns (token, expires_in_seconds)."""
        expire_minutes = self.settings.access_token_expire_minutes
        expire = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)
        payload = {
            "sub": user_id,
            "exp": expire,
            "iat": datetime.now(timezone.utc),
        }
        token = jwt.encode(
            payload,
            self.settings.secret_key,
            algorithm=self.settings.algorithm,
        )
        return token, expire_minutes * 60

    def decode_token(self, token: str) -> dict | None:
        """Decode and validate a JWT. Returns payload dict or None."""
        try:
            payload = jwt.decode(
                token,
                self.settings.secret_key,
                algorithms=[self.settings.algorithm],
            )
            return payload
        except JWTError:
            return None

    # ─── User resolution ──────────────────────────────────────────────

    async def get_user_from_token(self, db: AsyncSession, token: str) -> User | None:
        """Validate token and return the corresponding user, or None."""
        import uuid as _uuid

        payload = self.decode_token(token)
        if payload is None:
            return None

        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            return None

        try:
            user_id = _uuid.UUID(user_id_str)
        except ValueError:
            return None

        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def authenticate_user(
        self, db: AsyncSession, email: str, password: str
    ) -> User | None:
        """Verify email + password. Returns user on success, None on failure."""
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if user is None:
            return None
        if not self.verify_password(password, user.hashed_password):
            return None
        return user

    async def register_user(
        self, db: AsyncSession, email: str, password: str, name: str = ""
    ) -> User:
        """Create a new user. Raises ValueError if email already taken."""
        result = await db.execute(select(User).where(User.email == email))
        if result.scalar_one_or_none() is not None:
            raise ValueError(f"Email already registered: {email}")

        user = User(
            email=email,
            name=name,
            hashed_password=self.hash_password(password),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user
