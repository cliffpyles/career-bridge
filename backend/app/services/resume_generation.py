"""
ResumeGenerationService — AI-powered resume tailoring from a job description.

Two-step pipeline:
  1. Experience selection: AI picks the most relevant experience library entries.
  2. Resume generation:   AI builds structured resume sections from selected entries.
"""

from __future__ import annotations

import uuid
from typing import Any

from app.services.ai.base import AIService

_SELECTION_SYSTEM = (
    "You are an expert resume writer and career coach with deep knowledge of "
    "ATS systems and modern hiring practices. Your goal is to select the most "
    "relevant experiences from a candidate's library to build a targeted, "
    "compelling resume for a specific role."
)

_SELECTION_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "selected_ids": {
            "type": "array",
            "items": {"type": "string"},
            "description": (
                "IDs of experiences to include, ordered by relevance (most relevant first)."
            ),
        },
        "rationale": {
            "type": "string",
            "description": "Brief explanation of the selection strategy.",
        },
    },
    "required": ["selected_ids", "rationale"],
}

_GENERATION_SYSTEM = (
    "You are an expert resume writer. You create ATS-optimized, professionally "
    "polished resumes that clearly communicate a candidate's fit for a specific role. "
    "Use strong action verbs, quantify impact wherever possible, and match the "
    "language and keywords of the target job description."
)

_GENERATION_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "sections": {
            "type": "array",
            "items": {
                "type": "object",
                "description": (
                    "One of: header, summary, experience, projects, "
                    "skills, or education section. "
                    "header: type, name, email, phone, location, website, linkedin. "
                    "summary: type, content. "
                    "experience: type, entries "
                    "(each: id, title, company, location, start_date, end_date, current, bullets). "
                    "projects: type, entries "
                    "(each: id, name, description, technologies, url, bullets). "
                    "skills: type, categories (each: name, skills[]). "
                    "education: type, entries "
                    "(each: id, institution, degree, field, start_date, end_date)."
                ),
            },
        }
    },
    "required": ["sections"],
}


def _experience_to_text(exp: dict[str, Any]) -> str:
    """Convert an experience dict to a concise text representation for the AI prompt."""
    parts = [f"[{exp.get('type', 'EXPERIENCE')}] {exp.get('title', 'Untitled')}"]
    if exp.get("organization"):
        parts[0] += f" @ {exp['organization']}"
    dates = []
    if exp.get("start_date"):
        dates.append(str(exp["start_date"]))
    if exp.get("end_date"):
        dates.append(str(exp["end_date"]))
    if dates:
        parts.append(" | ".join(dates))
    if exp.get("description"):
        parts.append(exp["description"])
    if exp.get("impact_metrics"):
        parts.append(f"Impact: {exp['impact_metrics']}")
    if exp.get("tags"):
        parts.append(f"Tags: {', '.join(exp['tags'])}")
    return "\n".join(parts)


