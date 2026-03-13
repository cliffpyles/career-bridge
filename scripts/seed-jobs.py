"""
Re-seed only the jobs table without touching user data.

Idempotent — uses deterministic UUIDs keyed on job title + company, so
re-runs are no-ops for existing rows. Useful during development to refresh
job fixtures without wiping applications, resumes, or experience data.

Note: This does NOT re-seed saved_jobs. Run `reset` for a full clean slate.

Usage (inside the devenv shell):
    seed-jobs

Or from any shell at the repo root:
    devenv shell -- seed-jobs
"""

import asyncio
import socket
import sys
import uuid
from datetime import datetime, timezone

from sqlalchemy import select

from app.database import get_session_factory
from app.models.job import Job

# Re-use the job fixtures from seed.py so data stays in sync.
# We import only the data constants — not the full seed runner.
from seed import _JOBS, _SEED_NS


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _seed_uuid(*parts: str) -> uuid.UUID:
    return uuid.uuid5(_SEED_NS, ":".join(parts))


async def _run() -> None:
    factory = get_session_factory()
    now = _utcnow()

    async with factory() as session:
        print("─── Re-seeding jobs table ───────────────────────────────────────")

        job_planned: list[tuple[uuid.UUID, dict]] = []
        for j in _JOBS:
            job_id = _seed_uuid("job", j["title"], j["company"])
            job_planned.append((job_id, j))

        existing_result = await session.execute(
            select(Job.id).where(Job.id.in_([jid for jid, _ in job_planned]))
        )
        existing_ids = {row[0] for row in existing_result}

        inserted = 0
        for job_id, j in job_planned:
            if job_id in existing_ids:
                continue
            session.add(
                Job(
                    id=job_id,
                    title=j["title"],
                    company=j["company"],
                    location=j.get("location"),
                    remote_type=j["remote_type"].value,
                    salary_min=j.get("salary_min"),
                    salary_max=j.get("salary_max"),
                    description=j.get("description"),
                    url=j.get("url"),
                    source=j.get("source", "manual"),
                    posted_date=j.get("posted_date"),
                    created_at=now,
                )
            )
            inserted += 1

        await session.commit()

        skipped = len(job_planned) - inserted
        print(
            f"  {inserted} inserted, {skipped} already existed "
            f"({len(job_planned)} total)"
        )
        print()
        print("─── Done ────────────────────────────────────────────────────────")


def _check_postgres() -> None:
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
        print(f"\nSeed-jobs failed: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
