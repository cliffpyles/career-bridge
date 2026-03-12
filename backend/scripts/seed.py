"""
Seed the development database with realistic mock data.

Idempotent — safe to run multiple times:
  - Users are matched by e-mail; existing records are left untouched.
  - Experiences use deterministic UUIDs (uuid5) keyed on user + type + title,
    so re-runs are no-ops via INSERT … ON CONFLICT (id) DO NOTHING.

Usage (inside the devenv shell):
    seed

Or from any shell at the repo root:
    devenv shell seed
"""

import asyncio
import sys
import uuid
from datetime import date, datetime, timezone

from sqlalchemy import select

# ─── App bootstrap (must happen before any app.* imports that hit config) ────
# The devenv env vars are already present in the shell; this import chain
# reads DATABASE_URL from the environment via pydantic-settings.
from app.config import get_settings
from app.database import get_session_factory
from app.models import Experience, ExperienceType, User
from app.services.auth import AuthService

# ─── Constants ────────────────────────────────────────────────────────────────

# Fixed namespace for deterministic experience UUIDs.
_SEED_NS = uuid.UUID("c0ffee00-dead-beef-cafe-000000000001")
_DEFAULT_PASSWORD = "seedpass1"


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _seed_uuid(*parts: str) -> uuid.UUID:
    """Stable UUID derived from the seed namespace and the given parts."""
    return uuid.uuid5(_SEED_NS, ":".join(parts))


# ─── Seed users ───────────────────────────────────────────────────────────────

_USERS: list[dict] = [
    {
        "email": "alex@careerbridge.dev",
        "name": "Alex Chen",
        "password": _DEFAULT_PASSWORD,
    },
    {
        "email": "priya@careerbridge.dev",
        "name": "Priya Sharma",
        "password": _DEFAULT_PASSWORD,
    },
    {
        "email": "marcus@careerbridge.dev",
        "name": "Marcus Johnson",
        "password": _DEFAULT_PASSWORD,
    },
]

# ─── Seed experiences ─────────────────────────────────────────────────────────
# Each dict mirrors the Experience model columns.
# `user_key` is the e-mail of the owning user (resolved at runtime).

