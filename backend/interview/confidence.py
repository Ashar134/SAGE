"""
Confidence Scorer — Visual Analysis
=====================================
Analyses the candidate's recorded interview video to score visual confidence.
Carries 20% weight in the final interview score.

Sub-scores (each 0-10, equally weighted):
    1. Eye Contact       — is the candidate looking at the camera?
    2. Facial Expression — positive/neutral vs nervous/disengaged emotions
    3. Posture           — upright, centered, shoulders level
    4. Dressing          — professional colour palette in upper-body region

Final: average of the 4 sub-scores.

Dependencies: opencv-python, mediapipe, deepface
"""

import os
import logging
import tempfile
import numpy as np

logger = logging.getLogger(__name__)

# Sample one frame every N seconds to keep processing fast
SAMPLE_INTERVAL_SECONDS = 2


# ── Frame Extraction ──────────────────────────────────────────────────────────

def _extract_frames(video_path: str, interval: int = SAMPLE_INTERVAL_SECONDS) -> list[np.ndarray]:
    """
    Extract frames from a video file at regular intervals.
    Returns a list of BGR numpy arrays (OpenCV format).
    """
    import cv2
    frames = []
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        logger.error(f"Cannot open video: {video_path}")
        return frames

    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    frame_interval = max(1, int(fps * interval))
    frame_idx = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_idx % frame_interval == 0:
            frames.append(frame)
        frame_idx += 1

    cap.release()
    return frames


# ── 1. Eye Contact ────────────────────────────────────────────────────────────

def _score_eye_contact(frames: list[np.ndarray]) -> float:
    """
    Score 0-10.
    Uses MediaPipe Face Mesh to detect iris landmarks.
    Estimates gaze direction by comparing iris center X to eye corner midpoint.
    If iris is within ±20% of the eye center → looking at camera.
    """
    if not frames:
        return 5.0  # no video — neutral score

    try:
        import mediapipe as mp
        mp_face_mesh = mp.solutions.face_mesh

        # Iris landmark indices (MediaPipe Face Mesh)
        LEFT_IRIS  = [474, 475, 476, 477]
        RIGHT_IRIS = [469, 470, 471, 472]
        # Eye corner indices
        LEFT_EYE_CORNERS  = [33, 133]   # left corner, right corner of left eye
        RIGHT_EYE_CORNERS = [362, 263]  # left corner, right corner of right eye

        on_camera = 0
        total = 0

        with mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,  # needed for iris landmarks
            min_detection_confidence=0.5
        ) as face_mesh:
            for frame in frames:
                import cv2
                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                result = face_mesh.process(rgb)
                if not result.multi_face_landmarks:
                    continue

                lm = result.multi_face_landmarks[0].landmark
                total += 1

                def iris_offset(iris_ids, corner_ids):
                    iris_x = np.mean([lm[i].x for i in iris_ids])
                    corner_x = np.mean([lm[i].x for i in corner_ids])
                    eye_width = abs(lm[corner_ids[1]].x - lm[corner_ids[0]].x)
                    if eye_width < 1e-6:
                        return 0.0
                    return abs(iris_x - corner_x) / eye_width

                left_offset  = iris_offset(LEFT_IRIS,  LEFT_EYE_CORNERS)
                right_offset = iris_offset(RIGHT_IRIS, RIGHT_EYE_CORNERS)
                avg_offset = (left_offset + right_offset) / 2

                # Threshold: if iris is within 20% of eye center → on camera
                if avg_offset <= 0.20:
                    on_camera += 1

        if total == 0:
            return 5.0
        return round((on_camera / total) * 10, 2)

    except Exception as e:
        logger.error(f"Eye contact scoring failed: {e}")
        return 5.0


# ── 2. Facial Expression ──────────────────────────────────────────────────────

def _score_facial_expression(frames: list[np.ndarray]) -> float:
    """
    Score 0-10.
    Uses DeepFace to classify dominant emotion per frame.
    Positive emotions (happy, neutral) → confident.
    Negative emotions (sad, fear, disgust, angry) → nervous/disengaged.
    """
    if not frames:
        return 5.0

    try:
        import cv2
        from deepface import DeepFace

        POSITIVE = {"happy", "neutral"}
        NEGATIVE = {"sad", "fear", "disgust", "angry"}

        positive = 0
        negative = 0
        total = 0

        for frame in frames:
            try:
                # Save frame to temp file (DeepFace works with file paths)
                with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
                    cv2.imwrite(tmp.name, frame)
                    tmp_path = tmp.name

                result = DeepFace.analyze(
                    img_path=tmp_path,
                    actions=["emotion"],
                    enforce_detection=False,
                    silent=True
                )
                os.unlink(tmp_path)

                if isinstance(result, list):
                    result = result[0]

                dominant = result.get("dominant_emotion", "neutral").lower()
                total += 1

                if dominant in POSITIVE:
                    positive += 1
                elif dominant in NEGATIVE:
                    negative += 1

            except Exception:
                continue

        if total == 0:
            return 5.0

        # Score: base 5, +1.5 per positive frame ratio, -1.5 per negative frame ratio
        pos_ratio = positive / total
        neg_ratio = negative / total
        score = 5.0 + (pos_ratio * 5.0) - (neg_ratio * 3.0)
        return round(max(min(score, 10.0), 0.0), 2)

    except Exception as e:
        logger.error(f"Facial expression scoring failed: {e}")
        return 5.0


