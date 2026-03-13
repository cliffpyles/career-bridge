"""
Seed the development database with realistic mock data.

Idempotent — safe to run multiple times:
  - Users are matched by e-mail; existing records are left untouched.
  - Experiences use deterministic UUIDs (uuid5) keyed on user + type + title,
    so re-runs are no-ops via INSERT … ON CONFLICT (id) DO NOTHING.

Requires PostgreSQL to be running (start it with `devenv up` in a separate
terminal, or run `devenv up --detach` first).

Usage (inside the devenv shell):
    seed

Or from any shell at the repo root:
    devenv shell -- seed
"""

import asyncio
import socket
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
from app.models.resume import Resume, ResumeVersion
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
        impact_metrics=(
            "Reduced P95 API latency by 40 %; decreased on-call incidents by 35 %."
        ),
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
        impact_metrics=(
            "Shipped Paper collaborative editor to GA; reduced sync errors by 28 %."
        ),
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
        impact_metrics=(
            "Home feed CTR improved by 23 %; P99 serving latency held under 50 ms."
        ),
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
        impact_metrics=(
            "Training throughput increased 10×; training costs reduced by 60 %."
        ),
        tags=[
            "GCP",
            "Vertex AI",
            "Distributed Training",
            "PyTorch",
            "Cost Optimisation",
        ],
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
        tags=[
            "Python",
            "PyTorch",
            "TensorFlow",
            "Spark",
            "SQL",
            "dbt",
            "MLflow",
            "Kafka",
        ],
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
        tags=[
            "Kubernetes",
            "Terraform",
            "AWS",
            "GCP",
            "Go",
            "Python",
            "ArgoCD",
            "Prometheus",
        ],
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


# ─── Seed resumes ─────────────────────────────────────────────────────────────
# Each entry provides the top-level resume fields plus a full `sections` payload
# that mirrors the JSONB structure used by the frontend.
# `user_key` is the owning user's e-mail (resolved at runtime).

