import subprocess
from pathlib import Path
from typing import Iterable, Optional, Set


def extract_text_from_pdf(pdf_path: str) -> Optional[str]:
    """
    Convert PDF to text using pdfplumber for better layout preservation.
    Returns None if conversion fails.
    """
    path = Path(pdf_path)
    if not path.exists():
        raise FileNotFoundError(f"{pdf_path} not found")

    try:
        import pdfplumber
        
        full_text = []
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                # layout=True maintains the physical layout of the text
                text = page.extract_text(layout=True)
                if text:
                    full_text.append(text)
        
        return "\n".join(full_text).strip() or None
        
    except ImportError:
        print("pdfplumber not found. Falling back to pypdf.")
        # Fallback to pypdf if pdfplumber is missing
        try:
            try:
                from pypdf import PdfReader
            except ImportError:
                from PyPDF2 import PdfReader
                
            reader = PdfReader(str(path))
            text_content = []
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text_content.append(extracted)
            
            full_text = "\n".join(text_content)
            return full_text.strip() or None
        except Exception as e:
            print(f"Error extracting text with pypdf: {e}")
            return None
            
    except Exception as e:
        print(f"Error extracting text with pdfplumber: {e}")
        return None


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
