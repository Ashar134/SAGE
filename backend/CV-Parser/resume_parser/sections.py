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
    "certificates",
    "research",
    "publications",
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


MONTH_PART = r"(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?"
YEAR_PART = r"(?:\d{4}|['’]?\d{2})"
DATE_TOKEN = rf"\b(?:{MONTH_PART}\s+{YEAR_PART}|\d{{1,2}}[/-]{YEAR_PART}|{YEAR_PART})"
DATE_RANGE_RE = re.compile(
    rf"(?i)({DATE_TOKEN})\s*(?:[-–—]|to)\s*(present|{DATE_TOKEN})"
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
    VERB_STARTS = {"developed", "implemented", "applied", "designing", "developing", "implementing", "led", "managed", "built", "created", "designed"}

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
            
            # Heuristic: Organizations are usually short and don't end with a period.
            # If it looks like a sentence, it's probably not an organization.
            if not current_org and len(cleaned.split()) <= 8 and not cleaned.endswith('.'):
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
                if len(cleaned.split()) <= 10 and not cleaned.endswith('.'):
                    current_exp["organization"] = cleaned
                    continue
            current_exp.setdefault("details", []).append(cleaned)
        else:
            # No active experience; treat as org/context line if it's short.
            if cleaned and len(cleaned.split()) <= 8 and not cleaned.endswith('.'):
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

    lines = [ln.strip() for ln in section_text.splitlines() if ln.strip()]
    DEGREE_START_RE = re.compile(
        r"(?i)\b(phd|doctor|bachelor|master|mba|b\.?tech|m\.?tech|btech|mtech|b\.?e|m\.?e|b\.?sc|m\.?sc|diploma)\b"
    )

    def split_pipe(line: str) -> tuple[str, str]:
        if "|" in line:
            left, right = line.split("|", 1)
            return left.strip(), right.strip()
        return line.strip(), ""

    def split_degree_chunks(line: str) -> List[str]:
        """Split a line if it contains multiple degree starts."""
        matches = list(DEGREE_START_RE.finditer(line))
        if len(matches) <= 1:
            return [line]
        chunks: List[str] = []
        for idx, match in enumerate(matches):
            start = match.start()
            end = matches[idx + 1].start() if idx + 1 < len(matches) else len(line)
            chunks.append(line[start:end].strip())
        return chunks

    current: Optional[Dict[str, str | List[str]]] = None

    def flush() -> None:
        nonlocal current
        if current:
            current["details"] = " ".join(current.get("details", []))  # type: ignore[arg-type]
            education.append(
                {
                    "degree": str(current.get("degree", "")),
                    "institution": str(current.get("institution", "")),
                    "year": str(current.get("year", "")),
                    "details": str(current.get("details", "")),
                }
            )
            current = None

    for raw_line in lines:
        for chunk in split_degree_chunks(raw_line):
            text_part, pipe_part = split_pipe(chunk)
            is_degree_line = bool(DEGREE_START_RE.search(text_part))

            if is_degree_line:
                flush()
                current = {
                    "degree": text_part,
                    "institution": "",
                    "year": pipe_part,
                    "details": [],
                }
                continue

            if current:
                if not current["institution"]:
                    current["institution"] = text_part
                    if pipe_part and not current["year"]:
                        current["year"] = pipe_part
                    continue
                if pipe_part and not current["year"]:
                    current["year"] = pipe_part
                if text_part:
                    current.setdefault("details", []).append(text_part)  # type: ignore[arg-type]
                if pipe_part and pipe_part != current.get("year"):
                    current.setdefault("details", []).append(pipe_part)  # type: ignore[arg-type]
            else:
                # If we haven't started but see a location/year line, start a generic entry.
                current = {
                    "degree": text_part,
                    "institution": "",
                    "year": pipe_part,
                    "details": [],
                }

    flush()

    # Fallback: if still a single merged entry but multiple degree keywords exist in the whole section,
    # split by keyword boundaries.
    if len(education) <= 1:
        joined = " ".join(section_text.splitlines())
        matches = list(DEGREE_START_RE.finditer(joined))
        if len(matches) > 1:
            education = []
            for idx, match in enumerate(matches):
                start = match.start()
                end = matches[idx + 1].start() if idx + 1 < len(matches) else len(joined)
                chunk = joined[start:end].strip()
                left, right = split_pipe(chunk)
                education.append(
                    {
                        "degree": left,
                        "institution": "",
                        "year": right,
                        "details": chunk.replace(left, "", 1).replace(right, "", 1).strip(),
                    }
                )

    return education


def extract_certificates(section_text: str) -> List[Dict[str, str]]:
    """
    Extract certificates from a section string.
    Looks for common patterns: 'Name | Issuer | Year' or 'Name - Issuer, Year'.
    """
    certificates: List[Dict[str, str]] = []
    if not section_text:
        return certificates

    lines = [ln.strip() for ln in section_text.splitlines() if ln.strip()]

    for ln in lines:
        # Avoid lines that look like navigation or boilerplate
        if len(ln) < 3 or len(ln) > 200:
            continue

        # Look for a 4-digit year
        year_match = re.search(r"\b(19|20)\d{2}\b", ln)
        year = year_match.group(0) if year_match else ""

        # Remove the year for easier part splitting
        text_no_year = re.sub(r"\b(19|20)\d{2}\b", "", ln).strip(" ,()[]/|–—")

        # Prioritize pipes, then long dashes/dashes, then commas
        parts: List[str] = []
        if "|" in text_no_year:
            parts = [p.strip() for p in text_no_year.split("|", 1)]
        elif " — " in text_no_year:
            parts = [p.strip() for p in text_no_year.split(" — ", 1)]
        elif " – " in text_no_year:
            parts = [p.strip() for p in text_no_year.split(" – ", 1)]
        elif " - " in text_no_year:
            parts = [p.strip() for p in text_no_year.split(" - ", 1)]
        elif "," in text_no_year:
            # Only split on comma if it seems like a separator (not in the middle of a name)
            comma_parts = [p.strip() for p in text_no_year.split(",", 1)]
            if len(comma_parts) > 1 and len(comma_parts[0]) > 5:
                parts = comma_parts
        
        if parts:
            name = parts[0]
            issuer = parts[1] if len(parts) > 1 else ""
            certificates.append({
                "name": name,
                "issuer": issuer,
                "year": year
            })
        else:
            # Fallback for simple standalone certificates
            if len(text_no_year) > 5:
                certificates.append({
                    "name": text_no_year,
                    "issuer": "",
                    "year": year
                })

    return certificates


def extract_research(section_text: str) -> List[Dict[str, str]]:
    """
    Extract research papers, projects or publications.
    Reuses the logic from experience extraction as they share a similar structure
    (Title, Organization/Publisher, Date, Details).
    """
    if not section_text:
        return []
    
    # We can reuse extract_experiences logic but map 'organization' to institution/publisher
    exps = extract_experiences(section_text)
    research_items = []
    for e in exps:
        research_items.append({
            "title": e.get("title", ""),
            "organization": e.get("organization", ""),
            "period": e.get("period", ""),
            "details": e.get("details", "")
        })
    return research_items


def extract_projects(section_text: str) -> List[Dict[str, str]]:
    """
    Extract technical or academic projects.
    """
    if not section_text:
        return []
    
    lines = [ln.strip() for ln in section_text.splitlines() if ln.strip()]
    project_items: List[Dict[str, str]] = []
    current_proj: Optional[Dict[str, Any]] = None
    
    # Common action verbs that typically start project bullet points
    VERB_STARTS = {"developed", "implemented", "applied", "designing", "developing", "implementing", "led", "managed", "built", "created", "designed"}

    def flush() -> None:
        nonlocal current_proj
        if current_proj:
            current_proj["details"] = " ".join(current_proj.get("details", [])).strip()
            project_items.append(current_proj)
            current_proj = None

    for ln in lines:
        is_bullet = ln.lstrip().startswith(("-", "•"))
        date_match = DATE_RANGE_RE.search(ln)
        cleaned = ln.lstrip("-• ").strip()

        if date_match:
            if current_proj:
                current_proj["period"] = date_match.group(0)
                # If title is still generic, try to refine it
                if current_proj["title"] == "Project":
                    t = DATE_RANGE_RE.sub("", cleaned).strip(" -–—")
                    if t: current_proj["title"] = t
            else:
                title = DATE_RANGE_RE.sub("", cleaned).strip(" -–—")
                current_proj = {
                    "title": title or cleaned,
                    "organization": "",
                    "period": date_match.group(0),
                    "details": []
                }
            continue

        if not is_bullet and TITLE_RE.match(ln):
            first_word = cleaned.split()[0].lower() if cleaned else ""
            if first_word in VERB_STARTS:
                if current_proj:
                    current_proj.setdefault("details", []).append(cleaned)
                else:
                    current_proj = {
                        "title": "Project",
                        "organization": "",
                        "period": "",
                        "details": [cleaned]
                    }
                continue
            
            # Likely a new project title
            flush()
            current_proj = {
                "title": cleaned,
                "organization": "",
                "period": "",
                "details": []
            }
            continue

        if current_proj:
            current_proj.setdefault("details", []).append(cleaned)
        elif not is_bullet and len(cleaned.split()) <= 10:
            # Standalone line before any project - could be a project title or organization
            current_proj = {
                "title": cleaned,
                "organization": "",
                "period": "",
                "details": []
            }

    flush()
    return project_items
