# Scripts

Utility scripts for development and data management. All scripts are
registered as devenv commands and run inside the devenv shell.

## Available Scripts

### `seed.py` — Seed the database

Populates the database with realistic mock data for all three seed users:
users, experiences, and resumes. Safe to run multiple times — uses
deterministic UUIDs so existing records are left untouched.

```bash
devenv shell -- seed
```

### `reset.py` — Reset the database

Truncates all user data (resume_versions, resumes, experiences, users) and
re-seeds from scratch. Useful when you want a clean, known-good state.

```bash
devenv shell -- reset
```

## Adding New Scripts

1. Create `scripts/<name>.py` with a `main()` entry point.
2. Register it in `devenv.nix` under `scripts.<name>`:

```nix
scripts.<name> = {
  exec = ''
    PYTHONPATH="$DEVENV_ROOT/backend:$DEVENV_ROOT/scripts" \
      python "$DEVENV_ROOT/scripts/<name>.py" "$@"
  '';
  description = "One-line description.";
};
```

3. Document it in this file.
