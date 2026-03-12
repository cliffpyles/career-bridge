/**
 * Nix OCI image for the Career Bridge backend (FastAPI + Uvicorn).
 *
 * Build:
 *   nix build .#backend-image
 *   docker load < result
 *   docker push us-docker.pkg.dev/<project>/career-bridge/backend:<tag>
 *
 * This is a LEAN image — only the Python runtime and app code are included.
 * No build tools, no package managers. The result is typically 80–120 MB.
 *
 * GKE runs this as a standard OCI container — Nix is only the build tool.
 */
{ pkgs, python3Packages, ... }:

let
  # Python environment with only runtime dependencies
  pythonEnv = pkgs.python312.withPackages (ps: with ps; [
    fastapi
    uvicorn
    pydantic
    pydantic-settings
    sqlmodel
    sqlalchemy
    alembic
    asyncpg
    python-jose
    passlib
    python-multipart
    celery
    httpx
    # bcrypt for passlib
    bcrypt
  ]);

  # App source (backend/ directory)
  appSrc = pkgs.lib.cleanSource ../../backend;

in
pkgs.dockerTools.buildLayeredImage {
  name = "career-bridge-backend";
  tag = "latest";

  contents = [
    pythonEnv
    pkgs.cacert  # SSL certificates
  ];

  extraCommands = ''
    # Copy app source into /app
    mkdir -p app
    cp -r ${appSrc}/app app/
    cp ${appSrc}/alembic.ini .
  '';

  config = {
    Cmd = [
      "${pythonEnv}/bin/uvicorn"
      "app.main:app"
      "--host" "0.0.0.0"
      "--port" "8000"
    ];
    WorkingDir = "/app";
    ExposedPorts = { "8000/tcp" = {}; };
    Env = [
      "PYTHONUNBUFFERED=1"
      "PYTHONDONTWRITEBYTECODE=1"
    ];
  };
}
