"""
JobMatchService — computes a match score between a job posting and a user's
experience library.

Phase 8 uses keyword-based scoring as a fast, dependency-free baseline.
When the AI service (Phase 6) is available, this service can be enhanced to
delegate to it for semantic scoring. The interface is unchanged.
"""

import re
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.experience import Experience
    from app.models.job import Job


def _extract_keywords(text: str) -> set[str]:
    """Normalise and tokenise a text string into a set of lowercase keywords."""
    if not text:
        return set()
    # Lowercase, keep alphanumeric and hyphens, split on whitespace / punctuation
    cleaned = re.sub(r"[^a-z0-9\-\+#]", " ", text.lower())
    tokens = cleaned.split()
    # Filter very short tokens and common stop words
    stop_words = {
        "the",
        "and",
        "or",
        "in",
        "at",
        "of",
        "to",
        "a",
        "an",
        "is",
        "are",
        "was",
        "were",
        "for",
        "on",
        "with",
        "as",
        "by",
        "from",
        "this",
        "that",
        "have",
        "has",
        "had",
        "not",
        "be",
        "been",
        "will",
        "would",
        "could",
        "should",
        "our",
        "your",
        "we",
        "you",
        "i",
        "it",
        "its",
    }
    return {t for t in tokens if len(t) > 1 and t not in stop_words}


def _job_keywords(job: "Job") -> set[str]:
    """Extract all relevant keywords from a job posting."""
    parts = [
        job.title or "",
        job.company or "",
        job.description or "",
        job.location or "",
    ]
    return _extract_keywords(" ".join(parts))


def _experience_keywords(experiences: "list[Experience]") -> set[str]:
    """Build a keyword set from the user's full experience library."""
    parts: list[str] = []
    for exp in experiences:
        parts.append(exp.title or "")
        parts.append(exp.organization or "")
        parts.append(exp.description or "")
        parts.append(exp.impact_metrics or "")
        parts.extend(exp.tags or [])
    return _extract_keywords(" ".join(parts))


def compute_match_score(job: "Job", experiences: "list[Experience]") -> int:
    """
    Return an integer match score from 0–100.

    Uses Jaccard similarity between the job's keyword set and the user's
    experience keyword set, mapped to a 0–100 scale with a slight boost to
    avoid showing everyone at 0% when there is minimal overlap.

    The score is intentionally approximate — it is a signal, not a precise
    measurement. AI-based semantic scoring (Phase 6) will replace this.
    """
    if not experiences:
        return 0

    job_kw = _job_keywords(job)
    exp_kw = _experience_keywords(experiences)

    if not job_kw or not exp_kw:
        return 0

    intersection = job_kw & exp_kw
    union = job_kw | exp_kw

    jaccard = len(intersection) / len(union) if union else 0.0

    # Map to a friendlier 0–100 range:
    #   - Raw Jaccard is typically low even for strong matches (sparse overlap).
    #   - We scale so ~0.10 Jaccard ≈ 70% match and ~0.20 Jaccard ≈ 90% match.
    #   - Capped at 98 to signal that no automated score is perfect.
    scaled = min(98, int(jaccard * 5 * 100))

    return max(0, scaled)
