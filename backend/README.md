# Backend

FastAPI + PostgreSQL API server for Career Bridge.

## Stack

| Component      | Technology                                         |
| -------------- | -------------------------------------------------- |
| Framework      | FastAPI                                            |
| ORM            | SQLModel (SQLAlchemy 2.0 async)                    |
| Migrations     | Alembic                                            |
| Validation     | Pydantic v2                                        |
| Auth           | python-jose (HS256 JWT) + bcrypt                   |
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
      experience.py   # ExperienceCRUD: list_for_user, get_for_user, search
    models/
      user.py         # User SQLModel table
      experience.py   # Experience SQLModel table + ExperienceType enum
    schemas/
      auth.py         # TokenResponse, LoginRequest, RegisterRequest, UserResponse
      experience.py   # ExperienceCreate, ExperienceUpdate, ExperienceResponse
    routers/
      health.py       # GET /health
      auth.py         # POST /auth/register, POST /auth/login, GET /auth/me
      experiences.py  # CRUD for /experiences with type/tag/search filtering
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
        0001_initial_users.py         # users table
        0002_experiences.py           # experiences table
  scripts/
    seed.py           # Idempotent dev-data seed (3 users × 6 experiences each)
  tests/
    conftest.py       # In-memory aiosqlite fixtures: db_session, client
    test_health.py    # 2 tests
    test_crud.py      # 10 tests (create, get, list, update, delete, pagination, filter)
    test_auth.py      # 12 tests (register, login, JWT, /me endpoint)
    test_experiences.py # 15 tests (CRUD, filtering, search, auth guards)
  pyproject.toml
  requirements.txt
  alembic.ini
```

## Setup

### Prerequisites

- Python 3.12+
- PostgreSQL 16 running locally (or use `devenv up` from the project root — see the root [`README.md`](../README.md))

### Install dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Environment variables

Copy `.env.example` to `.env` and fill in any values you need to override:

```bash
cp .env.example .env
```

Full variable reference:

| Variable            | Required | Default              | Description                              |
| ------------------- | -------- | -------------------- | ---------------------------------------- |
| `DATABASE_URL`      | Yes      | —                    | `postgresql+asyncpg://user:pass@host/db` |
| `SECRET_KEY`        | Yes      | —                    | Random string for JWT signing            |
| `REDIS_URL`         | No       | `redis://localhost:6379/0` | Redis connection string             |
| `ENVIRONMENT`       | No       | `development`        | `development` \| `production`            |
| `DEBUG`             | No       | `false`              | SQLAlchemy echo                          |
| `ALGORITHM`         | No       | `HS256`              | JWT signing algorithm                    |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `10080` (7 days) | Token TTL                          |
| `CORS_ORIGINS`      | No       | `["http://localhost:5173"]` | Allowed CORS origins              |
| `AI_PROVIDER`       | No       | `openai`             | `openai` \| `anthropic`                  |
| `OPENAI_API_KEY`    | No       | —                    | Required if `AI_PROVIDER=openai`         |
| `ANTHROPIC_API_KEY` | No       | —                    | Required if `AI_PROVIDER=anthropic`      |

### Run migrations

When using `devenv up`, migrations run automatically before the backend starts.
To run them manually (or outside devenv):

```bash
alembic upgrade head
```

### Seed dev data (optional)

```bash
python scripts/seed.py
```

Creates three user accounts (`alex`, `priya`, `marcus` `@careerbridge.dev`, password `seedpass1`) each with six experience entries covering every `ExperienceType`. Idempotent — safe to run multiple times.

### Start the dev server

```bash
uvicorn app.main:app --reload
# API available at http://localhost:8000
# Interactive docs at http://localhost:8000/docs
```

## API Endpoints

### AI (Phase 6)

| Method | Path                    | Auth   | Description                                            |
| ------ | ----------------------- | ------ | ------------------------------------------------------ |
| POST   | `/ai/generate-resume`   | Bearer | Stream resume generation progress as Server-Sent Events |

**`POST /ai/generate-resume`** accepts `{"job_description": "...", "name": "..."}` and returns a
`text/event-stream` response. Each line is `data: <JSON>` where JSON is one of:

| Event shape | Description |
|-------------|-------------|
| `{"token": "text"}` | Incremental progress text to display to the user |
| `{"type": "complete", "resume": {"name": "...", "sections": [...]}}` | Final generated resume |
| `{"type": "error", "message": "..."}` | Generation failed; surface message and offer retry |

The stream always ends with `data: [DONE]`.

### Health

| Method | Path      | Auth | Description                             |
| ------ | --------- | ---- | --------------------------------------- |
| GET    | `/health` | No   | Returns status, version, env, timestamp |

### Auth

| Method | Path              | Auth   | Description                      |
| ------ | ----------------- | ------ | -------------------------------- |
| POST   | `/auth/register`  | No     | Create account, returns JWT      |
| POST   | `/auth/login`     | No     | Verify credentials, returns JWT  |
| GET    | `/auth/me`        | Bearer | Returns current user profile     |

### Experiences

| Method | Path                  | Auth   | Description                                         |
| ------ | --------------------- | ------ | --------------------------------------------------- |
| GET    | `/experiences`        | Bearer | List experiences; filter by `type`, `tag`, or `q`  |
| POST   | `/experiences`        | Bearer | Create a new experience entry                       |
| GET    | `/experiences/{id}`   | Bearer | Get a single experience by ID                       |
| PUT    | `/experiences/{id}`   | Bearer | Replace an experience entry                         |
| DELETE | `/experiences/{id}`   | Bearer | Delete an experience entry                          |

All `/experiences` endpoints are scoped to the authenticated user — no cross-user access is possible.

## Running Tests

Tests use an in-memory aiosqlite database — no PostgreSQL required.

```bash
cd backend
pytest                    # Run all tests
pytest -v                 # Verbose output
pytest --cov=app          # With coverage report
```

39 tests across four files:

- `test_health.py` — 2 tests
- `test_crud.py` — 10 tests (create, get, list, update, delete, count, pagination, filter)
- `test_auth.py` — 12 tests (register, login, JWT encode/decode, `/me` endpoint)
- `test_experiences.py` — 15 tests (CRUD, type/tag/search filtering, auth guards, cross-user isolation)

## Architecture Notes

### Lazy database initialization

`app/database.py` uses `get_engine()` and `get_session_factory()` helper functions rather than module-level globals. This prevents `asyncpg` from being imported at collection time, which allows tests to use `aiosqlite` without installing asyncpg.

### Generic BaseCRUD

`app/crud/base.py` provides a typed `BaseCRUD[ModelT, CreateT, UpdateT]` that all domain CRUD classes extend. It handles pagination, arbitrary keyword filtering, and optional soft-delete via a `deleted_at` field convention.

### Enum columns stored as VARCHAR

SQLModel can infer Python `str`-enums as PostgreSQL named enum types. All enum-typed model fields use an explicit `sa_column=sa.Column(sa.String(), ...)` to store values as `VARCHAR`, matching what the Alembic migrations create and avoiding asyncpg type-cast errors.

### AI provider abstraction

`app/services/ai/base.py` defines the `AIService` abstract interface with `complete()`, `stream()`, and `embed()` methods. Concrete providers (`OpenAIProvider`, `AnthropicProvider`) are selected at runtime by `ProviderFactory.create()` based on the `AI_PROVIDER` setting. Adding a new model provider requires only a new concrete class — no routing logic changes.