_RESUMES: list[dict] = [
    # ── Alex Chen — two targeted resumes ──────────────────────────────────────
    dict(
        user_key="alex@careerbridge.dev",
        name="Software Engineering — Backend Focus",
        sections=[
            {
                "type": "header",
                "name": "Alex Chen",
                "email": "alex@careerbridge.dev",
                "phone": "415-555-0101",
                "location": "San Francisco, CA",
                "website": "alexchen.dev",
                "linkedin": "linkedin.com/in/alexchen",
            },
            {
                "type": "summary",
                "content": (
                    "Staff-level backend engineer with 8 years of experience building "
                    "high-throughput distributed systems at Stripe and Dropbox. Deep "
                    "expertise in Python, Go, API design, and cloud infrastructure. "
                    "Track record of leading teams and driving platform improvements "
                    "that measurably reduce latency and operational cost."
                ),
            },
            {
                "type": "experience",
                "entries": [
                    {
                        "id": "alex-exp-1",
                        "title": "Senior Software Engineer",
                        "company": "Stripe",
                        "location": "San Francisco, CA",
                        "start_date": "2020-03",
                        "end_date": None,
                        "current": True,
                        "bullets": [
                            "Led team of 5 engineers building Stripe's developer platform.",
                            "Drove monolith-to-microservices migration of the API gateway.",
                            "Cut P95 API latency 40%; reduced on-call incidents 35%.",
                        ],
                    },
                    {
                        "id": "alex-exp-2",
                        "title": "Software Engineer",
                        "company": "Dropbox",
                        "location": "San Francisco, CA",
                        "start_date": "2017-06",
                        "end_date": "2020-02",
                        "current": False,
                        "bullets": [
                            "Built real-time document editing shipped to 500M+ users.",
                            "Optimised sync engine for large files; cut sync errors 28%.",
                        ],
                    },
                ],
            },
            {
                "type": "projects",
                "entries": [
                    {
                        "id": "alex-proj-1",
                        "name": "Internal Developer Platform",
                        "description": "Self-service CI/CD, feature flags, and observability hub.",
                        "technologies": [
                            "Python",
                            "Go",
                            "Backstage",
                            "Terraform",
                            "Kubernetes",
                        ],
                        "url": "",
                        "bullets": [
                            "Reduced new-service setup from 3 days to 2 hours.",
                            "Adopted by 95% of engineering within six months of launch.",
                        ],
                    },
                ],
            },
            {
                "type": "skills",
                "categories": [
                    {"name": "Languages", "skills": ["Python", "Go", "TypeScript"]},
                    {
                        "name": "Infrastructure",
                        "skills": ["Kubernetes", "Terraform", "AWS", "Redis"],
                    },
                    {
                        "name": "Practices",
                        "skills": [
                            "API Design",
                            "Distributed Systems",
                            "SLO/SLA",
                            "On-Call",
                        ],
                    },
                ],
            },
            {
                "type": "education",
                "entries": [
                    {
                        "id": "alex-edu-1",
                        "institution": "UC Berkeley",
                        "degree": "B.S.",
                        "field": "Electrical Engineering & Computer Science",
                        "start_date": "2013",
                        "end_date": "2017",
                        "gpa": "3.8",
                    },
                ],
            },
        ],
    ),
    dict(
        user_key="alex@careerbridge.dev",
        name="Technical Product Manager",
        sections=[
            {
                "type": "header",
                "name": "Alex Chen",
                "email": "alex@careerbridge.dev",
                "phone": "415-555-0101",
                "location": "San Francisco, CA",
                "linkedin": "linkedin.com/in/alexchen",
            },
            {
                "type": "summary",
                "content": (
                    "Engineering leader transitioning to product management. 8 years "
                    "building developer-facing products at scale. Proven ability to "
                    "define platform strategy, align cross-functional stakeholders, and "
                    "ship products that directly improve developer productivity."
                ),
            },
            {
                "type": "experience",
                "entries": [
                    {
                        "id": "alex-pm-exp-1",
                        "title": "Senior Software Engineer → Technical Lead",
                        "company": "Stripe",
                        "location": "San Francisco, CA",
                        "start_date": "2020-03",
                        "end_date": None,
                        "current": True,
                        "bullets": [
                            "Drove roadmap for internal developer platform used by 400+ engineers.",
                            "Coordinated delivery across 3 teams; presented strategy to VP Eng.",
                            "Reduced onboarding time for new services from 3 days to 2 hours.",
                        ],
                    },
                ],
            },
            {
                "type": "projects",
                "entries": [],
            },
            {
                "type": "skills",
                "categories": [
                    {
                        "name": "Product",
                        "skills": [
                            "Roadmapping",
                            "OKRs",
                            "User Research",
                            "A/B Testing",
                        ],
                    },
                    {
                        "name": "Technical",
                        "skills": ["Python", "Go", "API Design", "Distributed Systems"],
                    },
                    {"name": "Tools", "skills": ["Jira", "Figma", "Notion", "SQL"]},
                ],
            },
            {
                "type": "education",
                "entries": [
                    {
                        "id": "alex-pm-edu-1",
                        "institution": "UC Berkeley",
                        "degree": "B.S.",
                        "field": "Electrical Engineering & Computer Science",
                        "start_date": "2013",
                        "end_date": "2017",
                        "gpa": "3.8",
                    },
                ],
            },
        ],
    ),
    # ── Priya Sharma — two targeted resumes ───────────────────────────────────
    dict(
        user_key="priya@careerbridge.dev",
        name="ML Engineer",
        sections=[
            {
                "type": "header",
                "name": "Priya Sharma",
                "email": "priya@careerbridge.dev",
                "phone": "650-555-0202",
                "location": "New York, NY",
                "linkedin": "linkedin.com/in/priyasharma",
            },
            {
                "type": "summary",
                "content": (
                    "ML Engineer and Lead Data Scientist with 7 years of experience "
                    "designing and deploying large-scale recommendation and personalisation "
                    "systems. Currently leading ML at Spotify. Seeking to bring a deep "
                    "modelling background into a hands-on ML engineering role focused on "
                    "real-time inference and platform reliability."
                ),
            },
            {
                "type": "experience",
                "entries": [
                    {
                        "id": "priya-exp-1",
                        "title": "Lead Data Scientist",
                        "company": "Spotify",
                        "location": "New York, NY",
                        "start_date": "2021-04",
                        "end_date": None,
                        "current": True,
                        "bullets": [
                            "Led 6 data scientists; shipped personalisation models for 600M MAU.",
                            "Real-time Kafka + two-tower pipeline improved home feed CTR 23%.",
                            "Migrated training to Vertex AI; cut costs 60%, throughput 10×.",
                        ],
                    },
                    {
                        "id": "priya-exp-2",
                        "title": "Data Analyst",
                        "company": "Airbnb",
                        "location": "San Francisco, CA",
                        "start_date": "2018-08",
                        "end_date": "2021-03",
                        "current": False,
                        "bullets": [
                            "Built fraud/anomaly detection prototype; precision 91%.",
                            "Fraud detection model reduced chargebacks by $2.4M/year.",
                        ],
                    },
                ],
            },
            {
                "type": "projects",
                "entries": [
                    {
                        "id": "priya-proj-1",
                        "name": "Real-Time Music Recommendation Engine",
                        "description": "Batch pipeline replaced with sub-second feature freshness.",
                        "technologies": ["PyTorch", "Kafka", "Feature Store", "GCP"],
                        "url": "",
                        "bullets": [
                            "Replaced batch pipeline; P99 serving latency held under 50ms.",
                            "Home feed CTR improved 23% post-launch.",
                        ],
                    },
                ],
            },
            {
                "type": "skills",
                "categories": [
                    {
                        "name": "ML / AI",
                        "skills": ["PyTorch", "TensorFlow", "Scikit-learn", "XGBoost"],
                    },
                    {
                        "name": "Data Engineering",
                        "skills": ["Spark", "Kafka", "dbt", "Airflow", "SQL"],
                    },
                    {
                        "name": "MLOps",
                        "skills": [
                            "MLflow",
                            "Vertex AI",
                            "Feature Store",
                            "Docker",
                            "GCP",
                        ],
                    },
                ],
            },
            {
                "type": "education",
                "entries": [
                    {
                        "id": "priya-edu-1",
                        "institution": "Carnegie Mellon University",
                        "degree": "M.S.",
                        "field": "Machine Learning",
                        "start_date": "2016",
                        "end_date": "2018",
                    },
                    {
                        "id": "priya-edu-2",
                        "institution": "IIT Delhi",
                        "degree": "B.Tech",
                        "field": "Computer Science",
                        "start_date": "2012",
                        "end_date": "2016",
                    },
                ],
            },
        ],
    ),
    dict(
        user_key="priya@careerbridge.dev",
        name="Senior Data Scientist",
        sections=[
            {
                "type": "header",
                "name": "Priya Sharma",
                "email": "priya@careerbridge.dev",
                "phone": "650-555-0202",
                "location": "New York, NY",
                "linkedin": "linkedin.com/in/priyasharma",
            },
            {
                "type": "summary",
                "content": (
                    "Senior Data Scientist with expertise in recommendation systems, "
                    "NLP, and experimentation at scale. Led teams shipping production "
                    "models at Spotify (600M MAU) and Airbnb. Strong background in "
                    "A/B testing, causal inference, and stakeholder communication."
                ),
            },
            {
                "type": "experience",
                "entries": [
                    {
                        "id": "priya-ds-exp-1",
                        "title": "Lead Data Scientist",
                        "company": "Spotify",
                        "location": "New York, NY",
                        "start_date": "2021-04",
                        "end_date": None,
                        "current": True,
                        "bullets": [
                            "Raised Discover Weekly stream-completion rate 18% via embeddings.",
                            "Shipped 4 production models in 2023; managed roadmap and reviews.",
                        ],
                    },
                ],
            },
            {
                "type": "projects",
                "entries": [],
            },
            {
                "type": "skills",
                "categories": [
                    {
                        "name": "Data Science",
                        "skills": [
                            "Python",
                            "PyTorch",
                            "Scikit-learn",
                            "Statistics",
                            "A/B Testing",
                        ],
                    },
                    {"name": "Data", "skills": ["SQL", "Spark", "dbt", "Looker"]},
                    {
                        "name": "Communication",
                        "skills": [
                            "Executive Presentations",
                            "Roadmapping",
                            "Cross-Functional Alignment",
                        ],
                    },
                ],
            },
            {
                "type": "education",
                "entries": [
                    {
                        "id": "priya-ds-edu-1",
                        "institution": "Carnegie Mellon University",
                        "degree": "M.S.",
                        "field": "Machine Learning",
                        "start_date": "2016",
                        "end_date": "2018",
                    },
                ],
            },
        ],
    ),
    # ── Marcus Johnson — two targeted resumes ─────────────────────────────────
    dict(
        user_key="marcus@careerbridge.dev",
        name="Platform Engineering",
        sections=[
            {
                "type": "header",
                "name": "Marcus Johnson",
                "email": "marcus@careerbridge.dev",
                "phone": "206-555-0303",
                "location": "Seattle, WA",
                "linkedin": "linkedin.com/in/marcusjohnson",
            },
            {
                "type": "summary",
                "content": (
                    "Staff Platform Engineer with 10 years of experience owning "
                    "large-scale deployment platforms, developer tooling, and cloud "
                    "infrastructure. Built the system that deploys GitHub.com tens of "
                    "thousands of times per year. Expert in Kubernetes, GitOps, and IaC."
                ),
            },
            {
                "type": "experience",
                "entries": [
                    {
                        "id": "marcus-exp-1",
                        "title": "Staff DevOps Engineer",
                        "company": "GitHub",
                        "location": "Seattle, WA (Remote)",
                        "start_date": "2019-02",
                        "end_date": None,
                        "current": True,
                        "bullets": [
                            "Owned platform deploying GitHub.com 10,000+ times per year.",
                            "Cut mean deploy time 45→8 min; 99.998% deployment success rate.",
                            "IaC migration: 340 resources to Terraform, 2 weeks→1 hour.",
                        ],
                    },
                    {
                        "id": "marcus-exp-2",
                        "title": "Site Reliability Engineer",
                        "company": "Twitter",
                        "location": "San Francisco, CA",
                        "start_date": "2016-05",
                        "end_date": "2019-01",
                        "current": False,
                        "bullets": [
                            "Owned SLOs for home timeline service (3,000 rps peak).",
                            "Improved availability 99.85%→99.97%; cut MTTR by 55%.",
                        ],
                    },
                ],
            },
            {
                "type": "projects",
                "entries": [
                    {
                        "id": "marcus-proj-1",
                        "name": "Zero-Downtime Continuous Deployment Pipeline",
                        "description": "Canary: auto-rollback and real-time traffic shifting.",
                        "technologies": ["ArgoCD", "Argo Rollouts", "Kubernetes", "Go"],
                        "url": "",
                        "bullets": [
                            "Replaced Capistrano; deployment cycle shortened by 82%.",
                            "Zero pipeline-attributable incidents in its first year.",
                        ],
                    },
                ],
            },
            {
                "type": "skills",
                "categories": [
                    {
                        "name": "Orchestration",
                        "skills": ["Kubernetes", "ArgoCD", "Argo Rollouts", "Helm"],
                    },
                    {
                        "name": "IaC & Cloud",
                        "skills": ["Terraform", "AWS", "GCP", "Pulumi"],
                    },
                    {
                        "name": "Observability",
                        "skills": ["Prometheus", "Grafana", "Jaeger", "OpenTelemetry"],
                    },
                    {"name": "Languages", "skills": ["Go", "Python", "Bash"]},
                ],
            },
            {
                "type": "education",
                "entries": [
                    {
                        "id": "marcus-edu-1",
                        "institution": "University of Washington",
                        "degree": "B.S.",
                        "field": "Computer Science",
                        "start_date": "2012",
                        "end_date": "2016",
                    },
                ],
            },
        ],
    ),
    dict(
        user_key="marcus@careerbridge.dev",
        name="Staff Site Reliability Engineer",
        sections=[
            {
                "type": "header",
                "name": "Marcus Johnson",
                "email": "marcus@careerbridge.dev",
                "phone": "206-555-0303",
                "location": "Seattle, WA",
                "linkedin": "linkedin.com/in/marcusjohnson",
            },
            {
                "type": "summary",
                "content": (
                    "Staff SRE with a decade of experience owning reliability for "
                    "high-traffic consumer systems. Deep background in SLO frameworks, "
                    "incident management, observability, and capacity planning. Strong "
                    "communicator who bridges engineering and business risk."
                ),
            },
            {
                "type": "experience",
                "entries": [
                    {
                        "id": "marcus-sre-exp-1",
                        "title": "Staff DevOps Engineer",
                        "company": "GitHub",
                        "location": "Seattle, WA (Remote)",
                        "start_date": "2019-02",
                        "end_date": None,
                        "current": True,
                        "bullets": [
                            "Defined SLO strategy; 99.998% success rate over 18 months.",
                            "On-call lead for critical deploys; drove MTTR below 5 min.",
                        ],
                    },
                    {
                        "id": "marcus-sre-exp-2",
                        "title": "Site Reliability Engineer",
                        "company": "Twitter",
                        "location": "San Francisco, CA",
                        "start_date": "2016-05",
                        "end_date": "2019-01",
                        "current": False,
                        "bullets": [
                            "Home timeline availability improved from 99.85% to 99.97%.",
                            "Led blameless post-mortem culture adoption across the Timelines team.",
                        ],
                    },
                ],
            },
            {
                "type": "projects",
                "entries": [],
            },
            {
                "type": "skills",
                "categories": [
                    {
                        "name": "Reliability",
                        "skills": [
                            "SLO/SLA",
                            "Error Budgets",
                            "Incident Command",
                            "Chaos Engineering",
                        ],
                    },
                    {
                        "name": "Observability",
                        "skills": ["Prometheus", "Grafana", "Jaeger", "PagerDuty"],
                    },
                    {
                        "name": "Infrastructure",
                        "skills": ["Kubernetes", "AWS", "Terraform"],
                    },
                ],
            },
            {
                "type": "education",
                "entries": [
                    {
                        "id": "marcus-sre-edu-1",
                        "institution": "University of Washington",
                        "degree": "B.S.",
                        "field": "Computer Science",
                        "start_date": "2012",
                        "end_date": "2016",
                    },
                ],
            },
        ],
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
        print(
            f"  {inserted} inserted, {skipped} already existed ({len(planned)} total)"
        )

        # ── Resumes ────────────────────────────────────────────────────────────
        print()
        print("─── Resumes ─────────────────────────────────────────────────────")

        resume_planned: list[tuple[uuid.UUID, dict]] = []
        for r in _RESUMES:
            user_id = user_ids[r["user_key"]]
            resume_id = _seed_uuid(str(user_id), "resume", r["name"])
            resume_planned.append((resume_id, r))

        existing_resume_result = await session.execute(
            select(Resume.id).where(Resume.id.in_([rid for rid, _ in resume_planned]))
        )
        existing_resume_ids = {row[0] for row in existing_resume_result}

        resumes_inserted = 0
        for resume_id, r in resume_planned:
            if resume_id in existing_resume_ids:
                continue
            user_id = user_ids[r["user_key"]]
            resume = Resume(
                id=resume_id,
                user_id=user_id,
                name=r["name"],
                version=1,
                sections=r["sections"],
                created_at=now,
                updated_at=now,
            )
            session.add(resume)
            # Initial version snapshot
            version = ResumeVersion(
                id=_seed_uuid(str(resume_id), "version", "1"),
                resume_id=resume_id,
                version=1,
                name=r["name"],
                sections=r["sections"],
                created_at=now,
            )
            session.add(version)
            resumes_inserted += 1

        await session.commit()

        resumes_skipped = len(resume_planned) - resumes_inserted
        print(
            f"  {resumes_inserted} inserted, {resumes_skipped} already existed "
            f"({len(resume_planned)} total)"
        )

    # ── Summary ────────────────────────────────────────────────────────────────
    print()
    print("─── Done ────────────────────────────────────────────────────────────")
    print()
    print("Seed credentials (password is the same for all users):")
    for u in _USERS:
        print(f"  {u['email']}  /  {u['password']}")
    print()


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
        print(f"\nSeed failed: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
