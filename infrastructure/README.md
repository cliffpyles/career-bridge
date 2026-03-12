# Infrastructure

Build and deployment infrastructure for Career Bridge. Nix handles reproducible local development and lean container builds; Google GKE handles production.

## Contents

```
infrastructure/
  images/
    backend.nix    # Nix OCI image for FastAPI/Uvicorn
    frontend.nix   # Nix OCI image for nginx serving the Vite build
    README.md      # Image build, push, and deploy guide
  k8s/
    namespace.yaml   # career-bridge namespace
    configmap.yaml   # Non-secret runtime config
    secret.yaml      # Secret template (DATABASE_URL, SECRET_KEY, API keys)
    backend.yaml     # Deployment (2 replicas) + ClusterIP Service
    frontend.yaml    # Deployment (2 replicas) + ClusterIP Service
    ingress.yaml     # GKE HTTPS Ingress: /api/* → backend, /* → frontend
    redis.yaml       # Redis Deployment + ClusterIP Service
devenv.nix           # Full local stack (project root)
devenv.yaml          # devenv inputs (project root)
```

## 1. Local Development — devenv

`devenv` at the project root provides a fully reproducible development environment with pinned versions of all runtimes and services.

### Install devenv

```bash
sh <(curl -L https://devenv.sh/install.sh)
```

### Start the full stack

```bash
# From the project root
devenv up
```

process-compose starts all four processes in parallel:

| Process  | URL                      | Description                      |
| -------- | ------------------------ | -------------------------------- |
| postgres | `localhost:5432`         | PostgreSQL 16                    |
| redis    | `localhost:6379`         | Redis 7                          |
| backend  | `http://localhost:8000`  | FastAPI via Uvicorn (--reload)   |
| frontend | `http://localhost:5173`  | Vite dev server with HMR         |

### Enter the dev shell (without starting processes)

```bash
devenv shell
# Now python, node, psql, redis-cli, kubectl, etc. are all on $PATH
```

### Environment variables

Copy the example env file and fill in any secrets:

```bash
cp backend/.env.example backend/.env   # if .env.example exists
# or set DATABASE_URL, SECRET_KEY, etc. directly
```

`devenv.nix` sets sensible defaults for the local database URL and Redis URL automatically.

## 2. Container Images — Nix OCI Builds

Nix builds lean, reproducible OCI images using `pkgs.dockerTools.buildLayeredImage`. Each image contains only the application and its direct runtime — no base OS, no shell, no package managers.

See [`images/README.md`](images/README.md) for the full build → push → deploy workflow.

```bash
# Build images (from project root, requires Nix with flakes)
nix build .#backend-image  && docker load < result
nix build .#frontend-image && docker load < result
```

Target image sizes:
- **Backend**: ~120 MB (Python + FastAPI deps)
- **Frontend**: ~25 MB (nginx + compiled SPA assets)

## 3. Kubernetes — GKE Deployment

All manifests live in `infrastructure/k8s/`. They target a GKE cluster in the `career-bridge` namespace.

### Apply all manifests

```bash
kubectl apply -f infrastructure/k8s/
```

### Update a running deployment after a new image push

```bash
export REGISTRY="us-central1-docker.pkg.dev/YOUR_PROJECT/career-bridge"
export SHA=$(git rev-parse --short HEAD)

kubectl set image deployment/backend  backend=${REGISTRY}/backend:${SHA}  -n career-bridge
kubectl set image deployment/frontend frontend=${REGISTRY}/frontend:${SHA} -n career-bridge
```

### Manifest summary

| File             | Purpose                                                        |
| ---------------- | -------------------------------------------------------------- |
| `namespace.yaml` | Creates the `career-bridge` namespace                          |
| `configmap.yaml` | Non-secret config: `APP_ENV`, `CORS_ORIGINS`, service URLs     |
| `secret.yaml`    | **Template only** — fill in `DATABASE_URL`, `SECRET_KEY`, etc. before applying |
| `backend.yaml`   | FastAPI Deployment (2 replicas) + ClusterIP Service            |
| `frontend.yaml`  | nginx Deployment (2 replicas) + ClusterIP Service              |
| `ingress.yaml`   | GKE HTTPS Ingress routing `/api/*` → backend, `/*` → frontend  |
| `redis.yaml`     | Redis Deployment (single replica) + ClusterIP Service          |

> **Secret management:** Do not commit real secret values. In production use Google Secret Manager or an external-secrets operator to populate the Secret from outside the cluster.

## 4. Pipeline Overview

```
devenv (local)
    │
    ├─ nix build .#backend-image   →  OCI tar
    ├─ nix build .#frontend-image  →  OCI tar
    │
    ├─ docker push → Google Artifact Registry
    │
    └─ kubectl apply / set image → GKE
```

GKE does not know or care that Nix built the images — they are standard OCI-compliant container images.
