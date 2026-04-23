"""
Reasoning Scorer
================
Evaluates the logical structure and argumentation quality of a candidate's answer.
Carries 15% weight in the final interview score.

Sub-scores (each 0-10, equally weighted):
    1. Causal Reasoning       — does the candidate explain WHY, not just WHAT?
    2. Argument Structure     — claim → evidence → conclusion pattern (Toulmin model)
    3. Logical Consistency    — no contradictions, no excessive hedging

Final: average of the 3 sub-scores.
"""

import re
from collections import Counter

# ── 1. Causal Reasoning ───────────────────────────────────────────────────────

_CAUSAL_PATTERNS = [
    r"\bbecause\b", r"\btherefore\b", r"\bas a result\b", r"\bwhich means\b",
    r"\bthis leads to\b", r"\bconsequently\b", r"\bdue to\b", r"\bsince\b",
    r"\bthus\b", r"\bhence\b", r"\bso that\b", r"\bin order to\b",
    r"\bwhich causes\b", r"\bwhich results in\b", r"\bthis causes\b",
    r"\bthis results in\b", r"\bleads to\b", r"\benables\b",
]

_CONDITIONAL_PATTERNS = [
    r"\bif\b.{1,60}\bthen\b",
    r"\bwhen\b.{1,60}\bthen\b",
    r"\bprovided that\b",
    r"\bassuming that\b",
    r"\bin the case that\b",
    r"\bgiven that\b",
]


def _split_sentences(text: str) -> list[str]:
    return [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]


def _score_causal_reasoning(answer: str) -> float:
    """
    Score 0-10.
    Measures how often the candidate explains cause-effect relationships.
    Normalised by sentence count so longer answers aren't unfairly rewarded.
    """
    if not answer.strip():
        return 0.0

    lower = answer.lower()
    sentences = _split_sentences(answer)
    n_sentences = max(len(sentences), 1)

    causal_hits = sum(
        1 for p in _CAUSAL_PATTERNS if re.search(p, lower)
    )
    conditional_hits = sum(
        1 for p in _CONDITIONAL_PATTERNS if re.search(p, lower)
    )
    total_hits = causal_hits + conditional_hits

    # Rate: hits per sentence, scaled to 0-10
    # 1 hit per sentence = full marks (rate=1.0 → score=10)
    rate = total_hits / n_sentences
    score = min(rate * 10, 10.0)

    # Bonus: reward variety (using both causal AND conditional)
    if causal_hits > 0 and conditional_hits > 0:
        score = min(score + 1.0, 10.0)

    return round(score, 2)


# ── 2. Argument Structure ─────────────────────────────────────────────────────

_CLAIM_MARKERS = [
    r"\bi believe\b", r"\bi argue\b", r"\bi think\b", r"\bmy view is\b",
    r"\bi would\b", r"\bi propose\b", r"\bi suggest\b", r"\bin my opinion\b",
    r"\bmy approach\b", r"\bmy philosophy\b", r"\bi contend\b",
    r"\bit is my view\b", r"\bmy position is\b",
]

_EVIDENCE_MARKERS = [
    r"\bfor example\b", r"\bfor instance\b", r"\bsuch as\b",
    r"\bresearch shows\b", r"\bstudies show\b", r"\bevidence suggests\b",
    r"\bin my experience\b", r"\bspecifically\b", r"\bto illustrate\b",
    r"\bthis is demonstrated by\b", r"\bas shown by\b", r"\bnamely\b",
    r"\bin practice\b", r"\bin fact\b",
]

_CONCLUSION_MARKERS = [
    r"\btherefore\b", r"\bin conclusion\b", r"\bto summarise\b",
    r"\boverall\b", r"\bthis shows\b", r"\bthis means\b",
    r"\bwhich demonstrates\b", r"\bto summarize\b", r"\bin summary\b",
    r"\bultimately\b", r"\bthus\b", r"\bconsequently\b",
    r"\bthis confirms\b", r"\bthis suggests\b",
]


