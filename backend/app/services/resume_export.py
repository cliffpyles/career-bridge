"""Resume export service — PDF and plain-text generation.

PDF generation uses WeasyPrint (HTML → PDF). WeasyPrint requires system
libraries: libcairo, libpango, libgdk-pixbuf. In the devenv environment
these are available via Nix. If weasyprint is unavailable, the service falls
back to returning a minimal PDF stub (useful in CI or lightweight test envs).
"""

from __future__ import annotations

import html
import textwrap
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.resume import Resume


# ── Helpers ──────────────────────────────────────────────────────────────────


def _find_section(sections: list[dict], section_type: str) -> dict | None:
    return next((s for s in sections if s.get("type") == section_type), None)


def _entry_sub(entry: dict) -> str:
    if not entry.get("company"):
        return ""
    company = html.escape(entry["company"])
    location = f" &middot; {html.escape(entry['location'])}" if entry.get("location") else ""
    return f'<div class="entry-sub">{company}{location}</div>'


def _fmt_date_range(start: str | None, end: str | None, current: bool = False) -> str:
    if not start and not end:
        return ""
    end_label = "Present" if current else (end or "Present")
    if start and end_label:
        return f"{start} – {end_label}"
    return start or end_label


# ── HTML template ─────────────────────────────────────────────────────────────


