from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, Optional

from .city_country import infer_country
from .entities import extract_contacts, extract_location, extract_name
from .normalizer import normalize_text
from .sections import extract_education, extract_experiences, extract_certificates, extract_research, extract_projects, split_sections, SECTION_HEADINGS
from .skills import extract_skills
from .text_extractor import extract_text_from_pdf, extract_links_from_pdf


def parse_resume(pdf_path: str) -> Dict[str, Any]:
    """
    Parse a resume PDF into a structured JSON-friendly dictionary.
    """
    raw_text = extract_text_from_pdf(pdf_path)
    if not raw_text:
        raise RuntimeError(f"Could not extract text from {pdf_path}")

    links_from_pdf = extract_links_from_pdf(pdf_path)
    text = normalize_text(raw_text)
    name = extract_name(text)
    contacts = extract_contacts(text, extra_links=links_from_pdf)
    city, country = extract_location(text)
    sections = split_sections(text)

    skills_section = sections.get("skills", "")
    skills = extract_skills(skills_section if skills_section else text)

    experiences = extract_experiences(
        sections.get("professional experience")
        or sections.get("experience")
        or sections.get("work experience")
        or sections.get("project experience")
        or ""
    )

    education = extract_education(
        sections.get("education")
        or sections.get("education and certifications")
        or ""
    )

    certificates = extract_certificates(
        sections.get("certifications")
        or sections.get("certificates")
        or ""
    )

    research = extract_research(
        sections.get("research")
        or sections.get("publications")
        or ""
    )

    projects = extract_projects(
        sections.get("projects")
        or ""
    )

    summary = (
        sections.get("summary")
        or sections.get("professional summary")
        or sections.get("objective")
        or ""
    )

    if not summary:
        # Fallback: take the first paragraph before the first recognized heading.
        lowered = text.lower()
        first_heading_idx = None
        for heading in SECTION_HEADINGS:
            idx = lowered.find(heading)
            if idx != -1:
                if first_heading_idx is None or idx < first_heading_idx:
                    first_heading_idx = idx
        prefix = text if first_heading_idx is None else text[:first_heading_idx]
        paragraphs = [p.strip() for p in prefix.split("\n\n") if p.strip()]
        if len(paragraphs) > 1:
            summary = paragraphs[1]  # skip name/contact block
        elif paragraphs:
            summary = paragraphs[0]

    return {
        "name": name,
        "contact": contacts,
        "location": {"city": city, "country": country or infer_country(city, text_blob=text)},
        "summary": summary.strip(),
        "skills": skills,
        "experience": experiences,
        "education": education,
        "certificates": certificates,
        "research": research,
        "projects": projects,
    }


def parse_and_dump(pdf_path: str, out_path: Optional[str] = None) -> Dict[str, Any]:
    data = parse_resume(pdf_path)
    if out_path:
        with Path(out_path).open("w", encoding="utf-8") as fh:
            json.dump(data, fh, indent=2, ensure_ascii=False)
    return data
