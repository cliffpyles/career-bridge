# Career Bridge

A career transition management app — track applications, build tailored resumes, prep for interviews, and find jobs, all in one place.

## Repository Structure

```
career-bridge/
  frontend/          # React 19 + TypeScript + Vite app
  backend/           # FastAPI + PostgreSQL backend (Phase 1+)
  infrastructure/    # devenv config, Nix OCI image builds, GKE manifests (Phase 1+)
  scripts/           # Dev, migration, and data utilities (Phase 1+)
  planning/          # Product design docs and notes
```

## Tech Stack

| Layer          | Technology                                              |
| -------------- | ------------------------------------------------------- |
| Frontend       | React 19, TypeScript, Vite 7, TanStack Query, React Router v7 (Data Mode) |
| Backend        | Python, FastAPI, Pydantic v2, SQLModel, Alembic         |
| Database       | PostgreSQL                                              |
| Cache / Queue  | Redis + Celery                                          |
| AI             | OpenAI + Anthropic (provider-abstracted)                |
| Local Dev      | devenv (Nix) — reproducible env with all runtimes and services      |
| Build          | Nix — lean OCI container images, no Docker daemon needed            |
| Production     | Google GKE — standard managed Linux nodes, Google Artifact Registry |

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`.

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start Vite dev server with HMR     |
| `npm run build`   | Type-check and produce `dist/`     |
| `npm run lint`    | Run ESLint                         |
| `npm run preview` | Preview the production build       |

### Backend

> Coming in Phase 1. See [`backend/README.md`](backend/README.md).

### Full Stack (devenv)

> Coming in Phase 1. Run `devenv up` from the project root to start PostgreSQL, Redis, the backend server, and the frontend dev server together. See [`infrastructure/README.md`](infrastructure/README.md).

## Development Plan

See [`.cursor/plans/career_bridge_dev_plan_1f23fd96.plan.md`](.cursor/plans/career_bridge_dev_plan_1f23fd96.plan.md) for the full 11-phase development roadmap.
