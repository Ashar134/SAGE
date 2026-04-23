"""
Interview Bot Service
- Question generation via Ollama (llama3.2)
- TTS via gTTS
- STT via OpenAI Whisper
- Scoring via custom NLP modules (communication, relevance, technical, reasoning)
- Visual confidence scoring via MediaPipe + DeepFace (post video upload)
"""

import json
import logging
import os
import tempfile

logger = logging.getLogger(__name__)


# ── Question Generation ──────────────────────────────────────────────────────

def generate_interview_questions(job_title: str, requirements: list, n: int = 7) -> list[str]:
    """
    Generate n interview questions tailored to the job title and requirements.
    Works for any industry — academic, corporate, tech, healthcare, etc.
    Mix: behavioral, situational, motivational, role-specific technical (light).
    """
    from langchain_ollama import ChatOllama
    from langchain_core.messages import SystemMessage, HumanMessage

    requirements_text = ", ".join(requirements) if requirements else "general role requirements"

    system = SystemMessage(content=(
        f"You are an experienced interviewer conducting a professional job interview for the position of {job_title}. "
        "Generate exactly 7 high-quality interview questions tailored specifically to this role and its requirements. "
        "Do NOT assume the employer is a university or academic institution unless the job title clearly indicates it. "
        "The questions should feel natural and relevant to the actual job being applied for. "
        "Follow this distribution:\n"
        "  - 2 behavioral questions ('Tell me about a time when...')\n"
        "  - 2 situational questions ('What would you do if...')\n"
        "  - 1 motivational question ('Why do you want this role / what drives you?')\n"
        "  - 2 role-specific questions directly tied to the job requirements\n"
        "Rules:\n"
        "  - Each question must be open-ended and require a thoughtful answer\n"
        "  - Questions must be specific to the job title and requirements provided\n"
        "  - Do not ask generic questions like 'What are your strengths and weaknesses?'\n"
        "  - Do not mention any specific company name\n"
        "Return ONLY a JSON array of 7 question strings. No numbering, no extra text, no markdown."
    ))

    user = HumanMessage(content=(
        f"Job Title: {job_title}\n"
        f"Key Requirements: {requirements_text}\n\n"
        "Generate 7 tailored interview questions as a JSON array of strings."
    ))

    try:
        llm = ChatOllama(model="llama3.2", temperature=0.7, base_url="http://localhost:11434")
        response = llm.invoke([system, user])
        raw = response.content.strip()

        # Strip markdown fences if present
        if raw.startswith("```"):
            lines = raw.split("\n")
            raw = "\n".join(lines[1:-1]).strip()

        questions = json.loads(raw)
        if isinstance(questions, list) and len(questions) > 0:
            return [q for q in questions[:n] if isinstance(q, str) and q.strip()]
    except Exception as e:
        logger.error(f"Question generation failed: {e}")

    # Fallback — generic but still role-aware
    return [
        f"Tell me about yourself and what draws you to the {job_title} role.",
        f"Describe a challenging situation you faced in a previous role similar to {job_title} and how you resolved it.",
        f"How do you stay current with developments and best practices relevant to {job_title}?",
        f"Walk me through how you would approach your first 90 days in this {job_title} position.",
        f"Describe a time when you had to collaborate with a difficult team member. How did you handle it?",
        f"What specific skills or experiences make you a strong candidate for this {job_title} role?",
        f"Where do you see yourself professionally in the next three to five years?",
    ]


# ── Text-to-Speech ───────────────────────────────────────────────────────────

def text_to_speech(text: str) -> bytes:
    """Convert text to MP3 audio bytes using gTTS."""
    from gtts import gTTS
    import io

    tts = gTTS(text=text, lang='en', slow=False)
    buf = io.BytesIO()
    tts.write_to_fp(buf)
    buf.seek(0)
    return buf.read()


# ── Speech-to-Text ───────────────────────────────────────────────────────────

def speech_to_text(audio_bytes: bytes, audio_format: str = "webm") -> str:
    """Transcribe audio bytes to text using OpenAI Whisper (local)."""
    import whisper

    model = whisper.load_model("base")

    suffix = f".{audio_format}"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        result = model.transcribe(tmp_path)
        return result.get("text", "").strip()
    finally:
        os.unlink(tmp_path)


# ── Answer Scoring ───────────────────────────────────────────────────────────

def score_answer(question: str, answer: str, job_title: str, requirements: list = None) -> dict:
    """
    Score a single answer using the dedicated NLP modules.

    Weights (text-based, confidence handled separately via video):
        communication : 25%
        relevance     : 25%
        technical     : 15%
        reasoning     : 10%
        (confidence   : 31% — applied after video analysis)

    Text subtotal is normalised to 100% across the 4 text dimensions:
        communication : 25 / 69 ≈ 36.2%
        relevance     : 25 / 69 ≈ 36.2%
        technical     : 15 / 69 ≈ 21.7%
        reasoning     : 10 / 69 ≈ 14.5%

    Returns a dict with all sub-scores and a 'total' (0-10).
    """
    from interview.communication import score_communication
    from interview.relevance import score_relevance
    from interview.technical import score_technical
    from interview.reasoning import score_reasoning

    if not answer or len(answer.strip()) < 5:
        return {
            "communication": 0.0,
            "relevance":     0.0,
            "technical":     0.0,
            "reasoning":     0.0,
            "total":         0.0,
            "feedback":      "No answer provided.",
        }

    reqs = requirements or []

    comm  = score_communication(answer)["communication_score"]
    rel   = score_relevance(question, answer)["relevance_score"]
    tech  = score_technical(question, answer, job_title, reqs)["technical_score"]
    reas  = score_reasoning(answer)["reasoning_score"]

    # Weighted total — normalised so text weights sum to 1.0
    # Raw weights: comm=0.25, rel=0.25, tech=0.15, reas=0.10  → sum=0.75
    # Normalised:  comm=0.25/0.75, rel=0.25/0.75, tech=0.15/0.75, reas=0.10/0.75
    total = round(
        comm * (0.25 / 0.75) +
        rel  * (0.25 / 0.75) +
        tech * (0.15 / 0.75) +
        reas * (0.10 / 0.75),
        2
    )

    return {
        "communication": round(comm, 2),
        "relevance":     round(rel,  2),
        "technical":     round(tech, 2),
        "reasoning":     round(reas, 2),
        "total":         total,
        "feedback":      "",
    }


# ── Final Score Calculation ──────────────────────────────────────────────────

def calculate_final_score(scored_answers: list[dict], confidence_score: float = None) -> float:
    """
    Calculate the final interview score (0-100).

    If confidence_score is provided (from video analysis):
        final = text_avg * 0.69 + confidence_score * 0.31

    If not (video not yet processed):
        final = text_avg (normalised to 100)

    Args:
        scored_answers:   List of per-answer score dicts (each has 'total' 0-10).
        confidence_score: Visual confidence score 0-10 (optional).
    """
    if not scored_answers:
        return 0.0

    text_avg = sum(a["total"] for a in scored_answers) / len(scored_answers)
    text_pct = (text_avg / 10) * 100  # convert to 0-100

    if confidence_score is not None:
        conf_pct = (confidence_score / 10) * 100
        final = round(text_pct * 0.69 + conf_pct * 0.31, 2)
    else:
        final = round(text_pct, 2)

    return final
