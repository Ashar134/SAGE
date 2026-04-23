"""
Tests for confidence.py
Run with: pytest backend/interview/tests/test_confidence.py -v

Note: Visual sub-scores (eye_contact, facial_expression, posture) require
actual video frames. Tests use synthetic numpy frames to validate logic
without needing real video files.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

import os
import tempfile
import numpy as np
import pytest

from interview.confidence import (
    score_confidence_from_video,
    score_confidence_from_bytes,
    _extract_frames,
    _score_dressing,
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _make_frame(h: int = 480, w: int = 640, color_bgr: tuple = (50, 50, 50)) -> np.ndarray:
    """Create a solid-colour BGR frame."""
    frame = np.zeros((h, w, 3), dtype=np.uint8)
    frame[:] = color_bgr
    return frame


def _make_video_file(frames: list[np.ndarray], fps: int = 5) -> str:
    """Write frames to a temp .avi file and return the path."""
    import cv2
    h, w = frames[0].shape[:2]
    tmp = tempfile.NamedTemporaryFile(suffix=".avi", delete=False)
    tmp.close()
    out = cv2.VideoWriter(tmp.name, cv2.VideoWriter_fourcc(*'XVID'), fps, (w, h))
    for f in frames:
        out.write(f)
    out.release()
    return tmp.name


# ── Frame Extraction Tests ────────────────────────────────────────────────────

class TestExtractFrames:

    def test_extracts_frames_from_valid_video(self):
        frames_in = [_make_frame() for _ in range(20)]
        path = _make_video_file(frames_in, fps=5)
        try:
            frames_out = _extract_frames(path, interval=1)
            assert len(frames_out) > 0, "Should extract at least one frame"
        finally:
            os.unlink(path)

    def test_returns_empty_for_nonexistent_file(self):
        frames = _extract_frames("/nonexistent/path/video.mp4")
        assert frames == []

    def test_frames_are_numpy_arrays(self):
        frames_in = [_make_frame() for _ in range(10)]
        path = _make_video_file(frames_in, fps=5)
        try:
            frames_out = _extract_frames(path, interval=1)
            for f in frames_out:
                assert isinstance(f, np.ndarray)
                assert f.ndim == 3  # H x W x C
        finally:
            os.unlink(path)


# ── Dressing Tests (no ML model needed) ──────────────────────────────────────

class TestDressing:

    def test_dark_neutral_clothing_scores_high(self):
        # Dark grey / navy — low saturation → professional
        dark_frames = [_make_frame(color_bgr=(40, 40, 40)) for _ in range(5)]
        score = _score_dressing(dark_frames)
        assert score >= 7.0, f"Dark neutral clothing should score high, got {score}"

    def test_bright_colourful_clothing_scores_lower(self):
        # Bright red — high saturation → casual
        bright_frames = [_make_frame(color_bgr=(0, 0, 255)) for _ in range(5)]
        score = _score_dressing(bright_frames)
        assert score <= 6.0, f"Bright clothing should score lower, got {score}"

    def test_dark_beats_bright(self):
        dark = _score_dressing([_make_frame(color_bgr=(30, 30, 30)) for _ in range(5)])
        bright = _score_dressing([_make_frame(color_bgr=(0, 200, 255)) for _ in range(5)])
        assert dark > bright, f"Dark ({dark}) should beat bright ({bright})"

    def test_empty_frames_returns_neutral(self):
        score = _score_dressing([])
        assert score == 5.0, f"Empty frames should return neutral 5.0, got {score}"

    def test_score_within_range(self):
        for color in [(30, 30, 30), (0, 0, 255), (128, 128, 128), (0, 255, 0)]:
            frames = [_make_frame(color_bgr=color) for _ in range(3)]
            score = _score_dressing(frames)
            assert 0.0 <= score <= 10.0, f"Score out of range for color {color}: {score}"

    def test_white_clothing_scores_high(self):
        # White — very low saturation → professional
        white_frames = [_make_frame(color_bgr=(240, 240, 240)) for _ in range(5)]
        score = _score_dressing(white_frames)
        assert score >= 7.0, f"White clothing should score high, got {score}"


# ── Integration: score_confidence_from_video() ───────────────────────────────

class TestScoreConfidenceFromVideo:

    def test_returns_all_keys(self):
        frames = [_make_frame() for _ in range(10)]
        path = _make_video_file(frames)
        try:
            result = score_confidence_from_video(path)
            expected_keys = {
                "eye_contact", "facial_expression",
                "posture", "dressing", "confidence_score"
            }
            assert expected_keys == set(result.keys())
        finally:
            os.unlink(path)

    def test_all_scores_within_range(self):
        frames = [_make_frame() for _ in range(10)]
        path = _make_video_file(frames)
        try:
            result = score_confidence_from_video(path)
            for key, val in result.items():
                assert 0.0 <= val <= 10.0, f"'{key}' out of range: {val}"
        finally:
            os.unlink(path)

    def test_final_score_is_average_of_sub_scores(self):
        frames = [_make_frame() for _ in range(10)]
        path = _make_video_file(frames)
        try:
            result = score_confidence_from_video(path)
            expected = round((
                result["eye_contact"] +
                result["facial_expression"] +
                result["posture"] +
                result["dressing"]
            ) / 4, 2)
            assert result["confidence_score"] == expected, (
                f"Final {result['confidence_score']} != average {expected}"
            )
        finally:
            os.unlink(path)

    def test_nonexistent_file_returns_neutral_scores(self):
        result = score_confidence_from_video("/nonexistent/video.mp4")
        for key, val in result.items():
            assert val == 5.0, f"Expected 5.0 for '{key}', got {val}"

    def test_score_confidence_from_bytes(self):
        import cv2
        frames = [_make_frame() for _ in range(10)]
        path = _make_video_file(frames)
        try:
            with open(path, 'rb') as f:
                video_bytes = f.read()
            result = score_confidence_from_bytes(video_bytes, suffix=".avi")
            assert "confidence_score" in result
            assert 0.0 <= result["confidence_score"] <= 10.0
        finally:
            os.unlink(path)

    def test_dark_clothing_video_scores_higher_dressing(self):
        dark_frames = [_make_frame(color_bgr=(30, 30, 30)) for _ in range(10)]
        bright_frames = [_make_frame(color_bgr=(0, 200, 255)) for _ in range(10)]

        dark_path = _make_video_file(dark_frames)
        bright_path = _make_video_file(bright_frames)
        try:
            dark_result = score_confidence_from_video(dark_path)
            bright_result = score_confidence_from_video(bright_path)
            assert dark_result["dressing"] > bright_result["dressing"], (
                f"Dark ({dark_result['dressing']}) should beat bright ({bright_result['dressing']})"
            )
        finally:
            os.unlink(dark_path)
            os.unlink(bright_path)
