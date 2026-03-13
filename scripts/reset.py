"""
Reset the development database: truncate all user data, then re-seed.

Requires PostgreSQL to be running (start it with `devenv up` in a separate
terminal, or run `devenv up --detach` first).

Usage (inside the devenv shell):
    reset

Or from any shell at the repo root:
    devenv shell -- reset
"""

import asyncio
import socket
import sys

from sqlalchemy import text

# ─── App bootstrap (must happen before any app.* imports that hit config) ────
from app.database import get_session_factory

# Import the seed runner from the sibling module (both live in scripts/).
from seed import _run as _seed_run


async def _run() -> None:
    factory = get_session_factory()

    async with factory() as session:
        print("─── Resetting database ──────────────────────────────────────────")
        # Truncate in dependency order (children before parents).
        await session.execute(
            text(
                "TRUNCATE TABLE resume_versions, resumes, experiences, users"
                " RESTART IDENTITY CASCADE"
            )
        )
        await session.commit()
        print("  all tables truncated")
        print()

    await _seed_run()


def _check_postgres() -> None:
    """Fail fast with a helpful message if PostgreSQL is not reachable."""
    try:
        with socket.create_connection(("127.0.0.1", 5432), timeout=2):
            pass
    except OSError:
        print(
            "\nCannot reach PostgreSQL on localhost:5432.\n"
            "Start the dev services first:\n\n"
            "    devenv up\n\n"
            "Then run this command in a second terminal.",
            file=sys.stderr,
        )
        sys.exit(1)


def main() -> None:
    _check_postgres()
    try:
        asyncio.run(_run())
    except Exception as exc:  # noqa: BLE001
        print(f"\nReset failed: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
