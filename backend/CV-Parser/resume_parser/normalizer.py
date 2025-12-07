import re
from typing import Iterable, List

WHITESPACE_RE = re.compile(r"[ \t]+")
MULTI_NEWLINE_RE = re.compile(r"\n{2,}")


def normalize_text(text: str) -> str:
    """Trim noise, collapse whitespace and remove common artifacts."""
    cleaned = (
        text.replace("\uf0b7", "-")
        .replace("\u2022", "-")
        .replace("â€¢", "-")
        .replace("ï¼​", " ")
    )
    # Join hyphenated line breaks (e.g., "foun-\ndation" -> "foundation")
    cleaned = re.sub(r"(\w)-\s*\n\s*(\w)", r"\1\2", cleaned)
    cleaned = cleaned.replace("\xa0", " ")
    cleaned = WHITESPACE_RE.sub(" ", cleaned)
    cleaned = MULTI_NEWLINE_RE.sub("\n\n", cleaned)
    return cleaned.strip()


def top_lines(text: str, limit: int = 10) -> List[str]:
    """Return the first N non-empty lines."""
    lines: List[str] = []
    for line in text.splitlines():
        if line.strip():
            lines.append(line.strip())
        if len(lines) >= limit:
            break
    return lines


def sentences(text: str) -> Iterable[str]:
    """A light sentence splitter based on punctuation and new lines."""
    for chunk in re.split(r"(?<=[.!?])\s+|\n{2,}", text):
        chunk = chunk.strip()
        if chunk:
            yield chunk