_EXPERIENCES: list[dict] = [
    # ── Alex Chen — Software Engineer transitioning to Product Manager ────────
    dict(
        user_key="alex@careerbridge.dev",
        type=ExperienceType.ROLE,
        title="Senior Software Engineer",
        organization="Stripe",
        start_date=date(2020, 3, 1),
        end_date=date(2024, 1, 31),
        description=(
            "Led a team of five engineers building Stripe's internal developer "
            "platform. Owned the API gateway layer, drove a migration from monolith "
            "to microservices, and shaped the roadmap for internal tooling used by "
            "all 400 engineers."
        ),
        impact_metrics=("Reduced P95 API latency by 40 %; decreased on-call incidents by 35 %."),
        tags=["Python", "Go", "Kubernetes", "API Design", "Team Lead"],
    ),
    dict(
        user_key="alex@careerbridge.dev",
        type=ExperienceType.ROLE,
        title="Software Engineer",
        organization="Dropbox",
        start_date=date(2017, 6, 1),
        end_date=date(2020, 2, 28),
        description=(
            "Full-stack engineer on the Collaboration team. Built real-time document "
            "editing features used by 500 M+ users and optimised the sync engine for "
            "large files."
        ),
        impact_metrics=("Shipped Paper collaborative editor to GA; reduced sync errors by 28 %."),
        tags=["Python", "TypeScript", "React", "Redis", "WebSockets"],
    ),
    dict(
        user_key="alex@careerbridge.dev",
        type=ExperienceType.PROJECT,
        title="Internal Developer Platform",
        organization="Stripe",
        start_date=date(2022, 1, 1),
        end_date=date(2023, 6, 30),
        description=(
            "Designed and built a self-service developer platform that consolidated "
            "CI/CD pipelines, feature flags, and observability dashboards into a "
            "single internal product."
        ),
        impact_metrics=(
            "Reduced new-service setup from 3 days to 2 hours; adopted by 95 % of "
            "engineering within six months."
        ),
        tags=["Platform Engineering", "Developer Experience", "Backstage", "Terraform"],
    ),
    dict(
        user_key="alex@careerbridge.dev",
        type=ExperienceType.ACHIEVEMENT,
        title="Reduced API Latency 40 % Through Query Optimisation",
        organization="Stripe",
        start_date=date(2021, 9, 1),
        end_date=date(2021, 12, 31),
        description=(
            "Identified N+1 query patterns in the billing service using distributed "
            "tracing. Rewrote hot paths and introduced a read-replica routing layer."
        ),
        impact_metrics=(
            "P95 latency dropped from 320 ms to 190 ms; saved an estimated "
            "$120 k/year in compute costs."
        ),
        tags=["Performance", "PostgreSQL", "Distributed Systems"],
    ),
    dict(
        user_key="alex@careerbridge.dev",
        type=ExperienceType.SKILL,
        title="Backend & Infrastructure Engineering",
        organization=None,
        start_date=None,
        end_date=None,
        description=(
            "Eight years building production backend systems. Strong in API design, "
            "database optimisation, distributed systems, and infrastructure as code."
        ),
        impact_metrics=None,
        tags=["Python", "Go", "PostgreSQL", "Redis", "Kubernetes", "Terraform", "AWS"],
    ),
    dict(
        user_key="alex@careerbridge.dev",
        type=ExperienceType.CERTIFICATION,
        title="AWS Certified Solutions Architect – Professional",
        organization="Amazon Web Services",
        start_date=date(2022, 5, 15),
        end_date=date(2025, 5, 15),
        description="Passed SAP-C02 with a score of 847/1000.",
        impact_metrics=None,
        tags=["AWS", "Cloud Architecture", "Certification"],
    ),
    # ── Priya Sharma — Data Scientist transitioning to ML Engineer ────────────
    dict(
        user_key="priya@careerbridge.dev",
        type=ExperienceType.ROLE,
        title="Lead Data Scientist",
        organization="Spotify",
        start_date=date(2021, 4, 1),
        end_date=None,
        description=(
            "Led a team of six data scientists building personalisation and "
            "recommendation features for 600 M monthly active users. Responsible for "
            "model strategy, ML platform adoption, and stakeholder alignment."
        ),
        impact_metrics=(
            "Increased Discover Weekly stream-completion rate by 18 %; team shipped "
            "four production models in 2023."
        ),
        tags=["Python", "PyTorch", "Spark", "MLflow", "Recommendation Systems"],
    ),
    dict(
        user_key="priya@careerbridge.dev",
        type=ExperienceType.ROLE,
        title="Data Analyst",
        organization="Airbnb",
        start_date=date(2018, 8, 1),
        end_date=date(2021, 3, 31),
        description=(
            "Embedded analyst on the Trust & Safety team. Built fraud-detection "
            "dashboards, designed A/B experiments, and created the first ML prototype "
            "for anomaly detection in host reviews."
        ),
        impact_metrics=(
            "Fraud detection model reduced chargebacks by $2.4 M/year; review "
            "anomaly precision reached 91 %."
        ),
        tags=["SQL", "Python", "dbt", "Looker", "A/B Testing"],
    ),
    dict(
        user_key="priya@careerbridge.dev",
        type=ExperienceType.PROJECT,
        title="Real-Time Music Recommendation Engine",
        organization="Spotify",
        start_date=date(2022, 6, 1),
        end_date=date(2023, 3, 31),
        description=(
            "Re-architected the core recommendation pipeline to process listening "
            "events in real time using Kafka and a two-tower neural network model. "
            "Replaced a 24-hour batch job with sub-second feature freshness."
        ),
        impact_metrics=("Home feed CTR improved by 23 %; P99 serving latency held under 50 ms."),
        tags=["PyTorch", "Kafka", "Feature Store", "Two-Tower Model", "Real-Time ML"],
    ),
    dict(
        user_key="priya@careerbridge.dev",
        type=ExperienceType.ACHIEVEMENT,
        title="Scaled ML Training Infrastructure to 10× Throughput",
        organization="Spotify",
        start_date=date(2023, 1, 1),
        end_date=date(2023, 6, 30),
        description=(
            "Migrated model training from on-premise GPU clusters to GCP Vertex AI "
            "with spot-instance orchestration. Implemented distributed data loading "
            "and gradient checkpointing."
        ),
        impact_metrics=("Training throughput increased 10×; training costs reduced by 60 %."),
        tags=["GCP", "Vertex AI", "Distributed Training", "PyTorch", "Cost Optimisation"],
    ),
    dict(
        user_key="priya@careerbridge.dev",
        type=ExperienceType.SKILL,
        title="Machine Learning & Data Engineering",
        organization=None,
        start_date=None,
        end_date=None,
        description=(
            "End-to-end ML practitioner: feature engineering, model development, "
            "evaluation, and production deployment. Experienced with both batch and "
            "real-time serving patterns."
        ),
        impact_metrics=None,
        tags=["Python", "PyTorch", "TensorFlow", "Spark", "SQL", "dbt", "MLflow", "Kafka"],
    ),
    dict(
        user_key="priya@careerbridge.dev",
        type=ExperienceType.CERTIFICATION,
        title="Google Professional Machine Learning Engineer",
        organization="Google Cloud",
        start_date=date(2023, 9, 20),
        end_date=date(2026, 9, 20),
        description=(
            "Passed with distinction. Covered MLOps, model monitoring, and "
            "Vertex AI managed pipelines."
        ),
        impact_metrics=None,
        tags=["GCP", "MLOps", "Machine Learning", "Certification"],
    ),
    # ── Marcus Johnson — DevOps Engineer transitioning to Platform Engineering ─
    dict(
        user_key="marcus@careerbridge.dev",
        type=ExperienceType.ROLE,
        title="Staff DevOps Engineer",
        organization="GitHub",
        start_date=date(2019, 2, 1),
        end_date=None,
        description=(
            "Staff-level engineer on the Deployment Platform team, responsible for "
            "the systems that deploy GitHub.com tens of thousands of times per year. "
            "Defined the strategic direction for container orchestration and GitOps "
            "adoption across 1 200 engineers."
        ),
        impact_metrics=(
            "Reduced mean deployment time from 45 min to 8 min; achieved "
            "99.998 % deployment success rate."
        ),
        tags=["Kubernetes", "ArgoCD", "Terraform", "Go", "GitOps"],
    ),
    dict(
        user_key="marcus@careerbridge.dev",
        type=ExperienceType.ROLE,
        title="Site Reliability Engineer",
        organization="Twitter",
        start_date=date(2016, 5, 1),
        end_date=date(2019, 1, 31),
        description=(
            "SRE embedded in the Timelines team. Owned availability SLOs for the "
            "home timeline service (3 000 rps peak), led on-call rotations, and drove "
            "observability improvements with distributed tracing."
        ),
        impact_metrics=(
            "Improved home timeline availability from 99.85 % to 99.97 %; reduced MTTR by 55 %."
        ),
        tags=["Scala", "Kubernetes", "Prometheus", "Jaeger", "SLO/SLA"],
    ),
    dict(
        user_key="marcus@careerbridge.dev",
        type=ExperienceType.PROJECT,
        title="Zero-Downtime Continuous Deployment Pipeline",
        organization="GitHub",
        start_date=date(2020, 3, 1),
        end_date=date(2021, 1, 31),
        description=(
            "Designed and implemented a new deployment pipeline supporting canary "
            "releases, automated rollback, and real-time traffic shifting. Replaced "
            "a legacy Capistrano-based system with an ArgoCD + Argo Rollouts stack."
        ),
        impact_metrics=(
            "Deployment cycle shortened by 82 %; zero production incidents "
            "attributable to the pipeline during its first year."
        ),
        tags=["ArgoCD", "Argo Rollouts", "Kubernetes", "Canary Deployments", "GitOps"],
    ),
    dict(
        user_key="marcus@careerbridge.dev",
        type=ExperienceType.ACHIEVEMENT,
        title="Drove Platform-Wide Adoption of Infrastructure as Code",
        organization="GitHub",
        start_date=date(2021, 6, 1),
        end_date=date(2022, 6, 30),
        description=(
            "Led a year-long initiative to migrate 340 manually-managed cloud "
            "resources to Terraform, establishing module standards, a central state "
            "backend, and self-service provisioning workflows."
        ),
        impact_metrics=(
            "340 resources migrated; provisioning time reduced from 2 weeks to "
            "1 hour; configuration drift incidents eliminated."
        ),
        tags=["Terraform", "AWS", "IaC", "Platform Engineering", "Governance"],
    ),
    dict(
        user_key="marcus@careerbridge.dev",
        type=ExperienceType.SKILL,
        title="Platform & Infrastructure Engineering",
        organization=None,
        start_date=None,
        end_date=None,
        description=(
            "Deep expertise in cloud-native infrastructure, container orchestration, "
            "observability, and developer platforms. Builder and operator mindset."
        ),
        impact_metrics=None,
        tags=["Kubernetes", "Terraform", "AWS", "GCP", "Go", "Python", "ArgoCD", "Prometheus"],
    ),
    dict(
        user_key="marcus@careerbridge.dev",
        type=ExperienceType.CERTIFICATION,
        title="Certified Kubernetes Administrator (CKA)",
        organization="Cloud Native Computing Foundation",
        start_date=date(2021, 11, 8),
        end_date=date(2024, 11, 8),
        description=(
            "Passed with a score of 89 %. Covers cluster setup, maintenance, "
            "networking, and troubleshooting."
        ),
        impact_metrics=None,
        tags=["Kubernetes", "CKA", "Certification", "Cloud Native"],
    ),
]


