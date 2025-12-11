import subprocess
from pathlib import Path
from typing import Iterable, Optional, Set


def extract_text_from_pdf(pdf_path: str) -> Optional[str]:
    """
    Convert PDF to text using the system's `pdftotext` command.
    Returns None if conversion fails.
    """
    path = Path(pdf_path)
    if not path.exists():
        raise FileNotFoundError(f"{pdf_path} not found")

    try:
        result = subprocess.run(
            ["pdftotext", "-layout", str(path), "-"],
            check=True,
            capture_output=True,
            text=True,
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None

    text = result.stdout or ""
    return text.strip() or None


def extract_links_from_pdf(pdf_path: str) -> Set[str]:
    """
    Extract hyperlink URLs from PDF annotations (if present).
    Falls back to empty set when parsing or dependencies are unavailable.
    """
    links: Set[str] = set()
    path = Path(pdf_path)
    if not path.exists():
        return links

    reader = None
    try:
        try:
            from pypdf import PdfReader  # type: ignore
        except Exception:
            from PyPDF2 import PdfReader  # type: ignore
        reader = PdfReader(str(path))
    except Exception:
        return links

    try:
        for page in reader.pages:  # type: ignore
            annots = page.get("/Annots", [])
            for annot_ref in annots:
                try:
                    annot = annot_ref.get_object()
                    action = annot.get("/A") if annot else None
                    uri = action.get("/URI") if action else None
                    if uri:
                        links.add(str(uri))
                except Exception:
                    continue
    except Exception:
        return links

    return links