def _score_argument_structure(answer: str) -> float:
    """
    Score 0-10.
    Based on the Toulmin model of argumentation:
    claim → evidence → conclusion.
    Each component present adds ~3.33 points.
    Bonus point if all 3 are present.
    """
    if not answer.strip():
        return 0.0

    lower = answer.lower()

    has_claim      = any(re.search(p, lower) for p in _CLAIM_MARKERS)
    has_evidence   = any(re.search(p, lower) for p in _EVIDENCE_MARKERS)
    has_conclusion = any(re.search(p, lower) for p in _CONCLUSION_MARKERS)

    components = int(has_claim) + int(has_evidence) + int(has_conclusion)
    score = (components / 3) * 9.0  # max 9 from components

    # Bonus for complete argument
    if components == 3:
        score += 1.0

    return round(min(score, 10.0), 2)


# ── 3. Logical Consistency ────────────────────────────────────────────────────

_CONTRADICTION_SIGNALS = [
    r"\bbut actually\b", r"\bwait\b", r"\bno actually\b",
    r"\bscratch that\b", r"\bor maybe\b", r"\bi don't know\b",
    r"\bi'm not sure\b", r"\bactually no\b", r"\bi mean actually\b",
    r"\blet me rephrase\b", r"\bor rather\b", r"\bor perhaps\b",
    r"\bor wait\b",
]

_HEDGE_PATTERNS = [
    r"\bmight\b", r"\bcould\b", r"\bpossibly\b", r"\bperhaps\b",
    r"\bmaybe\b", r"\bi think\b", r"\bi guess\b", r"\bprobably\b",
    r"\bsomewhat\b", r"\bkind of\b", r"\bsort of\b", r"\bi suppose\b",
    r"\bi'm not certain\b", r"\bi'm not sure\b",
]


def _score_logical_consistency(answer: str) -> float:
    """
    Score 0-10.
    Penalises:
    - Contradiction signals (self-correction mid-answer)
    - Excessive hedging (>30% of sentences contain hedge words)
    - Repetitive claims (same stem repeated 3+ times across sentences)
    """
    if not answer.strip():
        return 0.0

    lower = answer.lower()
    sentences = _split_sentences(answer)
    n_sentences = max(len(sentences), 1)

    # Contradiction penalty
    contradiction_count = sum(
        1 for p in _CONTRADICTION_SIGNALS if re.search(p, lower)
    )

    # Hedge ratio
    hedged_sentences = sum(
        1 for sent in sentences
        if any(re.search(p, sent.lower()) for p in _HEDGE_PATTERNS)
    )
    hedge_ratio = hedged_sentences / n_sentences

    # Repetitive claim detection (stem-based, same as communication.py)
    all_words = re.findall(r'\b[a-z]{5,}\b', lower)
    stems = [w[:5] for w in all_words]
    repetition_penalty = 0.0
    if stems:
        most_common_count = Counter(stems).most_common(1)[0][1]
        if most_common_count >= 4:
            repetition_penalty = 1.0

    score = 10.0
    score -= min(contradiction_count * 2.0, 4.0)   # max -4 for contradictions
    score -= (3.0 if hedge_ratio > 0.5 else
              1.5 if hedge_ratio > 0.3 else 0.0)    # -3 if >50% hedged, -1.5 if >30%
    score -= repetition_penalty

    return round(max(score, 0.0), 2)


# ── Public API ────────────────────────────────────────────────────────────────

def score_reasoning(answer: str) -> dict:
    """
    Main entry point.

    Args:
        answer: The transcribed candidate answer.

    Returns:
        {
            "causal_reasoning":      float,  # 0-10
            "argument_structure":    float,  # 0-10
            "logical_consistency":   float,  # 0-10
            "reasoning_score":       float,  # 0-10 (equal-weighted average)
        }
    """
    if not answer or len(answer.strip()) < 3:
        return {
            "causal_reasoning":    0.0,
            "argument_structure":  0.0,
            "logical_consistency": 0.0,
            "reasoning_score":     0.0,
        }

    cr  = _score_causal_reasoning(answer)
    arg = _score_argument_structure(answer)
    lc  = _score_logical_consistency(answer)

    final = round((cr + arg + lc) / 3, 2)

    return {
        "causal_reasoning":    cr,
        "argument_structure":  arg,
        "logical_consistency": lc,
        "reasoning_score":     final,
    }
