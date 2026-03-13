{ pkgs, lib, config, inputs, ... }:

{
  # ─── Package set ─────────────────────────────────────────────────────
  packages = [
    pkgs.git
    pkgs.curl
    pkgs.jq
    pkgs.google-cloud-sdk  # For deploying to GKE
  ];

  # ─── Languages / runtimes ─────────────────────────────────────────────
  languages.python = {
    enable = true;
    version = "3.12";
    venv.enable = true;
    venv.requirements = ./backend/requirements.txt;
  };

  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_22;
  };

  # ─── Services ─────────────────────────────────────────────────────────
  services.postgres = {
    enable = true;
    package = pkgs.postgresql_16;
    port = 5432;
    initialDatabases = [{ name = "career_bridge"; }];
    listen_addresses = "127.0.0.1";
    # Create the 'postgres' superuser role so the DATABASE_URL creds work
    # on any machine regardless of the OS username.
    initialScript = ''
      DO $$ BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'postgres') THEN
          CREATE ROLE postgres SUPERUSER LOGIN PASSWORD 'postgres';
        END IF;
      END $$;
    '';
  };

  services.redis = {
    enable = true;
    port = 6379;
  };

  # ─── Process-compose: run all services together ───────────────────────
  processes = {
    backend = {
      exec = "cd backend && alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload";
      process-compose = {
        depends_on = {
          postgres.condition = "process_healthy";
          redis.condition = "process_started";
        };
      };
    };

    frontend = {
      exec = "cd frontend && npm run dev";
    };
  };

  # ─── Environment variables ────────────────────────────────────────────
  env = {
    DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/career_bridge";
    REDIS_URL = "redis://localhost:6379/0";
    SECRET_KEY = "dev-secret-key-change-in-production";
    ENVIRONMENT = "development";
    DEBUG = "true";
    VITE_API_URL = "/api";
    VITE_MSW = "false";
  };

  # ─── Shell hooks ──────────────────────────────────────────────────────
  enterShell = ''
    echo "Career Bridge dev environment ready."
    echo ""
    echo "Services: PostgreSQL (5432), Redis (6379)"
    echo "  devenv up               — start all services + servers (runs migrations automatically)"
    echo "  devenv shell -- migrate    — run pending database migrations"
    echo "  devenv shell -- seed       — seed the database with realistic mock data"
    echo "  devenv shell -- reset      — truncate all data and re-seed"
    echo "  devenv shell -- wipe       — remove all data without re-seeding"
    echo "  devenv shell -- seed-jobs  — re-seed only the jobs table"
    echo "  cd backend && pytest    — run backend tests"
    echo "  cd frontend && npm test — run frontend tests"
    echo ""
  '';

  # ─── Scripts (available as commands inside the devenv shell) ─────────────
  scripts.migrate = {
    exec = ''
      cd "$DEVENV_ROOT/backend" && alembic upgrade head "$@"
    '';
    description = "Run pending Alembic database migrations (upgrade to head).";
  };

  scripts.seed = {
    exec = ''
      PYTHONPATH="$DEVENV_ROOT/backend:$DEVENV_ROOT/scripts" \
        python "$DEVENV_ROOT/scripts/seed.py" "$@"
    '';
    description = "Seed the database with realistic mock data (idempotent).";
  };

  scripts.reset = {
    exec = ''
      PYTHONPATH="$DEVENV_ROOT/backend:$DEVENV_ROOT/scripts" \
        python "$DEVENV_ROOT/scripts/reset.py" "$@"
    '';
    description = "Truncate all dev data and re-seed from scratch.";
  };

  scripts.wipe = {
    exec = ''
      PYTHONPATH="$DEVENV_ROOT/backend:$DEVENV_ROOT/scripts" \
        python "$DEVENV_ROOT/scripts/wipe.py" "$@"
    '';
    description = "Remove all data from the database without re-seeding.";
  };

  scripts.seed-jobs = {
    exec = ''
      PYTHONPATH="$DEVENV_ROOT/backend:$DEVENV_ROOT/scripts" \
        python "$DEVENV_ROOT/scripts/seed-jobs.py" "$@"
    '';
    description = "Re-seed only the jobs table without touching user data.";
  };

  # ─── Git hooks ────────────────────────────────────────────────────────
  git-hooks.hooks = {
    ruff.enable = true;
    ruff-format.enable = true;
  };
}
