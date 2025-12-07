import subprocess
from pathlib import Path
from typing import Optional


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
