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
      exec = "cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload";
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
    echo "  devenv up               — start all services + servers"
    echo "  seed                    — seed the database with realistic mock data"
    echo "  cd backend && pytest    — run backend tests"
    echo "  cd frontend && npm test — run frontend tests"
    echo ""
  '';

  # ─── Scripts (available as commands inside the devenv shell) ─────────────
  scripts.seed = {
    exec = ''
      cd "$DEVENV_ROOT/backend" && python scripts/seed.py "$@"
    '';
    description = "Seed the database with realistic mock data (idempotent).";
  };

  # ─── Git hooks ────────────────────────────────────────────────────────
  git-hooks.hooks = {
    ruff.enable = true;
    ruff-format.enable = true;
  };
}
