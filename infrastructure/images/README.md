# OCI Image Builds

Career Bridge uses Nix to build lean, reproducible OCI container images for deployment to GKE. Nix is only the *build tool* — GKE runs standard managed Linux nodes.

## Images

| Image | Source | Port | Description |
|-------|--------|------|-------------|
| `career-bridge-backend` | `backend.nix` | 8000 | FastAPI + Uvicorn |
| `career-bridge-frontend` | `frontend.nix` | 8080 | nginx serving Vite build |

## Build → Push → Deploy Pipeline

### Prerequisites

```bash
# Install Nix with flakes support
sh <(curl -L https://nixos.org/nix/install)

# Install gcloud CLI
brew install google-cloud-sdk
gcloud auth configure-docker us-docker.pkg.dev
```

### Build images

```bash
# From project root
nix build .#backend-image  && docker load < result
nix build .#frontend-image && docker load < result
```

### Tag and push to Google Artifact Registry

```bash
export PROJECT=your-gcp-project-id
export REGION=us-central1
export REGISTRY="${REGION}-docker.pkg.dev/${PROJECT}/career-bridge"

docker tag career-bridge-backend:latest ${REGISTRY}/backend:$(git rev-parse --short HEAD)
docker tag career-bridge-frontend:latest ${REGISTRY}/frontend:$(git rev-parse --short HEAD)

docker push ${REGISTRY}/backend:$(git rev-parse --short HEAD)
docker push ${REGISTRY}/frontend:$(git rev-parse --short HEAD)
```

### Deploy to GKE

```bash
kubectl apply -f infrastructure/k8s/
kubectl set image deployment/backend backend=${REGISTRY}/backend:$(git rev-parse --short HEAD)
kubectl set image deployment/frontend frontend=${REGISTRY}/frontend:$(git rev-parse --short HEAD)
```

## Image size targets

- Backend: ~120 MB (Python + FastAPI dependencies)
- Frontend: ~25 MB (nginx + compiled SPA assets)

These sizes are achieved by using `pkgs.dockerTools.buildLayeredImage` which only includes explicitly listed packages — no base OS, no shell, no package managers.