# ─── Seed runner ──────────────────────────────────────────────────────────────


async def _run() -> None:
    settings = get_settings()
    auth_service = AuthService(settings)
    factory = get_session_factory()

    async with factory() as session:
        # ── Users ──────────────────────────────────────────────────────────
        print("─── Users ───────────────────────────────────────────────────────")
        user_ids: dict[str, uuid.UUID] = {}

        for u in _USERS:
            result = await session.execute(select(User).where(User.email == u["email"]))
            existing = result.scalar_one_or_none()
            if existing:
                user_ids[u["email"]] = existing.id
                print(f"  skip   {u['email']} (already exists)")
            else:
                user = User(
                    email=u["email"],
                    name=u["name"],
                    hashed_password=auth_service.hash_password(u["password"]),
                    is_active=True,
                    is_verified=True,
                )
                session.add(user)
                await session.flush()
                user_ids[u["email"]] = user.id
                print(f"  create {u['email']}")

        await session.commit()

        # ── Experiences ────────────────────────────────────────────────────
        print()
        print("─── Experiences ─────────────────────────────────────────────────")

        now = _utcnow()

        # Build deterministic IDs for every seed experience up front so we can
        # check for existing rows in a single query.
        planned: list[tuple[uuid.UUID, dict]] = []
        for exp in _EXPERIENCES:
            user_id = user_ids[exp["user_key"]]
            exp_id = _seed_uuid(str(user_id), exp["type"].value, exp["title"])
            planned.append((exp_id, exp))

        existing_result = await session.execute(
            select(Experience.id).where(Experience.id.in_([eid for eid, _ in planned]))
        )
        existing_ids = {row[0] for row in existing_result}

        inserted = 0
        for exp_id, exp in planned:
            if exp_id in existing_ids:
                continue
            session.add(
                Experience(
                    id=exp_id,
                    user_id=user_ids[exp["user_key"]],
                    type=exp["type"],
                    title=exp["title"],
                    organization=exp.get("organization"),
                    start_date=exp.get("start_date"),
                    end_date=exp.get("end_date"),
                    description=exp.get("description"),
                    impact_metrics=exp.get("impact_metrics"),
                    tags=exp.get("tags", []),
                    created_at=now,
                    updated_at=now,
                )
            )
            inserted += 1

        await session.commit()

        skipped = len(planned) - inserted
        print(f"  {inserted} inserted, {skipped} already existed ({len(planned)} total)")

    # ── Summary ────────────────────────────────────────────────────────────────
    print()
    print("─── Done ────────────────────────────────────────────────────────────")
    print()
    print("Seed credentials (password is the same for all users):")
    for u in _USERS:
        print(f"  {u['email']}  /  {u['password']}")
    print()


def main() -> None:
    try:
        asyncio.run(_run())
    except Exception as exc:  # noqa: BLE001
        print(f"\nSeed failed: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
