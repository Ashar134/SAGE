"""
Relevance Scorer
================
Evaluates how well the candidate's answer addresses the question asked.
Returns a score 0-10 composed of 4 equally-weighted sub-scores:

    1. Directness          (0-10) — does the opening address the question?
    2. Topic Drift         (0-10) — does relevance drop off mid-answer?
    3. Depth vs Surface    (0-10) — genuine understanding vs keyword parroting?
    4. Answer Completeness (0-10) — semantically complete + elaboration bonus?

Final: average of the 4 sub-scores.
"""

import re
import numpy as np
from functools import lru_cache
from sentence_transformers import SentenceTransformer

#  Shared embedding model (loaded once)

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


# Sentence splitting 

def _split_sentences(text: str) -> list[str]:
    """Split text into non-empty sentences."""
    return [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]


def _split_into_chunks(sentences: list[str], n: int = 3) -> list[str]:
    """
    Divide a sentence list into n roughly equal chunks.
    Returns fewer chunks if there aren't enough sentences.
    """
    if not sentences:
        return []
    chunk_size = max(1, len(sentences) // n)
    chunks = []
    for i in range(0, len(sentences), chunk_size):
        chunk = " ".join(sentences[i:i + chunk_size])
        if chunk:
            chunks.append(chunk)
    return chunks[:n]


# Stopwords (minimal set for keyword extraction)

_STOPWORDS = {
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "need", "dare", "ought",
    "used", "to", "of", "in", "on", "at", "by", "for", "with", "about",
    "against", "between", "into", "through", "during", "before", "after",
    "above", "below", "from", "up", "down", "out", "off", "over", "under",
    "again", "further", "then", "once", "and", "but", "or", "nor", "so",
    "yet", "both", "either", "neither", "not", "only", "own", "same",
    "than", "too", "very", "just", "because", "as", "until", "while",
    "if", "how", "what", "which", "who", "whom", "this", "that", "these",
    "those", "i", "me", "my", "myself", "we", "our", "you", "your",
    "he", "she", "it", "they", "them", "their", "its", "your",
}


def _extract_keywords(text: str) -> set[str]:
    """Extract content words (non-stopwords, 3+ chars) from text."""
    words = re.findall(r'\b[a-z]{3,}\b', text.lower())
    return {w for w in words if w not in _STOPWORDS}


# 1. Directness 

def _score_directness(question: str, answer: str) -> float:
    """
    Score 0-10.
    Measures cosine similarity between the question and the opening
    2 sentences of the answer. High similarity = candidate addressed
    the question immediately without pivoting.
    """
    sentences = _split_sentences(answer)
    if not sentences:
        return 0.0

    opening = " ".join(sentences[:2])
    q_vec = _encode(question)
    o_vec = _encode(opening)
    sim = _cosine(q_vec, o_vec)
    return round(min(sim * 10, 10.0), 2)


# 2. Topic Drift
def _score_topic_drift(question: str, answer: str) -> float:
    """
    Score 0-10.
    Splits the answer into 3 chunks and measures cosine similarity of
    each chunk against the question. If later chunks drift significantly
    lower than the opening, the score is penalised.

    If the answer is too short to chunk (< 2 sentences), return the
    overall similarity directly — no drift possible.
    """
    if not answer.strip():
        return 0.0

    sentences = _split_sentences(answer)
    if len(sentences) < 2:
        # Single sentence — no drift possible, score on overall similarity
        sim = _cosine(_encode(question), _encode(answer))
        return round(min(sim * 10, 10.0), 2)

    chunks = _split_into_chunks(sentences, n=3)
    q_vec = _encode(question)
    sims = [_cosine(q_vec, _encode(chunk)) for chunk in chunks]

    if len(sims) < 2:
        return round(min(sims[0] * 10, 10.0), 2)

    # Drift = how much the first chunk's similarity exceeds the minimum
    # of subsequent chunks. Zero drift = score stays high throughout.
    drift = max(0.0, sims[0] - min(sims[1:]))
    score = 10.0 - (drift * 10.0)
    return round(max(score, 0.0), 2)


# 3. Depth vs Surface 

def _score_depth(question: str, answer: str) -> float:
    """
    Score 0-10.
    Rewards genuine semantic understanding over keyword parroting.
    """
    if not answer.strip():
        return 0.0

    q_keywords = _extract_keywords(question)
    if not q_keywords:
        # No extractable keywords — fall back to pure semantic similarity
        sim = _cosine(_encode(question), _encode(answer))
        return round(min(sim * 10, 10.0), 2)

    a_words = _extract_keywords(answer)
    echo_rate = len(q_keywords & a_words) / len(q_keywords)

    semantic_sim = _cosine(_encode(question), _encode(answer))
    score = semantic_sim * 10

    # Penalise pure keyword mirroring
    if echo_rate > 0.7:
        score -= 2.0

    return round(max(min(score, 10.0), 0.0), 2)


# 4. Answer Completeness 

def _score_completeness(question: str, answer: str) -> float:
    """
    Score 0-10.
    Primary signal (0-7): semantic similarity between question and answer.
    Elaboration bonus (0-3): based on sentence count — rewards answers
    that develop a thought beyond a single sentence, without penalising
    short but precise answers.

    Bonus:
        4+ sentences → +3
        3  sentences → +2
        2  sentences → +1
        1  sentence  → +0
    """
    if not answer.strip():
        return 0.0

    semantic_sim = _cosine(_encode(question), _encode(answer))
    semantic_score = semantic_sim * 7

    sentences = _split_sentences(answer)
    n = len(sentences)
    elaboration_bonus = min(max(n - 1, 0), 3)

    return round(min(semantic_score + elaboration_bonus, 10.0), 2)


#  Public API 

def score_relevance(question: str, answer: str) -> dict:
    """
    Main entry point.
    Returns a dict with all sub-scores and the final weighted score (0-10).

    Args:
        question: The interview question asked.
        answer:   The transcribed candidate answer.

    Returns:
        {
            "directness":          float,  # 0-10
            "topic_drift":         float,  # 0-10
            "depth":               float,  # 0-10
            "completeness":        float,  # 0-10
            "relevance_score":     float,  # 0-10 (equal-weighted average)
        }
    """
    if not answer or len(answer.strip()) < 3:
        return {
            "directness":      0.0,
            "topic_drift":     0.0,
            "depth":           0.0,
            "completeness":    0.0,
            "relevance_score": 0.0,
        }

    d   = _score_directness(question, answer)
    td  = _score_topic_drift(question, answer)
    dep = _score_depth(question, answer)
    com = _score_completeness(question, answer)

    final = round((d + td + dep + com) / 4, 2)

    return {
        "directness":      d,
        "topic_drift":     td,
        "depth":           dep,
        "completeness":    com,
        "relevance_score": final,
    }
