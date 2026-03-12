# Infrastructure

Kubernetes manifests, Docker Compose files, and environment configuration for Career Bridge.

> **Status:** Not yet implemented. Coming in Phase 1.

## Planned Contents

- `docker-compose.yml` — full local stack (frontend dev server, FastAPI, PostgreSQL, Redis)
- `k8s/` — Kubernetes manifests for production deployment
- `devenv.nix` — devenv configuration for local PostgreSQL + Redis

## Local Dev (once implemented)

```bash
# Start full stack with Docker Compose
docker compose up

# Or use devenv for local Postgres + Redis only
devenv up
```
