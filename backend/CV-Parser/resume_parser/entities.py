import re
from typing import Dict, Iterable, List, Optional, Tuple

from .city_country import infer_country, is_country
from .normalizer import top_lines

_NLP = None

def get_nlp():
    global _NLP
    if _NLP is None:
        import en_core_web_sm
        _NLP = en_core_web_sm.load()
    return _NLP

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
# Accept dots/dashes/spaces between blocks to catch formats like 999.777.9311
PHONE_RE = re.compile(
    r"(?:(?:\+\d{1,3}[\s.-]?)?(?:\(\d{2,4}\)[\s.-]?)?\d{3}[\s.-]?\d{3,4}[\s.-]?\d{3,4})"
)
# Capture explicit URLs and bare domains (e.g., linkedin.com/in/handle) even without scheme.
URL_RE = re.compile(
    r"(?i)\b((?:https?://)?(?:www\.)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:/[^\s)]+)?)"
)
CITY_COUNTRY_LINE_RE = re.compile(r"(?i)\b(city|state|country)\b[:\s-]*([\w ,]+)")
CITY_STATE_RE = re.compile(r"\b([A-Za-z][A-Za-z .'-]{2,}?),\s*([A-Z]{2})(?![A-Za-z])", re.IGNORECASE)
US_STATE_CODES = {
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
}


def _clean_name(name: str) -> str:
    # Join names written as "J O H N" or "J  O  H  N"
    spaced = name.strip()
    if re.fullmatch(r"[A-Za-z](\s+[A-Za-z]){1,5}", spaced):
        return spaced.replace(" ", "")
    # Collapse repeated internal spaces
    return re.sub(r"\s{2,}", " ", spaced).strip()


def extract_name(text: str) -> Optional[str]:
    lines = top_lines(text, limit=5)
    for line in lines:
        doc = get_nlp()(line)
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                cleaned = _clean_name(ent.text)
                if len(cleaned.split()) <= 5:
                    return cleaned
    # Fallback: first line as name
    if lines:
        return _clean_name(lines[0])
    return None


def extract_contacts(text: str, extra_links: Iterable[str] | None = None) -> Dict[str, List[str]]:
    emails = EMAIL_RE.findall(text)
    phones = [p.strip() for p in PHONE_RE.findall(text)]
    urls = URL_RE.findall(text)
    if extra_links:
        urls.extend(list(extra_links))
    return {
        "emails": sorted(set(emails)),
        "phones": sorted(set(phones)),
        "links": sorted(set(urls)),
    }


def extract_location(text: str) -> Tuple[Optional[str], Optional[str]]:
    # Try city, STATE patterns near the top of the document to anchor US locations.
    for line in top_lines(text, limit=20):
        m = CITY_STATE_RE.search(line)
        if m and m.group(2).upper() in US_STATE_CODES:
            return m.group(1).strip(), "United States"

    # Try comma-separated city, country patterns near the top of the document.
    for line in top_lines(text, limit=20):
        head = line.split("|")[0]
        if "," in head:
            parts = [p.strip() for p in head.split(",") if p.strip()]
            if len(parts) >= 2:
                # Guess country as the rightmost country-like part.
                country = None
                for part in reversed(parts):
                    if is_country(part):
                        country = part
                        break
                # Choose city as the item before country (or last non-country if none found)
                city = None
                if country:
                    idx = parts.index(country)
                    if idx > 0:
                        city = parts[idx - 1]
                if not city:
                    # fallback: last non-country part
                    for part in reversed(parts):
                        if not is_country(part) and re.search(r"[A-Za-z]", part):
                            city = part
                            break
                if city or country:
                    return city, country or infer_country(city)

    # Try explicit city/country labels
    for m in CITY_COUNTRY_LINE_RE.finditer(text):
        maybe = m.group(2)
        doc = get_nlp()(maybe)
        city = None
        country = None
        for ent in doc.ents:
            if ent.label_ == "GPE":
                if not city:
                    city = ent.text
        country = infer_country(city, text_blob=maybe)
        if city or country:
            return city, country

    doc = get_nlp()(text[:2000])  # only first part to stay fast
    city = None
    country = None
    for ent in doc.ents:
        if ent.label_ == "GPE":
            if is_country(ent.text):
                if not country:
                    country = ent.text
                continue
            if not city:
                city = ent.text
            if not country:
                country = infer_country(ent.text, text_blob=text)
            if city and country:
                break
    if city and not country:
        country = infer_country(city, text_blob=text)
    return city, country
