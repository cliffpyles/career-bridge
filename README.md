# Career Bridge

A career transition management app — track applications, build tailored resumes, prep for interviews, and find jobs, all in one place.

## Repository Structure

```
career-bridge/
  frontend/          # React 19 + TypeScript + Vite SPA
  backend/           # FastAPI + PostgreSQL API server
  infrastructure/    # devenv config, Nix OCI image builds, GKE manifests
  planning/          # Product design docs and notes
```

## Tech Stack

| Layer         | Technology                                                                             |
| ------------- | -------------------------------------------------------------------------------------- |
| Frontend      | React 19, TypeScript, Vite 7, React Router v7 (Data Mode), TanStack Query, CSS Modules |
| Component lib | Lucide icons, custom design-token system (light/dark themes)                           |
| Mocking       | MSW v2 (browser + Node)                                                                |
| Frontend test | Vitest + React Testing Library                                                         |
| Backend       | Python, FastAPI, Pydantic v2, SQLModel, Alembic                                        |
| Database      | PostgreSQL 16                                                                          |
| Cache / Queue | Redis 7 + Celery                                                                       |
| AI            | OpenAI + Anthropic (provider-abstracted via `AIService`)                               |
| Local dev     | devenv (Nix) — PostgreSQL, Redis, backend, frontend via process-compose                |
| Build         | Nix — lean OCI container images, no Docker daemon needed                               |
| Production    | Google GKE, Google Artifact Registry                                                   |

## Getting Started

### Option A — Full stack via devenv (recommended)

[Install devenv](https://devenv.sh/getting-started/), then from the project root:

```bash
devenv up
```

This starts PostgreSQL 16, Redis 7, the FastAPI backend (`:8000`), and the Vite dev server (`:5173`) together using process-compose. All runtimes and services are pinned by Nix — no global installs required.

Once the services are running, seed the database with realistic dev data:

```bash
devenv shell -- seed
```

This creates three pre-built user accounts, 18 experience entries, and 6 resumes (two per user) you can use to explore all features. The command is idempotent — safe to run multiple times.

To wipe all data and start fresh from a clean seed:

```bash
devenv shell -- reset
```

| Seed account            | Password   |
| ----------------------- | ---------- |
| alex@careerbridge.dev   | seedpass1  |
| priya@careerbridge.dev  | seedpass1  |
| marcus@careerbridge.dev | seedpass1  |

### Option B — Frontend only

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

In development mode all `/api/*` requests are intercepted by MSW stubs, so the frontend runs without a backend. The stub layer includes auth endpoints, so you can sign in with the demo credentials above (or register a local account backed by the stubs).

| Command                 | Description                        |
| ----------------------- | ---------------------------------- |
| `npm run dev`           | Start Vite dev server with HMR     |
| `npm run build`         | Type-check and produce `dist/`     |
| `npm run lint`          | Run ESLint                         |
| `npm run preview`       | Serve the production build locally |
| `npm test`              | Run Vitest test suite (114 tests)  |
| `npm run test:watch`    | Vitest in watch mode               |
| `npm run test:coverage` | Coverage report via v8             |

See [`frontend/README.md`](frontend/README.md) for the full component and architecture guide.

### Option C — Backend only

```bash
cd backend
pip install -r requirements.txt

# Set required environment variables (see backend/README.md)
export DATABASE_URL="postgresql+asyncpg://user:pass@localhost:5432/career_bridge"
export SECRET_KEY="change-me"

# Run database migrations
alembic upgrade head

# Seed with dev data (optional)
PYTHONPATH="$(pwd)" python ../scripts/seed.py

# Start the dev server
uvicorn app.main:app --reload   # http://localhost:8000
```

See [`backend/README.md`](backend/README.md) for the full setup guide.
