"""
Communication Scorer
====================
Evaluates HOW information is conveyed, not WHAT is said.
Returns a score 0-10 composed of 4 equally-weighted sub-scores:

    1. Structural Coherence   (0-10)  — signposting & logical flow
    2. Linguistic Adaptability (0-10) — readability, not jargon-buried
    3. Conciseness            (0-10)  — low filler, no circular reasoning
    4. Professional Register  (0-10)  — formal academic tone

Final: average of the 4 sub-scores.
"""

import re
import textstat

# ── 1. Structural Coherence ───────────────────────────────────────────────────

# Grouped by discourse function — we reward VARIETY across categories
_SIGNPOST_CATEGORIES = {
    "sequencing":   [
        r"\bfirst(ly)?\b", r"\bsecond(ly)?\b", r"\bthird(ly)?\b",
        r"\bfinally\b", r"\bnext\b", r"\bto begin\b", r"\bto start\b",
        r"\bbeginning with\b", r"\bfollowing this\b",
    ],
    "elaboration":  [
        r"\bspecifically\b", r"\bfor example\b", r"\bfor instance\b",
        r"\bin particular\b", r"\bthat is\b", r"\bnamely\b",
        r"\bto illustrate\b", r"\bsuch as\b",
    ],
    "contrast":     [
        r"\bhowever\b", r"\bon the other hand\b", r"\balthough\b",
        r"\bnevertheless\b", r"\byet\b", r"\bconversely\b",
        r"\bdespite\b", r"\bwhile\b", r"\bwhereas\b",
    ],
    "conclusion":   [
        r"\bin conclusion\b", r"\bto summarize\b", r"\boverall\b",
        r"\btherefore\b", r"\bthus\b", r"\bconsequently\b",
        r"\bin summary\b", r"\bto conclude\b", r"\bin short\b",
    ],
}


def _score_structural_coherence(text: str) -> float:
    """
    Score 0-10.
    - Up to 7 points for category coverage (distinct signpost categories used)
    - Up to 3 points for sentence count (single-sentence = no flow)
    """
    lower = text.lower()
    categories_used = 0
    for patterns in _SIGNPOST_CATEGORIES.values():
        if any(re.search(p, lower) for p in patterns):
            categories_used += 1

    # 4 categories → full 7 points, scaled linearly
    category_score = (categories_used / 4) * 7

    # Sentence flow bonus: reward multi-sentence answers
    sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
    n = len(sentences)
    if n >= 4:
        flow_bonus = 3.0
    elif n == 3:
        flow_bonus = 2.0
    elif n == 2:
        flow_bonus = 1.0
    else:
        flow_bonus = 0.0

    return round(min(category_score + flow_bonus, 10.0), 2)


# ── 2. Linguistic Adaptability ────────────────────────────────────────────────

def _score_linguistic_adaptability(text: str) -> float:
    """
    Score 0-10 based on Flesch Reading Ease.
    Target sweet spot: 40-70 (academic but accessible).

    Flesch scale:
        90-100  Very easy (too simple for academic context)
        70-90   Easy
        60-70   Standard  ← ideal upper range
        40-60   Fairly difficult ← ideal lower range
        30-40   Difficult
        0-30    Very confusing / jargon-heavy
    """
    if not text or len(text.split()) < 5:
        return 5.0  # not enough text to judge

    flesch = textstat.flesch_reading_ease(text)

    # Map Flesch to 0-10
    # Peak score at 50-65 (clear academic prose)
    if 50 <= flesch <= 65:
        score = 10.0
    elif 40 <= flesch < 50 or 65 < flesch <= 75:
        score = 8.0
    elif 30 <= flesch < 40 or 75 < flesch <= 85:
        score = 6.0
    elif 20 <= flesch < 30 or 85 < flesch <= 90:
        score = 4.0
    elif 10 <= flesch < 20 or 90 < flesch <= 95:
        score = 2.0
    else:
        score = 1.0

    return round(score, 2)


# ── 3. Conciseness ────────────────────────────────────────────────────────────

_FILLER_PHRASES = [
    # Hesitation sounds / disfluencies (Whisper transcribes these in various forms)
    r"\bum+\b", r"\buh+\b", r"\berr+\b", r"\bah+\b", r"\boh+\b",
    r"\bhmm+\b", r"\bmm+\b", r"\bhuh\b", r"\bugh+\b",
    r"\baa+\b",   # "aa", "aaa"
    r"\bagh+\b",  # "agh", "aghh"
    r"\beh+\b",   # "eh", "ehh"
    # Verbal filler phrases
    r"\byou know\b", r"\bkind of\b", r"\bsort of\b", r"\bbasically\b",
    r"\blike i said\b", r"\bas i mentioned\b", r"\bi mean\b",
    r"\bto be honest\b", r"\bat the end of the day\b", r"\bactually\b",
    r"\bliterally\b", r"\bso yeah\b", r"\byeah so\b", r"\bright so\b",
    r"\bif that makes sense\b", r"\bdoes that make sense\b",
    r"\bif you will\b", r"\bso to speak\b",
]


