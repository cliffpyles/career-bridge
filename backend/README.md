# Backend

FastAPI + PostgreSQL API server for Career Bridge.

## Stack

| Component      | Technology                                         |
| -------------- | -------------------------------------------------- |
| Framework      | FastAPI                                            |
| ORM            | SQLModel (SQLAlchemy 2.0 async)                    |
| Migrations     | Alembic                                            |
| Validation     | Pydantic v2                                        |
| Auth           | python-jose (HS256 JWT) + passlib (bcrypt)         |
| Async driver   | asyncpg (PostgreSQL), aiosqlite (tests)            |
| Async tasks    | Celery + Redis                                     |
| Server         | Uvicorn                                            |
| Testing        | pytest + pytest-asyncio + httpx                    |

## Project Structure

```
backend/
  app/
    main.py           # FastAPI app factory (create_app), CORS, lifespan
    config.py         # pydantic-settings Settings, get_settings() with @lru_cache
    database.py       # Async engine + session factory (lazy init)
    deps.py           # FastAPI dependencies: get_db, get_current_user, get_settings
    crud/
      base.py         # Generic BaseCRUD[ModelT, CreateT, UpdateT]
    models/
      user.py         # User SQLModel table
    schemas/
      auth.py         # TokenResponse, LoginRequest, RegisterRequest, UserResponse
    routers/
      health.py       # GET /health
      auth.py         # POST /auth/register, POST /auth/login, GET /auth/me
    services/
      auth.py         # AuthService: hashing, JWT, authenticate, register
      ai/
        base.py       # AIService abstract base, shared request/response models
        openai.py     # OpenAI provider implementation
        anthropic.py  # Anthropic provider implementation
        factory.py    # ProviderFactory.create() — selects provider from config
    migrations/
      env.py                          # Alembic async runner
      versions/
        0001_initial_users.py         # Users table
  tests/
    conftest.py       # In-memory aiosqlite fixtures: db_session, client
    test_health.py
    test_crud.py
    test_auth.py
  pyproject.toml
  requirements.txt
  alembic.ini
```

## Setup

### Prerequisites

- Python 3.12+
- PostgreSQL 16 running locally (or use `devenv up` from the project root — see [`infrastructure/README.md`](../infrastructure/README.md))

### Install dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Environment variables

Create a `.env` file in `backend/` (or export these variables):

| Variable            | Required | Default              | Description                              |
| ------------------- | -------- | -------------------- | ---------------------------------------- |
| `DATABASE_URL`      | Yes      | —                    | `postgresql+asyncpg://user:pass@host/db` |
| `SECRET_KEY`        | Yes      | —                    | Random string for JWT signing            |
| `REDIS_URL`         | No       | `redis://localhost:6379/0` | Redis connection string             |
| `APP_ENV`           | No       | `development`        | `development` \| `production`            |
| `DEBUG`             | No       | `true` in dev        | SQLAlchemy echo                          |
| `JWT_ALGORITHM`     | No       | `HS256`              | JWT signing algorithm                    |
| `JWT_EXPIRE_MINUTES`| No       | `10080` (7 days)     | Token TTL                                |
| `CORS_ORIGINS`      | No       | `["http://localhost:5173"]` | Allowed CORS origins              |
| `AI_PROVIDER`       | No       | `openai`             | `openai` \| `anthropic`                  |
| `OPENAI_API_KEY`    | No       | —                    | Required if `AI_PROVIDER=openai`         |
| `ANTHROPIC_API_KEY` | No       | —                    | Required if `AI_PROVIDER=anthropic`      |

### Run migrations

```bash
alembic upgrade head
```

### Start the dev server

```bash
uvicorn app.main:app --reload
# API available at http://localhost:8000
# Interactive docs at http://localhost:8000/docs
```

## API Endpoints

### Health

| Method | Path      | Auth | Description                     |
| ------ | --------- | ---- | ------------------------------- |
| GET    | `/health` | No   | Returns status, version, env, timestamp |

### Auth

| Method | Path              | Auth    | Description                          |
| ------ | ----------------- | ------- | ------------------------------------ |
| POST   | `/auth/register`  | No      | Create account, returns JWT          |
| POST   | `/auth/login`     | No      | Verify credentials, returns JWT      |
| GET    | `/auth/me`        | Bearer  | Returns current user profile         |

## Running Tests

Tests use an in-memory aiosqlite database — no PostgreSQL required.

```bash
cd backend
pytest                    # Run all tests
pytest -v                 # Verbose output
pytest --cov=app          # With coverage report
```

All 24 tests pass:

- `test_health.py` — 2 tests
- `test_crud.py` — 11 tests (create, get, list, update, delete, count, pagination, filter)
- `test_auth.py` — 11 tests (register, login, JWT encode/decode, `/me` endpoint)

## Architecture Notes

### Lazy database initialization

`app/database.py` uses `get_engine()` and `get_session_factory()` helper functions rather than module-level globals. This prevents `asyncpg` from being imported at collection time, which allows tests to use `aiosqlite` without installing asyncpg.

### Generic BaseCRUD

`app/crud/base.py` provides a typed `BaseCRUD[ModelT, CreateT, UpdateT]` that all domain CRUD classes will extend. It handles pagination, arbitrary keyword filtering, and optional soft-delete via a `deleted_at` field convention.

### AI provider abstraction

`app/services/ai/base.py` defines the `AIService` abstract interface with `complete()`, `stream()`, and `embed()` methods. Concrete providers (`OpenAIProvider`, `AnthropicProvider`) are selected at runtime by `ProviderFactory.create()` based on the `AI_PROVIDER` setting. Adding a new model provider requires only a new concrete class — no routing logic changes.