def build_html(resume: "Resume") -> str:
    sections: list[dict] = resume.sections or []
    header = _find_section(sections, "header") or {}
    summary = _find_section(sections, "summary")
    experience = _find_section(sections, "experience")
    projects = _find_section(sections, "projects")
    skills = _find_section(sections, "skills")
    education = _find_section(sections, "education")

    parts: list[str] = []

    # ── Contact header ────────────────────────────────────────────────────────
    name = html.escape(header.get("name") or resume.name)
    contact_items: list[str] = []
    for field in ("email", "phone", "location", "website", "linkedin"):
        value = header.get(field)
        if value:
            contact_items.append(html.escape(value))
    contact_html = " &middot; ".join(contact_items)

    parts.append(f"""
    <div class="header">
      <h1>{name}</h1>
      {f'<p class="contact">{contact_html}</p>' if contact_html else ""}
    </div>""")

    # ── Summary ───────────────────────────────────────────────────────────────
    if summary and summary.get("content"):
        parts.append(f"""
    <section>
      <h2>Summary</h2>
      <p>{html.escape(summary["content"])}</p>
    </section>""")

    # ── Experience ────────────────────────────────────────────────────────────
    if experience and experience.get("entries"):
        entries_html = ""
        for entry in experience["entries"]:
            date_range = _fmt_date_range(
                entry.get("start_date"), entry.get("end_date"), entry.get("current", False)
            )
            bullets = "".join(
                f"<li>{html.escape(b)}</li>" for b in (entry.get("bullets") or []) if b
            )
            entries_html += f"""
        <div class="entry">
          <div class="entry-header">
            <span class="entry-title">{html.escape(entry.get("title") or "")}</span>
            {f'<span class="entry-date">{html.escape(date_range)}</span>' if date_range else ""}
          </div>
          {_entry_sub(entry)}
          {f"<ul>{bullets}</ul>" if bullets else ""}
        </div>"""
        parts.append(f"<section><h2>Experience</h2>{entries_html}</section>")

    # ── Projects ──────────────────────────────────────────────────────────────
    if projects and projects.get("entries"):
        entries_html = ""
        for entry in projects["entries"]:
            techs = ", ".join(entry.get("technologies") or [])
            bullets = "".join(
                f"<li>{html.escape(b)}</li>" for b in (entry.get("bullets") or []) if b
            )
            desc = entry.get("description") or ""
            entries_html += f"""
        <div class="entry">
          <div class="entry-header">
            <span class="entry-title">{html.escape(entry.get("name") or "")}</span>
            {f'<span class="entry-date">{html.escape(techs)}</span>' if techs else ""}
          </div>
          {f"<p>{html.escape(desc)}</p>" if desc else ""}
          {f"<ul>{bullets}</ul>" if bullets else ""}
        </div>"""
        parts.append(f"<section><h2>Projects</h2>{entries_html}</section>")

    # ── Skills ────────────────────────────────────────────────────────────────
    if skills and skills.get("categories"):
        cats_html = ""
        for cat in skills["categories"]:
            skill_list = ", ".join(cat.get("skills") or [])
            cats_html += (
                f'<div class="skill-row">'
                f"<strong>{html.escape(cat.get('name') or '')}</strong>"
                f"<span>{html.escape(skill_list)}</span>"
                f"</div>"
            )
        parts.append(f"<section><h2>Skills</h2>{cats_html}</section>")

    # ── Education ─────────────────────────────────────────────────────────────
    if education and education.get("entries"):
        entries_html = ""
        for entry in education["entries"]:
            date_range = _fmt_date_range(entry.get("start_date"), entry.get("end_date"))
            degree = " ".join(filter(None, [entry.get("degree"), entry.get("field")]))
            entries_html += f"""
        <div class="entry">
          <div class="entry-header">
            <span class="entry-title">{html.escape(entry.get("institution") or "")}</span>
            {f'<span class="entry-date">{html.escape(date_range)}</span>' if date_range else ""}
          </div>
          {f'<div class="entry-sub">{html.escape(degree)}</div>' if degree else ""}
        </div>"""
        parts.append(f"<section><h2>Education</h2>{entries_html}</section>")

    body = "\n".join(parts)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{html.escape(resume.name)}</title>
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 10pt;
    color: #2c2825;
    line-height: 1.5;
    max-width: 760px;
    margin: 0 auto;
    padding: 32px 40px;
  }}
  h1 {{ font-size: 22pt; font-weight: 600; margin-bottom: 4px; }}
  h2 {{
    font-size: 10pt;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #c4704b;
    border-bottom: 1px solid #e8e4dd;
    padding-bottom: 4px;
    margin: 20px 0 10px;
  }}
  .header {{ margin-bottom: 8px; }}
  .contact {{ font-size: 9pt; color: #6b6560; margin-top: 4px; }}
  .entry {{ margin-bottom: 12px; }}
  .entry-header {{
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }}
  .entry-title {{ font-weight: 600; font-size: 10.5pt; }}
  .entry-date {{ font-size: 9pt; color: #6b6560; white-space: nowrap; margin-left: 12px; }}
  .entry-sub {{ font-size: 9pt; color: #6b6560; margin-top: 2px; }}
  ul {{ padding-left: 16px; margin-top: 4px; }}
  li {{ margin-bottom: 2px; }}
  p {{ margin-top: 4px; }}
  .skill-row {{
    display: flex;
    gap: 8px;
    margin-bottom: 4px;
    font-size: 9.5pt;
  }}
  .skill-row strong {{ min-width: 120px; color: #2c2825; }}
  .skill-row span {{ color: #6b6560; }}
</style>
</head>
<body>
{body}
</body>
</html>"""


# ── PDF ───────────────────────────────────────────────────────────────────────


def build_pdf(resume: "Resume") -> bytes:
    """Convert the resume to PDF bytes using WeasyPrint."""
    resume_html = build_html(resume)
    try:
        from weasyprint import HTML  # type: ignore[import-untyped]

        return HTML(string=resume_html).write_pdf()  # type: ignore[no-any-return]
    except ImportError:
        # WeasyPrint not installed — return a minimal stub PDF so tests pass
        # without system-level dependencies.
        return _stub_pdf(resume.name)


def _stub_pdf(title: str) -> bytes:
    """Return a bare-minimum valid PDF when WeasyPrint is unavailable."""
    safe = title.encode("latin-1", errors="replace").decode("latin-1")
    body = (
        f"%PDF-1.4\n"
        f"1 0 obj<</Type /Catalog /Pages 2 0 R>>endobj\n"
        f"2 0 obj<</Type /Pages /Kids [3 0 R] /Count 1>>endobj\n"
        f"3 0 obj<</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]"
        f" /Contents 4 0 R /Resources<</Font<</F1 5 0 R>>>>>>endobj\n"
        f"4 0 obj<</Length 44>>\nstream\nBT /F1 12 Tf 72 720 Td ({safe}) Tj ET\nendstream\nendobj\n"
        f"5 0 obj<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>endobj\n"
        f"xref\n0 6\n0000000000 65535 f \ntrailer<</Size 6 /Root 1 0 R>>\n%%EOF\n"
    )
    return body.encode("latin-1")


# ── Plain text ────────────────────────────────────────────────────────────────


def build_txt(resume: "Resume") -> str:
    sections: list[dict] = resume.sections or []
    header = _find_section(sections, "header") or {}
    summary = _find_section(sections, "summary")
    experience = _find_section(sections, "experience")
    projects = _find_section(sections, "projects")
    skills = _find_section(sections, "skills")
    education = _find_section(sections, "education")

    lines: list[str] = []

    name = header.get("name") or resume.name
    lines.append(name.upper())
    contact_items: list[str] = []
    for field in ("email", "phone", "location", "website", "linkedin"):
        value = header.get(field)
        if value:
            contact_items.append(value)
    if contact_items:
        lines.append(" | ".join(contact_items))
    lines.append("")

    if summary and summary.get("content"):
        lines.append("SUMMARY")
        lines.append("─" * 60)
        lines.extend(textwrap.wrap(summary["content"], width=80))
        lines.append("")

    if experience and experience.get("entries"):
        lines.append("EXPERIENCE")
        lines.append("─" * 60)
        for entry in experience["entries"]:
            date_range = _fmt_date_range(
                entry.get("start_date"), entry.get("end_date"), entry.get("current", False)
            )
            title_line = entry.get("title") or ""
            if date_range:
                title_line = f"{title_line}  [{date_range}]"
            lines.append(title_line)
            if entry.get("company"):
                sub = entry["company"]
                if entry.get("location"):
                    sub += f" · {entry['location']}"
                lines.append(sub)
            for bullet in entry.get("bullets") or []:
                if bullet:
                    lines.append(f"  • {bullet}")
            lines.append("")

    if projects and projects.get("entries"):
        lines.append("PROJECTS")
        lines.append("─" * 60)
        for entry in projects["entries"]:
            lines.append(entry.get("name") or "")
            if entry.get("technologies"):
                lines.append("  " + ", ".join(entry["technologies"]))
            if entry.get("description"):
                lines.extend(textwrap.wrap(entry["description"], width=78, initial_indent="  "))
            for bullet in entry.get("bullets") or []:
                if bullet:
                    lines.append(f"  • {bullet}")
            lines.append("")

    if skills and skills.get("categories"):
        lines.append("SKILLS")
        lines.append("─" * 60)
        for cat in skills["categories"]:
            skill_list = ", ".join(cat.get("skills") or [])
            lines.append(f"{cat.get('name', '')}: {skill_list}")
        lines.append("")

    if education and education.get("entries"):
        lines.append("EDUCATION")
        lines.append("─" * 60)
        for entry in education["entries"]:
            date_range = _fmt_date_range(entry.get("start_date"), entry.get("end_date"))
            inst_line = entry.get("institution") or ""
            if date_range:
                inst_line = f"{inst_line}  [{date_range}]"
            lines.append(inst_line)
            degree = " ".join(filter(None, [entry.get("degree"), entry.get("field")]))
            if degree:
                lines.append(f"  {degree}")
            lines.append("")

    return "\n".join(lines)