def _detect_circular_reasoning(text: str) -> int:
    """
    Count sentences where the same word stem (first 5 chars, 5+ letter words)
    appears 3+ times, indicating circular/repetitive reasoning.
    e.g. 'Teaching teaches teachers to teach teaching techniques.'
         stems: teach, teach, teach, teach, teach → circular
    Returns count of circular sentences (0 = good).
    """
    from collections import Counter
    sentences = [s.strip() for s in re.split(r'[.!?]+', text) if len(s.strip()) > 10]
    circular = 0
    for sent in sentences:
        words = re.findall(r'\b[a-z]{5,}\b', sent.lower())
        if words:
            stems = [w[:5] for w in words]
            most_common_count = Counter(stems).most_common(1)[0][1]
            if most_common_count >= 3:
                circular += 1
    return circular


def _score_conciseness(text: str) -> float:
    """
    Score 0-10.
    Penalise filler phrases (per 100 words) and circular reasoning.
    Uses a minimum word count of 50 as the denominator floor so that
    a single filler in a short answer isn't catastrophically penalised.
    """
    if not text.strip():
        return 0.0

    lower = text.lower()
    word_count = len(text.split())
    # Use a floor of 50 words so short answers aren't over-penalised
    effective_count = max(word_count, 50)

    # Count filler hits
    filler_count = sum(
        len(re.findall(p, lower)) for p in _FILLER_PHRASES
    )
    # Normalise to per-100-words rate using floored denominator
    filler_rate = (filler_count / effective_count) * 100

    # Circular reasoning penalty
    circular_count = _detect_circular_reasoning(text)

    score = 10.0
    score -= min(filler_rate * 1.2, 6.0)    # max 6 point deduction for fillers
    score -= min(circular_count * 2.5, 5.0) # max 5 point deduction for circularity

    return round(max(score, 0.0), 2)


# ── 4. Professional Register ──────────────────────────────────────────────────

_INFORMAL_MARKERS = [
    r"\bgonna\b", r"\bwanna\b", r"\bkinda\b", r"\bgotta\b",
    r"\blotta\b", r"\bnotta\b", r"\bstuff\b", r"\bthings\b",
    r"\ba lot\b", r"\bpretty good\b", r"\bsuper\b", r"\bawesome\b",
    r"\bcool\b", r"\bguys\b", r"\byeah\b", r"\bnope\b",
    r"\byep\b", r"\bokay so\b", r"\blike\b",
]

_FORMAL_MARKERS = [
    r"\bfurthermore\b", r"\bconsequently\b", r"\bfacilitate\b",
    r"\bdemonstrate\b", r"\bimplement\b", r"\bcollaborate\b",
    r"\bcontribute\b", r"\bresearch\b", r"\bacademic\b",
    r"\bcurriculum\b", r"\bpedagogy\b", r"\bmethodology\b",
    r"\bframework\b", r"\bstrategy\b", r"\bapproach\b",
    r"\bprofessional\b", r"\bexpertise\b", r"\bproficiency\b",
    r"\bcompetency\b", r"\bscholarship\b", r"\bpublication\b",
    r"\binstruction\b", r"\bassessment\b", r"\bevaluation\b",
]


def _score_professional_register(text: str) -> float:
    """
    Score 0-10.
    Base 5, +0.5 per formal marker hit, -1.0 per informal marker hit.
    Clamped to [0, 10].
    """
    lower = text.lower()
    word_count = max(len(text.split()), 1)

    formal_hits = sum(
        1 for p in _FORMAL_MARKERS if re.search(p, lower)
    )
    informal_hits = sum(
        len(re.findall(p, lower)) for p in _INFORMAL_MARKERS
    )

    # Normalise informal hits to per-100-words to avoid penalising long answers
    informal_rate = (informal_hits / word_count) * 100

    score = 5.0
    score += min(formal_hits * 0.5, 4.0)      # max +4 from formal markers
    score -= min(informal_rate * 1.0, 5.0)    # max -5 from informal markers

    return round(max(min(score, 10.0), 0.0), 2)


# ── Public API ────────────────────────────────────────────────────────────────

def score_communication(answer: str) -> dict:
    """
    Main entry point.
    Returns a dict with all sub-scores and the final weighted score (0-10).

    Args:
        answer: The transcribed candidate answer text.

    Returns:
        {
            "structural_coherence":     float,  # 0-10
            "linguistic_adaptability":  float,  # 0-10
            "conciseness":              float,  # 0-10
            "professional_register":    float,  # 0-10
            "communication_score":      float,  # 0-10 (equal-weighted average)
        }
    """
    if not answer or len(answer.strip()) < 3:
        return {
            "structural_coherence":    0.0,
            "linguistic_adaptability": 0.0,
            "conciseness":             0.0,
            "professional_register":   0.0,
            "communication_score":     0.0,
        }

    sc  = _score_structural_coherence(answer)
    la  = _score_linguistic_adaptability(answer)
    con = _score_conciseness(answer)
    pr  = _score_professional_register(answer)

    final = round((sc + la + con + pr) / 4, 2)

    return {
        "structural_coherence":    sc,
        "linguistic_adaptability": la,
        "conciseness":             con,
        "professional_register":   pr,
        "communication_score":     final,
    }
