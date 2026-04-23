"""
Tests for relevance.py
Run with: pytest backend/interview/tests/test_relevance.py -v
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

import pytest
from interview.relevance import (
    score_relevance,
    _score_directness,
    _score_topic_drift,
    _score_depth,
    _score_completeness,
    _extract_keywords,
)

# ── Fixtures ──────────────────────────────────────────────────────────────────

QUESTION = "What is your teaching philosophy and how do you engage students in the classroom?"

# Directly relevant, well-structured, elaborated
RELEVANT_ANSWER = """
My teaching philosophy centres on active learning and student engagement.
I believe students retain knowledge better when they participate rather than passively listen.
Specifically, I use Socratic questioning to encourage critical thinking during lectures.
For example, I pose real-world problems and ask students to work through them collaboratively.
In conclusion, I aim to create an environment where curiosity is rewarded and every student feels heard.
"""

# Relevant but short and precise — should still score well
SHORT_RELEVANT_ANSWER = "I believe in student-centred learning where understanding takes priority over memorisation."

# Starts on topic but drifts into unrelated personal story
DRIFTING_ANSWER = """
My teaching philosophy focuses on student engagement and active participation.
I use interactive methods to keep students involved in the learning process.
Speaking of which, last summer I went on a hiking trip to the northern mountains.
The weather was beautiful and I met some interesting people along the way.
I also visited my hometown and spent time with family which was very refreshing.
"""

# Just repeats keywords from the question without adding substance
KEYWORD_ECHO_ANSWER = """
My teaching philosophy is about teaching philosophy and engaging students.
I engage students in the classroom through classroom engagement.
Teaching students in the classroom is my teaching approach.
Student engagement in the classroom is how I teach my teaching philosophy.
"""

# Completely off-topic
IRRELEVANT_ANSWER = """
I have extensive experience with database management systems and SQL queries.
My expertise lies in optimising query performance and designing normalised schemas.
I have worked with PostgreSQL, MySQL, and Oracle in various enterprise environments.
Recently I implemented a sharding strategy that reduced query latency by forty percent.
"""

# Empty
EMPTY_ANSWER = ""


# ── Directness Tests ──────────────────────────────────────────────────────────

class TestDirectness:

    def test_relevant_opening_scores_high(self):
        score = _score_directness(QUESTION, RELEVANT_ANSWER)
        assert score >= 6.0, f"Expected >= 6.0, got {score}"

    def test_irrelevant_opening_scores_low(self):
        score = _score_directness(QUESTION, IRRELEVANT_ANSWER)
        assert score <= 5.0, f"Expected <= 5.0, got {score}"

    def test_short_relevant_answer_scores_well(self):
        score = _score_directness(QUESTION, SHORT_RELEVANT_ANSWER)
        assert score >= 4.0, f"Short relevant answer should score well, got {score}"

    def test_empty_answer_returns_zero(self):
        score = _score_directness(QUESTION, EMPTY_ANSWER)
        assert score == 0.0, f"Expected 0.0, got {score}"

    def test_score_within_range(self):
        for answer in [RELEVANT_ANSWER, DRIFTING_ANSWER, IRRELEVANT_ANSWER]:
            score = _score_directness(QUESTION, answer)
            assert 0.0 <= score <= 10.0, f"Score out of range: {score}"


# ── Topic Drift Tests ─────────────────────────────────────────────────────────

class TestTopicDrift:

    def test_consistent_answer_scores_high(self):
        score = _score_topic_drift(QUESTION, RELEVANT_ANSWER)
        assert score >= 5.0, f"Consistent answer should score high, got {score}"

    def test_drifting_answer_scores_lower_than_consistent(self):
        consistent = _score_topic_drift(QUESTION, RELEVANT_ANSWER)
        drifting = _score_topic_drift(QUESTION, DRIFTING_ANSWER)
        assert consistent > drifting, (
            f"Consistent ({consistent}) should beat drifting ({drifting})"
        )

    def test_single_sentence_no_drift_penalty(self):
        score = _score_topic_drift(QUESTION, SHORT_RELEVANT_ANSWER)
        assert score >= 4.0, f"Single sentence should not be penalised for drift, got {score}"

    def test_empty_answer_returns_zero(self):
        score = _score_topic_drift(QUESTION, EMPTY_ANSWER)
        assert score == 0.0, f"Expected 0.0, got {score}"

    def test_score_within_range(self):
        for answer in [RELEVANT_ANSWER, DRIFTING_ANSWER, IRRELEVANT_ANSWER]:
            score = _score_topic_drift(QUESTION, answer)
            assert 0.0 <= score <= 10.0, f"Score out of range: {score}"


# ── Depth vs Surface Tests ────────────────────────────────────────────────────

class TestDepth:

    def test_genuine_answer_scores_higher_than_echo(self):
        genuine = _score_depth(QUESTION, RELEVANT_ANSWER)
        echo = _score_depth(QUESTION, KEYWORD_ECHO_ANSWER)
        assert genuine > echo, (
            f"Genuine ({genuine}) should beat keyword echo ({echo})"
        )

    def test_keyword_echo_penalised(self):
        score = _score_depth(QUESTION, KEYWORD_ECHO_ANSWER)
        assert score <= 7.0, f"Keyword echo should be penalised, got {score}"

    def test_irrelevant_answer_scores_low(self):
        score = _score_depth(QUESTION, IRRELEVANT_ANSWER)
        assert score <= 6.0, f"Irrelevant answer should score low on depth, got {score}"

    def test_empty_answer_returns_zero(self):
        score = _score_depth(QUESTION, EMPTY_ANSWER)
        assert score == 0.0, f"Expected 0.0, got {score}"

    def test_score_within_range(self):
        for answer in [RELEVANT_ANSWER, KEYWORD_ECHO_ANSWER, IRRELEVANT_ANSWER]:
            score = _score_depth(QUESTION, answer)
            assert 0.0 <= score <= 10.0, f"Score out of range: {score}"


# ── Completeness Tests ────────────────────────────────────────────────────────

class TestCompleteness:

    def test_elaborated_relevant_answer_scores_high(self):
        score = _score_completeness(QUESTION, RELEVANT_ANSWER)
        assert score >= 7.0, f"Expected >= 7.0, got {score}"

    def test_short_relevant_answer_not_penalised(self):
        score = _score_completeness(QUESTION, SHORT_RELEVANT_ANSWER)
        # Short but relevant — semantic signal should carry it
        assert score >= 3.0, f"Short relevant answer should not be heavily penalised, got {score}"

    def test_elaboration_bonus_increases_with_sentences(self):
        one_sent = _score_completeness(QUESTION, "I believe in student-centred learning.")
        four_sent = _score_completeness(QUESTION, RELEVANT_ANSWER)
        assert four_sent >= one_sent, (
            f"More sentences should score >= fewer: {four_sent} vs {one_sent}"
        )

    def test_empty_answer_returns_zero(self):
        score = _score_completeness(QUESTION, EMPTY_ANSWER)
        assert score == 0.0, f"Expected 0.0, got {score}"

    def test_score_within_range(self):
        for answer in [RELEVANT_ANSWER, SHORT_RELEVANT_ANSWER, IRRELEVANT_ANSWER]:
            score = _score_completeness(QUESTION, answer)
            assert 0.0 <= score <= 10.0, f"Score out of range: {score}"


# ── Keyword Extraction Tests ──────────────────────────────────────────────────

class TestKeywordExtraction:

    def test_stopwords_removed(self):
        keywords = _extract_keywords("What is your teaching philosophy?")
        assert "what" not in keywords
        assert "is" not in keywords
        assert "your" not in keywords

    def test_content_words_kept(self):
        keywords = _extract_keywords("What is your teaching philosophy?")
        assert "teaching" in keywords
        assert "philosophy" in keywords

    def test_short_words_excluded(self):
        keywords = _extract_keywords("I am a good teacher")
        assert "am" not in keywords   # stopword
        assert "good" in keywords     # 4-char content word, correctly included
        assert "teacher" in keywords

    def test_empty_string_returns_empty_set(self):
        assert _extract_keywords("") == set()


# ── Integration: score_relevance() ───────────────────────────────────────────

class TestScoreRelevance:

    def test_returns_all_keys(self):
        result = score_relevance(QUESTION, RELEVANT_ANSWER)
        expected_keys = {
            "directness", "topic_drift", "depth",
            "completeness", "relevance_score"
        }
        assert expected_keys == set(result.keys())

    def test_relevant_scores_higher_than_irrelevant(self):
        relevant = score_relevance(QUESTION, RELEVANT_ANSWER)["relevance_score"]
        irrelevant = score_relevance(QUESTION, IRRELEVANT_ANSWER)["relevance_score"]
        assert relevant > irrelevant, (
            f"Relevant ({relevant}) should beat irrelevant ({irrelevant})"
        )

    def test_empty_answer_returns_all_zeros(self):
        result = score_relevance(QUESTION, EMPTY_ANSWER)
        for key, val in result.items():
            assert val == 0.0, f"Expected 0.0 for '{key}', got {val}"

    def test_final_score_is_average_of_sub_scores(self):
        result = score_relevance(QUESTION, RELEVANT_ANSWER)
        expected = round((
            result["directness"] +
            result["topic_drift"] +
            result["depth"] +
            result["completeness"]
        ) / 4, 2)
        assert result["relevance_score"] == expected, (
            f"Final {result['relevance_score']} != average {expected}"
        )

    def test_all_scores_within_range(self):
        for answer in [RELEVANT_ANSWER, DRIFTING_ANSWER, IRRELEVANT_ANSWER, SHORT_RELEVANT_ANSWER]:
            result = score_relevance(QUESTION, answer)
            for key, val in result.items():
                assert 0.0 <= val <= 10.0, f"'{key}' out of range: {val}"

    def test_short_relevant_answer_scores_reasonably(self):
        result = score_relevance(QUESTION, SHORT_RELEVANT_ANSWER)
        assert result["relevance_score"] >= 3.0, (
            f"Short but relevant answer should score >= 3.0, got {result['relevance_score']}"
        )
