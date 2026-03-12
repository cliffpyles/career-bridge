# Backend

FastAPI + PostgreSQL backend for Career Bridge.

> **Status:** Not yet implemented. Coming in Phase 1.

## Planned Stack

- **Framework:** FastAPI (Python)
- **ORM / Migrations:** SQLModel + Alembic
- **Validation:** Pydantic v2
- **Async tasks:** Celery + Redis
- **Server:** Uvicorn
- **Testing:** pytest + httpx

## Planned Structure

```
backend/
  app/
    main.py          # FastAPI app factory
    config.py        # pydantic-settings config
    database.py      # Engine, session, Base
    deps.py          # Shared dependencies
    crud/
      base.py        # BaseCRUD[T] generic
    models/          # SQLModel models
    schemas/         # Pydantic request/response schemas
    routers/         # Route modules
    services/        # Business logic
      ai/            # AI provider abstraction
    workers/         # Celery tasks
    migrations/      # Alembic migrations
  tests/
  pyproject.toml
```

## Running (once implemented)

```bash
# Via devenv (recommended — starts backend alongside PostgreSQL and Redis):
devenv up

# Or standalone:
cd backend
python -m uvicorn app.main:app --reload
```
