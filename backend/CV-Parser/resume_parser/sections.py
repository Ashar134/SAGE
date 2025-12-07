import re
from typing import Any, Dict, List, Optional

SECTION_HEADINGS = {
    "experience",
    "work experience",
    "professional experience",
    "employment history",
    "project experience",
    "education",
    "education and certifications",
    "academic",
    "skills",
    "technical skills",
    "key competencies",
    "projects",
    "certifications",
    "education certifications",
    "education certifications and",
    "summary",
    "professional summary",
    "objective",
}


def _normalize_heading(line: str) -> str:
    line = line.strip().lower().replace(":", "")
    line = line.replace("&", "and")
    return re.sub(r"\s+", " ", line)


def split_sections(text: str) -> Dict[str, str]:
    """Split resume text into coarse sections keyed by heading name."""
    lines = text.splitlines()
    sections: Dict[str, List[str]] = {}
    current: str | None = None
    buffer: List[str] = []

    def flush():
        nonlocal buffer, current
        if current and buffer:
            sections[current] = "\n".join(buffer).strip()
            buffer = []

    for line in lines:
        normalized = _normalize_heading(line)
        matched_heading = None
        for heading in SECTION_HEADINGS:
            if normalized.startswith(heading):
                matched_heading = heading
                break
        if matched_heading:
            flush()
            current = matched_heading
            continue
        if current:
            buffer.append(line)

    flush()
    return sections


DATE_RANGE_RE = re.compile(
    r"(?i)("
    r"\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+\d{4}"
    r"|\b\d{1,2}[/-]\d{2,4}"
    r"|\b\d{4}"
    r")\s*(?:[-–]|to)\s*("
    r"present"
    r"|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+\d{4}"
    r"|\b\d{1,2}[/-]\d{2,4}"
    r"|\b\d{4}"
    r")"
)

TITLE_RE = re.compile(r"^(?!-)[A-Z][A-Za-z0-9&/().,' –—-]{2,}$")


def extract_experiences(section_text: str) -> List[Dict[str, str]]:
    """
    Parse experiences by looking for date-bearing lines and grouping surrounding context.
    """
    experiences: List[Dict[str, str]] = []
    if not section_text:
        return experiences

    lines = [ln.strip() for ln in section_text.splitlines() if ln.strip()]
    current_org: Optional[str] = None
    current_exp: Optional[Dict[str, Any]] = None
    VERB_STARTS = {"developed", "implemented", "applied", "designing", "developing", "implementing", "led", "managed", "built"}

    def flush() -> None:
        nonlocal current_exp
        if current_exp:
            current_exp["details"] = " ".join(current_exp.get("details", [])).strip()
            experiences.append(current_exp)
            current_exp = None

    for ln in lines:
        is_bullet = ln.lstrip().startswith(("-", "•"))
        date_match = DATE_RANGE_RE.search(ln)
        cleaned = ln.lstrip("-• ").strip()

        if date_match:
            flush()
            title = DATE_RANGE_RE.sub("", cleaned).strip(" -–—")
            title = re.sub(r"\(\s*\)", "", title).strip()
            current_exp = {
                "title": title or cleaned,
                "organization": current_org or "",
                "period": date_match.group(0),
                "details": [],
            }
            continue

        if TITLE_RE.match(ln) and not is_bullet:
            first_word = cleaned.split()[0].lower() if cleaned else ""
            if current_exp and first_word in VERB_STARTS:
                current_exp.setdefault("details", []).append(cleaned)
                continue
            if current_exp:
                flush()
            if not current_org:
                current_org = cleaned
                continue
            current_exp = {
                "title": cleaned,
                "organization": current_org or "",
                "period": "",
                "details": [],
            }
            continue

        if current_exp:
            if not current_exp.get("organization") and not is_bullet and not DATE_RANGE_RE.search(ln):
                # Treat the first standalone line after the title as organization if it's short
                if len(cleaned.split()) <= 12:
                    current_exp["organization"] = cleaned
                    continue
            current_exp.setdefault("details", []).append(cleaned)
        else:
            # No active experience; treat as org/context line.
            if cleaned:
                current_org = cleaned

    flush()
    return experiences


def extract_education(section_text: str) -> List[Dict[str, str]]:
    education: List[Dict[str, str]] = []
    if not section_text:
        return education

    stop_re = re.compile(
        r"(extracurricular activities|key competencies|languages|technical skills|community involvement|workshops and seminars)",
        re.IGNORECASE,
    )
    m = stop_re.search(section_text)
    if m:
        section_text = section_text[: m.start()]

    paragraphs = [p.strip() for p in re.split(r"\n{2,}", section_text) if p.strip()]
    for para in paragraphs:
        lines = [ln.strip() for ln in para.splitlines() if ln.strip()]
        entry = {
            "degree": lines[0] if lines else "",
            "institution": "",
            "year": "",
            "details": " ".join(lines[1:]) if len(lines) > 1 else "",
        }
        education.append(entry)
    return education
