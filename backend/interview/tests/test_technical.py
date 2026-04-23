"""
Tests for technical.py
Run with: pytest backend/interview/tests/test_technical.py -v
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

import pytest
from interview.technical import (
    score_technical,
    _score_breadth,
    _score_depth,
    _score_specificity,
    _extract_keywords,
)

# ── Fixtures ──────────────────────────────────────────────────────────────────

JOB_TITLE = "Assistant Professor Computer Science"

REQUIREMENTS = [
    "Python programming",
    "machine learning",
    "data structures",
    "algorithms",
    "object oriented programming",
    "database management",
    "research publications",
    "curriculum development",
]

QUESTION = (
    "How would you design and teach a course on machine learning "
    "to undergraduate students with limited Python experience?"
)

# Strong technical answer — covers breadth, explains concepts, specific
STRONG_ANSWER = """
I would begin by establishing Python fundamentals in the first two weeks,
covering NumPy, Pandas, and Matplotlib through hands-on lab sessions.
For machine learning concepts, I would follow a bottom-up approach:
starting with linear regression and gradient descent before introducing
neural networks. I have taught this course to 45 students at my previous
institution using Scikit-learn and TensorFlow. Assessment would include
3 programming assignments and a final project on a real dataset.
The curriculum would align with ACM guidelines for undergraduate CS education.
"""

# Mentions keywords but no explanation — name-dropping
NAME_DROP_ANSWER = "Python machine learning data structures algorithms curriculum."

# Vague answer — no specifics
VAGUE_ANSWER = """
I would teach various things about machine learning and Python.
There are many different topics to cover and several approaches one could take.
Generally speaking, I would use some kind of structured approach with
different types of assignments and various assessment methods.
"""

# Completely off-topic
IRRELEVANT_ANSWER = """
I enjoy hiking and outdoor activities in my free time.
Last summer I visited several national parks and took many photographs.
The weather was beautiful and I met some interesting people along the way.
"""

# Short but precise
SHORT_PRECISE_ANSWER = (
    "I would use Scikit-learn with Python 3, covering supervised learning "
    "algorithms including linear regression, SVM, and decision trees over 14 weeks."
)

EMPTY_ANSWER = ""


# ── Breadth Tests ─────────────────────────────────────────────────────────────

class TestBreadth:

    def test_strong_answer_covers_more_keywords(self):
        score = _score_breadth(QUESTION, STRONG_ANSWER, JOB_TITLE, REQUIREMENTS)
        assert score >= 3.0, f"Expected >= 3.0, got {score}"

    def test_irrelevant_answer_scores_low(self):
        score = _score_breadth(QUESTION, IRRELEVANT_ANSWER, JOB_TITLE, REQUIREMENTS)
        assert score <= 4.0, f"Expected <= 4.0, got {score}"

    def test_strong_beats_irrelevant(self):
        strong = _score_breadth(QUESTION, STRONG_ANSWER, JOB_TITLE, REQUIREMENTS)
        irrelevant = _score_breadth(QUESTION, IRRELEVANT_ANSWER, JOB_TITLE, REQUIREMENTS)
        assert strong > irrelevant, f"Strong ({strong}) should beat irrelevant ({irrelevant})"

    def test_empty_answer_returns_zero(self):
        score = _score_breadth(QUESTION, EMPTY_ANSWER, JOB_TITLE, REQUIREMENTS)
        assert score == 0.0, f"Expected 0.0, got {score}"

    def test_score_within_range(self):
        for answer in [STRONG_ANSWER, VAGUE_ANSWER, IRRELEVANT_ANSWER]:
            score = _score_breadth(QUESTION, answer, JOB_TITLE, REQUIREMENTS)
            assert 0.0 <= score <= 10.0, f"Score out of range: {score}"


# ── Depth Tests ───────────────────────────────────────────────────────────────

class TestDepth:

    def test_strong_answer_scores_high(self):
        score = _score_depth(QUESTION, STRONG_ANSWER, JOB_TITLE, REQUIREMENTS)
        assert score >= 5.0, f"Expected >= 5.0, got {score}"

    def test_name_drop_penalised(self):
        strong = _score_depth(QUESTION, STRONG_ANSWER, JOB_TITLE, REQUIREMENTS)
        namedrop = _score_depth(QUESTION, NAME_DROP_ANSWER, JOB_TITLE, REQUIREMENTS)
        assert strong > namedrop, f"Strong ({strong}) should beat name-drop ({namedrop})"

    def test_irrelevant_answer_scores_low(self):
        score = _score_depth(QUESTION, IRRELEVANT_ANSWER, JOB_TITLE, REQUIREMENTS)
        assert score <= 5.0, f"Expected <= 5.0, got {score}"

    def test_empty_answer_returns_zero(self):
        score = _score_depth(QUESTION, EMPTY_ANSWER, JOB_TITLE, REQUIREMENTS)
        assert score == 0.0, f"Expected 0.0, got {score}"

    def test_score_within_range(self):
        for answer in [STRONG_ANSWER, NAME_DROP_ANSWER, IRRELEVANT_ANSWER]:
            score = _score_depth(QUESTION, answer, JOB_TITLE, REQUIREMENTS)
            assert 0.0 <= score <= 10.0, f"Score out of range: {score}"


# ── Specificity Tests ─────────────────────────────────────────────────────────

class TestSpecificity:

    def test_specific_answer_scores_above_base(self):
        score = _score_specificity(STRONG_ANSWER, REQUIREMENTS)
        assert score >= 6.0, f"Expected >= 6.0, got {score}"

    def test_vague_answer_scores_below_base(self):
        score = _score_specificity(VAGUE_ANSWER, REQUIREMENTS)
        assert score <= 5.0, f"Expected <= 5.0, got {score}"

    def test_numbers_boost_score(self):
        with_numbers = "I taught 45 students over 14 weeks using 3 assignments."
        without_numbers = "I taught students over several weeks using some assignments."
        s1 = _score_specificity(with_numbers, REQUIREMENTS)
        s2 = _score_specificity(without_numbers, REQUIREMENTS)
        assert s1 > s2, f"Numbers should boost score: {s1} vs {s2}"

    def test_empty_answer_returns_zero(self):
        score = _score_specificity(EMPTY_ANSWER, REQUIREMENTS)
        assert score == 0.0, f"Expected 0.0, got {score}"

    def test_score_within_range(self):
        for answer in [STRONG_ANSWER, VAGUE_ANSWER, SHORT_PRECISE_ANSWER]:
            score = _score_specificity(answer, REQUIREMENTS)
            assert 0.0 <= score <= 10.0, f"Score out of range: {score}"


# ── Integration: score_technical() ───────────────────────────────────────────

class TestScoreTechnical:

    def test_returns_all_keys(self):
        result = score_technical(QUESTION, STRONG_ANSWER, JOB_TITLE, REQUIREMENTS)
        expected_keys = {"breadth", "depth", "specificity", "technical_score"}
        assert expected_keys == set(result.keys())

    def test_strong_beats_irrelevant(self):
        strong = score_technical(QUESTION, STRONG_ANSWER, JOB_TITLE, REQUIREMENTS)["technical_score"]
        irrelevant = score_technical(QUESTION, IRRELEVANT_ANSWER, JOB_TITLE, REQUIREMENTS)["technical_score"]
        assert strong > irrelevant, f"Strong ({strong}) should beat irrelevant ({irrelevant})"

    def test_strong_beats_vague(self):
        strong = score_technical(QUESTION, STRONG_ANSWER, JOB_TITLE, REQUIREMENTS)["technical_score"]
        vague = score_technical(QUESTION, VAGUE_ANSWER, JOB_TITLE, REQUIREMENTS)["technical_score"]
        assert strong > vague, f"Strong ({strong}) should beat vague ({vague})"

    def test_empty_answer_returns_all_zeros(self):
        result = score_technical(QUESTION, EMPTY_ANSWER, JOB_TITLE, REQUIREMENTS)
        for key, val in result.items():
            assert val == 0.0, f"Expected 0.0 for '{key}', got {val}"

    def test_final_score_is_average_of_sub_scores(self):
        result = score_technical(QUESTION, STRONG_ANSWER, JOB_TITLE, REQUIREMENTS)
        expected = round((
            result["breadth"] +
            result["depth"] +
            result["specificity"]
        ) / 3, 2)
        assert result["technical_score"] == expected, (
            f"Final {result['technical_score']} != average {expected}"
        )

    def test_all_scores_within_range(self):
        for answer in [STRONG_ANSWER, VAGUE_ANSWER, IRRELEVANT_ANSWER, SHORT_PRECISE_ANSWER]:
            result = score_technical(QUESTION, answer, JOB_TITLE, REQUIREMENTS)
            for key, val in result.items():
                assert 0.0 <= val <= 10.0, f"'{key}' out of range: {val}"

    def test_short_precise_answer_scores_reasonably(self):
        result = score_technical(QUESTION, SHORT_PRECISE_ANSWER, JOB_TITLE, REQUIREMENTS)
        assert result["technical_score"] >= 3.0, (
            f"Short precise answer should score >= 3.0, got {result['technical_score']}"
        )
