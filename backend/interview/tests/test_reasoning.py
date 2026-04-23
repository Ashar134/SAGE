"""
Tests for reasoning.py
Run with: pytest backend/interview/tests/test_reasoning.py -v
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

import pytest
from interview.reasoning import (
    score_reasoning,
    _score_causal_reasoning,
    _score_argument_structure,
    _score_logical_consistency,
)

# ── Fixtures ──────────────────────────────────────────────────────────────────

# Strong reasoning: causal connectors, claim-evidence-conclusion, consistent
STRONG_ANSWER = """
I believe that active learning is more effective than passive lecturing because
students retain information better when they engage with the material directly.
For example, in my previous course I introduced weekly problem-solving sessions,
which resulted in a 20% improvement in exam scores.
Therefore, I would structure this course around project-based learning,
since this approach develops both technical skills and critical thinking.
In conclusion, this methodology is supported by educational research and
aligns with the university's focus on outcome-based education.
"""

# Good reasoning: has causal connectors but weak conclusion
GOOD_ANSWER = """
I think student engagement is important because it directly affects learning outcomes.
When students are actively involved, they tend to understand concepts more deeply.
For instance, I use Socratic questioning to encourage critical thinking.
This leads to better retention and application of knowledge in real scenarios.
"""

# Weak reasoning: no causal connectors, no structure, just statements
WEAK_ANSWER = """
I am a good teacher. I have experience. Students like my classes.
I know the subject well. I have taught many courses. I am professional.
I work hard. I prepare my lectures. I give good feedback.
"""

# Contradictory answer: self-corrections and hedging
CONTRADICTORY_ANSWER = """
I would use Python for this course. But actually, maybe Java is better.
Or wait, I'm not sure which language is more appropriate.
I think Python might work, or perhaps we could use both.
I don't know, it could be either one depending on various factors.
Actually no, Python is definitely the right choice. Or maybe not.
"""

# Heavily hedged answer
HEDGED_ANSWER = """
I think I might possibly use some kind of approach that could perhaps work.
Maybe I would probably consider various methods that might be somewhat effective.
I suppose I could perhaps try different things that might possibly help students.
It's possible that I might use some sort of technique that could maybe work.
"""

# Short but well-reasoned
SHORT_REASONED = (
    "I believe project-based learning is most effective because it develops "
    "critical thinking. Therefore, I would structure assessments around real problems."
)

EMPTY_ANSWER = ""


# ── Causal Reasoning Tests ────────────────────────────────────────────────────

class TestCausalReasoning:

    def test_strong_answer_scores_high(self):
        score = _score_causal_reasoning(STRONG_ANSWER)
        assert score >= 6.0, f"Expected >= 6.0, got {score}"

    def test_weak_answer_scores_low(self):
        score = _score_causal_reasoning(WEAK_ANSWER)
        assert score <= 3.0, f"Expected <= 3.0, got {score}"

    def test_strong_beats_weak(self):
        strong = _score_causal_reasoning(STRONG_ANSWER)
        weak = _score_causal_reasoning(WEAK_ANSWER)
        assert strong > weak, f"Strong ({strong}) should beat weak ({weak})"

    def test_short_reasoned_scores_well(self):
        score = _score_causal_reasoning(SHORT_REASONED)
        assert score >= 5.0, f"Short but reasoned answer should score well, got {score}"

    def test_empty_returns_zero(self):
        assert _score_causal_reasoning(EMPTY_ANSWER) == 0.0

    def test_score_within_range(self):
        for answer in [STRONG_ANSWER, GOOD_ANSWER, WEAK_ANSWER, CONTRADICTORY_ANSWER]:
            score = _score_causal_reasoning(answer)
            assert 0.0 <= score <= 10.0, f"Score out of range: {score}"


# ── Argument Structure Tests ──────────────────────────────────────────────────

class TestArgumentStructure:

    def test_complete_argument_scores_high(self):
        # Has claim (I believe), evidence (for example), conclusion (therefore/in conclusion)
        score = _score_argument_structure(STRONG_ANSWER)
        assert score >= 8.0, f"Complete argument should score high, got {score}"

    def test_no_structure_scores_low(self):
        score = _score_argument_structure(WEAK_ANSWER)
        assert score <= 4.0, f"No structure should score low, got {score}"

    def test_claim_only_partial_score(self):
        claim_only = "I believe teaching is important. Students need guidance."
        score = _score_argument_structure(claim_only)
        # Only claim present → ~3.33 points
        assert score <= 5.0, f"Claim only should score partially, got {score}"

    def test_claim_and_evidence_partial_score(self):
        claim_evidence = (
            "I believe active learning works. "
            "For example, students who participate score higher on exams."
        )
        score = _score_argument_structure(claim_evidence)
        # Claim + evidence → ~6.67 points
        assert 5.0 <= score <= 8.0, f"Claim+evidence should score ~6-7, got {score}"

    def test_all_three_components_bonus(self):
        full = (
            "I believe project-based learning is effective. "
            "For example, research shows 30% better retention. "
            "Therefore, I would adopt this approach in my courses."
        )
        score = _score_argument_structure(full)
        assert score >= 9.0, f"All 3 components should score >= 9.0, got {score}"

    def test_empty_returns_zero(self):
        assert _score_argument_structure(EMPTY_ANSWER) == 0.0

    def test_score_within_range(self):
        for answer in [STRONG_ANSWER, GOOD_ANSWER, WEAK_ANSWER]:
            score = _score_argument_structure(answer)
            assert 0.0 <= score <= 10.0, f"Score out of range: {score}"


# ── Logical Consistency Tests ─────────────────────────────────────────────────

class TestLogicalConsistency:

    def test_consistent_answer_scores_high(self):
        score = _score_logical_consistency(STRONG_ANSWER)
        assert score >= 7.0, f"Consistent answer should score high, got {score}"

    def test_contradictory_answer_scores_low(self):
        score = _score_logical_consistency(CONTRADICTORY_ANSWER)
        assert score <= 5.0, f"Contradictory answer should score low, got {score}"

    def test_heavily_hedged_answer_penalised(self):
        score = _score_logical_consistency(HEDGED_ANSWER)
        assert score <= 7.0, f"Heavily hedged answer should be penalised, got {score}"

    def test_consistent_beats_contradictory(self):
        consistent = _score_logical_consistency(STRONG_ANSWER)
        contradictory = _score_logical_consistency(CONTRADICTORY_ANSWER)
        assert consistent > contradictory, (
            f"Consistent ({consistent}) should beat contradictory ({contradictory})"
        )

    def test_empty_returns_zero(self):
        assert _score_logical_consistency(EMPTY_ANSWER) == 0.0

    def test_score_within_range(self):
        for answer in [STRONG_ANSWER, CONTRADICTORY_ANSWER, HEDGED_ANSWER, WEAK_ANSWER]:
            score = _score_logical_consistency(answer)
            assert 0.0 <= score <= 10.0, f"Score out of range: {score}"


# ── Integration: score_reasoning() ───────────────────────────────────────────

class TestScoreReasoning:

    def test_returns_all_keys(self):
        result = score_reasoning(STRONG_ANSWER)
        expected_keys = {
            "causal_reasoning", "argument_structure",
            "logical_consistency", "reasoning_score"
        }
        assert expected_keys == set(result.keys())

    def test_strong_beats_weak(self):
        strong = score_reasoning(STRONG_ANSWER)["reasoning_score"]
        weak = score_reasoning(WEAK_ANSWER)["reasoning_score"]
        assert strong > weak, f"Strong ({strong}) should beat weak ({weak})"

    def test_strong_beats_contradictory(self):
        strong = score_reasoning(STRONG_ANSWER)["reasoning_score"]
        contradictory = score_reasoning(CONTRADICTORY_ANSWER)["reasoning_score"]
        assert strong > contradictory, (
            f"Strong ({strong}) should beat contradictory ({contradictory})"
        )

    def test_empty_returns_all_zeros(self):
        result = score_reasoning(EMPTY_ANSWER)
        for key, val in result.items():
            assert val == 0.0, f"Expected 0.0 for '{key}', got {val}"

    def test_final_score_is_average_of_sub_scores(self):
        result = score_reasoning(STRONG_ANSWER)
        expected = round((
            result["causal_reasoning"] +
            result["argument_structure"] +
            result["logical_consistency"]
        ) / 3, 2)
        assert result["reasoning_score"] == expected, (
            f"Final {result['reasoning_score']} != average {expected}"
        )

    def test_all_scores_within_range(self):
        for answer in [STRONG_ANSWER, GOOD_ANSWER, WEAK_ANSWER, CONTRADICTORY_ANSWER]:
            result = score_reasoning(answer)
            for key, val in result.items():
                assert 0.0 <= val <= 10.0, f"'{key}' out of range: {val}"

    def test_short_reasoned_scores_reasonably(self):
        result = score_reasoning(SHORT_REASONED)
        assert result["reasoning_score"] >= 4.0, (
            f"Short but reasoned answer should score >= 4.0, got {result['reasoning_score']}"
        )
