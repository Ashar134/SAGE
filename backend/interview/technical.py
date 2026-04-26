"""
Technical Scorer
================
Evaluates the technical quality of a candidate's answer given the
job context and the specific question asked.

Carries 15% weight in the final interview score.

Sub-scores (each 0-10, equally weighted):
    1. Domain Vocabulary Breadth  — breadth check: did they cover the topics?
    2. Conceptual Depth           — depth check: did they explain, not just name-drop?
    3. Specificity                — concrete details vs vague generalities

Final: average of the 3 sub-scores.
"""

import re
import numpy as np
from sentence_transformers import SentenceTransformer

# ── Shared embedding model ────────────────────────────────────────────────────

_model: SentenceTransformer | None = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def _encode(text: str) -> np.ndarray:
    return _get_model().encode(text, convert_to_numpy=True)


def _cosine(a: np.ndarray, b: np.ndarray) -> float:
    denom = np.linalg.norm(a) * np.linalg.norm(b)
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)


# ── Stopwords ─────────────────────────────────────────────────────────────────

_STOPWORDS = {
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "to", "of", "in", "on",
    "at", "by", "for", "with", "about", "from", "up", "and", "but",
    "or", "not", "this", "that", "these", "those", "i", "me", "my",
    "we", "our", "you", "your", "he", "she", "it", "they", "them",
    "their", "its", "also", "just", "very", "so", "as", "if", "how",
    "what", "which", "who", "then", "than", "too", "both", "each",
    "more", "most", "other", "some", "such", "into", "through", "during",
    "before", "after", "above", "below", "between", "out", "off", "over",
    "under", "again", "further", "once", "here", "there", "when", "where",
    "why", "all", "any", "few", "own", "same", "only", "while",
}


def _extract_keywords(text: str) -> set[str]:
    """Extract content words (non-stopwords, 3+ chars) from text."""
    words = re.findall(r'\b[a-z]{3,}\b', text.lower())
    return {w for w in words if w not in _STOPWORDS}


# ── Vague words list ──────────────────────────────────────────────────────────

_VAGUE_WORDS = [
    r"\bvarious\b", r"\bmany\b", r"\bsome\b", r"\bdifferent\b",
    r"\bcertain\b", r"\bseveral\b", r"\bthings\b", r"\bstuff\b",
    r"\bsomething\b", r"\bsomewhere\b", r"\bsomehow\b", r"\bsometime\b",
    r"\bkind of\b", r"\bsort of\b", r"\btype of\b", r"\bvery good\b",
    r"\bpretty much\b", r"\bmore or less\b", r"\bbasically\b",
    r"\bgenerally\b", r"\busually\b", r"\btypically\b", r"\bnormally\b",
]


# ── 1. Domain Vocabulary Breadth ──────────────────────────────────────────────

def _score_breadth(
    question: str,
    answer: str,
    job_title: str,
    requirements: list[str],
) -> float:
    """
    Score 0-10.
    Breadth check: what fraction of the expected technical vocabulary
    (from question + job title + requirements) appears in the answer?
    """
    req_text = " ".join(requirements) if requirements else ""
    reference = f"{job_title} {req_text} {question}"
    expected_keywords = _extract_keywords(reference)

    if not expected_keywords:
        return 5.0  # no reference keywords to check against

    answer_keywords = _extract_keywords(answer)
    coverage = len(expected_keywords & answer_keywords) / len(expected_keywords)
    return round(min(coverage * 10, 10.0), 2)


# ── 2. Conceptual Depth ───────────────────────────────────────────────────────

def _score_depth(
    question: str,
    answer: str,
    job_title: str,
    requirements: list[str],
) -> float:
    """
    Score 0-10.
    Depth check: does the answer semantically align with the question
    and job domain, AND does it elaborate rather than just name-drop?

    Base: cosine similarity between (question + job context) and answer.
    Penalty: -2 if keyword coverage is high but answer is very short
             (name-dropping without explanation).
    """
    if not answer.strip():
        return 0.0

    req_text = " ".join(requirements) if requirements else ""
    reference = f"{question} {job_title} {req_text}"

    semantic_sim = _cosine(_encode(reference), _encode(answer))
    score = semantic_sim * 10

    # Penalise name-dropping: high breadth coverage but very short answer
    expected_keywords = _extract_keywords(reference)
    answer_keywords = _extract_keywords(answer)
    word_count = len(answer.split())

    if expected_keywords:
        breadth = len(expected_keywords & answer_keywords) / len(expected_keywords)
        if breadth > 0.2 and word_count < 30:
            score -= 3.0  # penalise name-dropping without explanation

    return round(max(min(score, 10.0), 0.0), 2)


# ── 3. Specificity ────────────────────────────────────────────────────────────

def _score_specificity(answer: str, requirements: list[str]) -> float:
    """
    Score 0-10.
    Rewards concrete, specific answers over vague generalities.

    Positive signals:
        - Numbers/quantities (e.g. "5 years", "3 courses", "40 students")
        - Named terms from requirements appearing in answer
        - Capitalised proper nouns (tools, frameworks, institutions)

    Negative signals:
        - Vague filler words ("various", "many", "stuff", etc.)
    """
    if not answer.strip():
        return 0.0

    lower = answer.lower()

    # Count numbers/quantities
    number_count = len(re.findall(r'\b\d+\b', answer))

    # Count capitalised proper nouns (2+ char, not at sentence start)
    # Find words that are capitalised mid-sentence
    sentences = re.split(r'[.!?]\s+', answer)
    proper_nouns = 0
    for sent in sentences:
        words = sent.split()
        # Skip first word (always capitalised), count rest that are capitalised
        for word in words[1:]:
            if word and word[0].isupper() and len(word) > 1 and word.isalpha():
                proper_nouns += 1

    # Count requirement terms appearing in answer
    req_terms = set()
    for req in requirements:
        req_terms.update(_extract_keywords(req))
    answer_words = _extract_keywords(answer)
    req_term_hits = len(req_terms & answer_words)

    # Count vague words
    vague_count = sum(len(re.findall(p, lower)) for p in _VAGUE_WORDS)

    score = 5.0
    score += min(number_count * 1.0, 2.0)      # max +2 from numbers
    score += min(proper_nouns * 0.5, 2.0)       # max +2 from proper nouns
    score += min(req_term_hits * 0.5, 2.0)      # max +2 from req term hits
    score -= min(vague_count * 0.8, 4.0)        # max -4 from vague words

    return round(max(min(score, 10.0), 0.0), 2)


# ── Public API ────────────────────────────────────────────────────────────────

def score_technical(
    question: str,
    answer: str,
    job_title: str,
    requirements: list[str],
) -> dict:
    """
    Main entry point.

    Args:
        question:     The interview question asked.
        answer:       The transcribed candidate answer.
        job_title:    The job title (e.g. "Assistant Professor CS").
        requirements: List of job requirement strings.

    Returns:
        {
            "breadth":           float,  # 0-10
            "depth":             float,  # 0-10
            "specificity":       float,  # 0-10
            "technical_score":   float,  # 0-10 (equal-weighted average)
        }
    """
    if not answer or len(answer.strip()) < 3:
        return {
            "breadth":         0.0,
            "depth":           0.0,
            "specificity":     0.0,
            "technical_score": 0.0,
        }

    b   = _score_breadth(question, answer, job_title, requirements)
    d   = _score_depth(question, answer, job_title, requirements)
    sp  = _score_specificity(answer, requirements)

    final = round((b + d + sp) / 3, 2)

    return {
        "breadth":         b,
        "depth":           d,
        "specificity":     sp,
        "technical_score": final,
    }