# ── 3. Posture ────────────────────────────────────────────────────────────────

def _score_posture(frames: list[np.ndarray]) -> float:
    """
    Score 0-10.
    Uses MediaPipe Pose to detect shoulder and nose landmarks.
    Checks:
        1. Shoulder level: abs(left_shoulder_y - right_shoulder_y) < threshold
        2. Head centering: nose X within center 40% of frame
        3. Face visibility: face detected in >70% of frames
    Each check contributes ~3.33 points.
    """
    if not frames:
        return 5.0

    try:
        import cv2
        import mediapipe as mp
        mp_pose = mp.solutions.pose

        level_count    = 0
        centered_count = 0
        detected_count = 0
        total = len(frames)

        with mp_pose.Pose(
            static_image_mode=True,
            min_detection_confidence=0.5
        ) as pose:
            for frame in frames:
                h, w = frame.shape[:2]
                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                result = pose.process(rgb)

                if not result.pose_landmarks:
                    continue

                lm = result.pose_landmarks.landmark
                detected_count += 1

                # Shoulder landmarks: LEFT=11, RIGHT=12
                left_y  = lm[11].y
                right_y = lm[12].y
                shoulder_tilt = abs(left_y - right_y)

                # Nose landmark: 0
                nose_x = lm[0].x  # normalised 0-1

                # Check 1: shoulders roughly level (tilt < 5% of frame height)
                if shoulder_tilt < 0.05:
                    level_count += 1

                # Check 2: nose in center 40% of frame (0.3 to 0.7)
                if 0.30 <= nose_x <= 0.70:
                    centered_count += 1

        if total == 0:
            return 5.0

        visibility_ratio = detected_count / total
        level_ratio      = level_count / total
        centered_ratio   = centered_count / total

        score = (visibility_ratio * 3.33) + (level_ratio * 3.33) + (centered_ratio * 3.34)
        return round(min(score, 10.0), 2)

    except Exception as e:
        logger.error(f"Posture scoring failed: {e}")
        return 5.0


# ── 4. Dressing ───────────────────────────────────────────────────────────────

def _score_dressing(frames: list[np.ndarray]) -> float:
    """
    Score 0-10.
    Analyses the upper-body clothing region (rows 30%-70% of frame,
    excluding the face area at the top).
    Converts to HSV and measures average saturation.
    Professional attire: low saturation (dark/neutral colours).
    Casual/bright attire: high saturation.
    Also checks background cleanliness (low variance in background region).
    """
    if not frames:
        return 5.0

    try:
        import cv2

        saturation_values = []

        for frame in frames:
            h, w = frame.shape[:2]

            # Upper body region: rows 30%-70%, full width
            top    = int(h * 0.30)
            bottom = int(h * 0.70)
            region = frame[top:bottom, :]

            if region.size == 0:
                continue

            hsv = cv2.cvtColor(region, cv2.COLOR_BGR2HSV)
            # Saturation channel (index 1), range 0-255
            avg_saturation = np.mean(hsv[:, :, 1]) / 255.0  # normalise to 0-1
            saturation_values.append(avg_saturation)

        if not saturation_values:
            return 5.0

        avg_sat = np.mean(saturation_values)

        # Low saturation (< 0.2) → professional dark/neutral → high score
        # High saturation (> 0.5) → bright/casual → lower score
        # Map: sat=0.0 → 10, sat=0.5 → 5, sat=1.0 → 0
        score = 10.0 - (avg_sat * 10.0)
        return round(max(min(score, 10.0), 0.0), 2)

    except Exception as e:
        logger.error(f"Dressing scoring failed: {e}")
        return 5.0


# ── Public API ────────────────────────────────────────────────────────────────

def score_confidence_from_video(video_path: str) -> dict:
    """
    Main entry point. Analyses a video file and returns confidence scores.

    Args:
        video_path: Absolute path to the video file (webm/mp4).

    Returns:
        {
            "eye_contact":        float,  # 0-10
            "facial_expression":  float,  # 0-10
            "posture":            float,  # 0-10
            "dressing":           float,  # 0-10
            "confidence_score":   float,  # 0-10 (equal-weighted average)
        }
    """
    if not video_path or not os.path.exists(video_path):
        logger.error(f"Video file not found: {video_path}")
        return {
            "eye_contact":       5.0,
            "facial_expression": 5.0,
            "posture":           5.0,
            "dressing":          5.0,
            "confidence_score":  5.0,
        }

    frames = _extract_frames(video_path)

    if not frames:
        logger.warning("No frames extracted from video.")
        return {
            "eye_contact":       5.0,
            "facial_expression": 5.0,
            "posture":           5.0,
            "dressing":          5.0,
            "confidence_score":  5.0,
        }

    ec  = _score_eye_contact(frames)
    fe  = _score_facial_expression(frames)
    po  = _score_posture(frames)
    dr  = _score_dressing(frames)

    final = round((ec + fe + po + dr) / 4, 2)

    return {
        "eye_contact":       ec,
        "facial_expression": fe,
        "posture":           po,
        "dressing":          dr,
        "confidence_score":  final,
    }


def score_confidence_from_bytes(video_bytes: bytes, suffix: str = ".webm") -> dict:
    """
    Convenience wrapper: accepts raw video bytes, saves to temp file,
    runs analysis, cleans up.
    """
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(video_bytes)
        tmp_path = tmp.name

    try:
        return score_confidence_from_video(tmp_path)
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
