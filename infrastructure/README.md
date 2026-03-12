# Infrastructure

Build and deployment infrastructure for Career Bridge. Nix handles reproducible local development and lean container builds. Google GKE handles production.

> **Status:** Not yet implemented. Coming in Phase 1.

## How It Works

### 1. Local Development (devenv + Nix)

`devenv` at the project root provides a reproducible environment with exact versions of all runtimes (Python, Node), services (PostgreSQL, Redis), and CLI tools (`kubectl`, etc.). No global installs, no conflicts.

```bash
devenv up
```

Starts PostgreSQL, Redis, the FastAPI backend, and the Vite frontend dev server together via process-compose.

### 2. Build Phase (Nix OCI Images)

Nix selectively packages `backend/` and `frontend/` into independent, minimal OCI container images. Each image contains only the application code and its specific runtime — no OS bloat.

```bash
nix build .#backend-image
nix build .#frontend-image
```

### 3. Artifact Handoff (Google Artifact Registry)

CI/CD pushes the Nix-built OCI images to Google Artifact Registry. At this point Nix's job is done — the artifacts are standard, universally compliant container images.

### 4. Production (Google GKE)

GKE pulls the standard container images from the registry and runs them on managed Linux nodes. GKE does not know or care that Nix built the images.

## Planned Contents

- `devenv.nix` — full local stack configuration (PostgreSQL, Redis, backend, frontend via process-compose)
- `images/` — Nix expressions for building OCI container images (`pkgs.dockerTools.buildLayeredImage`)
- `k8s/` — Kubernetes manifests for GKE deployment (Deployments, Services, ConfigMaps)
- `flake.nix` — Nix flake tying together devenv and image builds