def _ensure_entry_ids(sections: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Ensure every entry inside experience/projects/education/skills sections
    has a stable UUID `id` field.  The AI may omit them.
    """
    for section in sections:
        for entry_list_key in ("entries", "categories"):
            entries = section.get(entry_list_key)
            if isinstance(entries, list):
                for entry in entries:
                    if isinstance(entry, dict) and not entry.get("id"):
                        entry["id"] = str(uuid.uuid4())
    return sections


class ResumeGenerationService:
    """
    Orchestrates AI-powered resume generation.

    Usage::

        svc = ResumeGenerationService(ai_service)
        result = await svc.generate(job_description, experiences, name="ML Engineer Resume")
    """

    def __init__(self, ai_service: AIService) -> None:
        self.ai = ai_service

    async def select_relevant_experiences(
        self,
        job_description: str,
        experiences: list[dict[str, Any]],
        max_selected: int = 10,
    ) -> list[dict[str, Any]]:
        """
        Ask the AI to pick the most relevant experiences for the given job.
        Returns the subset of `experiences` whose IDs were selected.
        """
        if not experiences:
            return []

        exp_descriptions = "\n\n---\n\n".join(
            f"ID: {exp.get('id', 'unknown')}\n{_experience_to_text(exp)}" for exp in experiences
        )

        prompt = (
            f"Job Description:\n```\n{job_description}\n```\n\n"
            f"Candidate's Experience Library (select up to {max_selected} entries):\n\n"
            f"{exp_descriptions}\n\n"
            "Select the most relevant experiences for this specific role. "
            "Prioritise entries that demonstrate direct skill overlap, quantified impact, "
            "or seniority alignment with the job requirements."
        )

        result = await self.ai.generate_structured(
            prompt=prompt,
            schema=_SELECTION_SCHEMA,
            system=_SELECTION_SYSTEM,
        )

        selected_ids: set[str] = set(result.get("selected_ids", []))
        # Preserve original ordering, filter to selected set
        return [e for e in experiences if str(e.get("id", "")) in selected_ids]

    async def generate_resume_sections(
        self,
        job_description: str,
        selected_experiences: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        """
        Ask the AI to generate structured resume sections from the selected experiences.
        Returns a list of section dicts matching the frontend `ResumeSection` types.
        """
        if selected_experiences:
            exp_details = "\n\n---\n\n".join(
                f"ID: {exp.get('id', 'unknown')}\n{_experience_to_text(exp)}"
                for exp in selected_experiences
            )
        else:
            exp_details = "(No experience entries provided — generate a skeleton resume.)"

        prompt = (
            f"Job Description:\n```\n{job_description}\n```\n\n"
            f"Selected Candidate Experiences:\n\n{exp_details}\n\n"
            "Generate a complete, professional resume with these sections in order: "
            "header, summary, experience, projects, skills, education.\n\n"
            "Guidelines:\n"
            "- header: Use placeholder contact info (e.g. 'your.email@example.com') "
            "  since we don't have the candidate's details.\n"
            "- summary: 2–3 sentences tailored to this specific role.\n"
            "- experience: 2–4 most relevant roles, 3–4 bullet points each, "
            "  starting with strong action verbs and quantifying impact.\n"
            "- projects: Up to 3 relevant projects from the experience library.\n"
            "- skills: Grouped by category (e.g. 'Frontend', 'Backend', 'Infrastructure').\n"
            "- education: Include only if present in the experience data.\n"
            "- All 'entry' objects must include a unique 'id' string (UUID format).\n"
            "- current=true for the most recent role if it appears to be ongoing."
        )

        result = await self.ai.generate_structured(
            prompt=prompt,
            schema=_GENERATION_SCHEMA,
            system=_GENERATION_SYSTEM,
        )

        raw_sections: list[dict[str, Any]] = result.get("sections", [])
        return _ensure_entry_ids(raw_sections)

    async def generate(
        self,
        job_description: str,
        experiences: list[dict[str, Any]],
        name: str | None = None,
    ) -> dict[str, Any]:
        """
        Full pipeline: select relevant experiences → generate resume sections.

        Returns a dict compatible with `ResumeCreate`:
            {"name": "...", "sections": [...]}
        """
        selected = await self.select_relevant_experiences(job_description, experiences)
        sections = await self.generate_resume_sections(job_description, selected)

        resume_name = name or "AI-Generated Resume"
        return {
            "name": resume_name,
            "sections": sections,
        }


def experience_model_to_dict(exp: Any) -> dict[str, Any]:
    """
    Convert a SQLModel Experience instance to a plain dict suitable for AI prompts.
    Safe to call after the DB session has closed.
    """
    return {
        "id": str(exp.id),
        "type": str(exp.type),
        "title": exp.title,
        "organization": exp.organization,
        "start_date": exp.start_date.isoformat() if exp.start_date else None,
        "end_date": exp.end_date.isoformat() if exp.end_date else None,
        "description": exp.description,
        "impact_metrics": exp.impact_metrics,
        "tags": list(exp.tags) if exp.tags else [],
    }
