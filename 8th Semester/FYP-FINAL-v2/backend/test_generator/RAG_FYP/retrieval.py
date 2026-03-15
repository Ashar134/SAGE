import json
import logging
import math
import random
import re
import time
from pathlib import Path

from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, SystemMessage

logger = logging.getLogger(__name__)

_BASE_DIR = Path(__file__).resolve().parent.parent.parent  # backend/
_GENERATED_DIR = _BASE_DIR / "generated_tests"
_GENERATED_DIR.mkdir(exist_ok=True)

_CATEGORY_FILES = {
    "analytical": [
        "Sage_Questions/Analytical/analytical_variant_questions_100plus.json",
        "Sage_Questions/Analytical/analytics1.json",
    ],
    "english": [
        "Sage_Questions/English/English_Complete_200_Questions_Final (1).json",
    ],
    "OOP": [
        "Sage_Questions/CS/OOP/OOP_Batch_1_100_Questions.json",
        "Sage_Questions/CS/OOP/OOP_Batch_2_100_Questions.json",
    ],
    "Data Structures": [
        "Sage_Questions/CS/Data Structures/DS_Complete_200_Questions_Final.json",
    ],
    "Database": [
        "Sage_Questions/CS/Database/DB_Complete_200_Questions_Final.json",
    ],
    "CN": [
        "Sage_Questions/CS/CN/CN_Complete_200_Questions.json",
    ],
    "Web-Engineering": [
        "Sage_Questions/CS/Web-Engineering/WebEngineering_Complete_200_Questions.json",
    ],
    "AI": [
        "Sage_Questions/CS/AI/AI_ML_Batch3_Complete_200_Questions (2).json",
    ],
    "ML": [
        "Sage_Questions/CS/ML/ML_Complete_200_Questions.json",
    ],
}

_cache: dict = {}


def _load_json(category: str) -> list:
    if category in _cache:
        return _cache[category]
    questions = []
    for path in _CATEGORY_FILES.get(category, []):
        try:
            with open(_BASE_DIR / path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    questions.extend(data)
        except Exception as e:
            logger.warning(f"Error reading {path}: {e}")
    _cache[category] = questions
    return questions


def _fallback_questions(category: str, count: int) -> list:
    """Return random questions from JSON fallback."""
    qs = _load_json(category)
    if not qs:
        return []
    sample = random.sample(qs, min(count, len(qs)))
    return [{
        "type": q.get("type", "medium"),
        "category": q.get("category", category),
        "question": q.get("question", ""),
        "answers": q.get("answers", {}),
        "key": q.get("key", ""),
        "justification": q.get("justification", ""),
        "justified_by": "JSON-Fallback",
        "frequency": q.get("frequency", 1),
    } for q in sample]


def _slugify(text: str) -> str:
    return re.sub(r'[^a-z0-9]+', '_', text.lower()).strip('_')


def _parse_llm_json(raw: str) -> list | None:
    """Parse LLM JSON output with recovery for truncated responses."""
    raw = raw.strip()
    if raw.startswith("```"):
        lines = raw.split("\n")
        raw = "\n".join(lines[1:-1]).strip()
    if raw.startswith("json"):
        raw = raw[4:].strip()

    def _clean_parsed(parsed_list):
        cleaned = []
        seen = set()
        for q in parsed_list:
            if not isinstance(q, dict): continue
            q_text = str(q.get("question", "")).strip().lower()
            if not q_text or q_text in seen: continue
            
            # Key validation
            key = str(q.get("key", "")).strip()
            ans = q.get("answers", {})
            if isinstance(ans, dict):
                valid_keys = {"A1", "A2", "A3", "A4"}
                if key not in valid_keys or key not in ans:
                    # Match by exact text fallback
                    match = None
                    for k, v in ans.items():
                        if str(v).strip().lower() == key.lower():
                            match = k
                            break
                    if match:
                        q["key"] = match
                    elif ans.keys():
                        q["key"] = list(ans.keys())[0]  # Ultimate fallback to ensure it is solvable
            
            seen.add(q_text)
            cleaned.append(q)
        return cleaned

    # Try direct parse
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, dict) and "questions" in parsed:
            return _clean_parsed(parsed["questions"])
        if isinstance(parsed, list):
            return _clean_parsed(parsed)
    except json.JSONDecodeError:
        pass

    # Recovery: find last complete object and close the array
    last_brace = raw.rfind("}")
    if last_brace > 0:
        truncated = raw[:last_brace + 1].rstrip().rstrip(",") + "\n]"
        try:
            parsed = json.loads(truncated)
            if isinstance(parsed, list):
                print(f" Recovered {len(parsed)} questions from truncated JSON")
                return _clean_parsed(parsed)
        except json.JSONDecodeError:
            pass

    return None


def _generate_batch(llm, count: int, category: str, description: str, context: str) -> list:
    """Generate a batch of MCQs for a specific category via Ollama. Chunks large requests to avoid timeouts."""
    MAX_CHUNK_SIZE = 8
    all_results = []
    
    chunks = []
    while count > 0:
        chunk = min(count, MAX_CHUNK_SIZE)
        chunks.append(chunk)
        count -= chunk

    for i, chunk_size in enumerate(chunks):
        sys_prompt = SystemMessage(content=(
            f"You are an expert exam setter specializing in {category}. "
            f"Generate exactly {chunk_size} professional, logically sound MCQs about {description}. "
            "CRITICAL QUALITY RULES:\n"
            "1. UNIQUE CONTENT: EVERY question MUST be 100% unique. DO NOT repeat any concept or question.\n"
            "2. ACCURACY & OPTIONS: The correct answer MUST be mathematically or factually correct and MUST precisely match one of the 4 options.\n"
            "3. LINGUISTIC CLARITY: Use clear, unambiguous English.\n"
            "Return ONLY a raw JSON array — no markdown, no backticks, no preamble."
        ))

        user_prompt = HumanMessage(content=f"""Generate {chunk_size} multiple choice questions.
Category: {category}
Topic Description: {description}

Reference context/style:
{context}

RULES FOR JSON OBJECTS:
- "question": Must be complete, solvable, and 100% UNIQUE. Do not reuse wording.
- "answers": Provide EXACTLY 4 distinct options (A1, A2, A3, A4).
- "key": You MUST output ONLY the exact key string of the correct answer (e.g., EXACTLY "A1", "A2", "A3", or "A4"). DO NOT output the text of the answer.
- "justification": Provide a brief step-by-step logical proof of the answer.

FORMAT:
[
  {{
    "type": "medium",
    "category": "{category}",
    "question": "Question text...",
    "answers": {{"A1": "...", "A2": "...", "A3": "...", "A4": "..."}},
    "key": "A1",
    "justification": "Explanation...",
    "justified_by": "RAG-Source",
    "frequency": 1
  }}
]

Return ONLY the JSON array.""")

        try:
            start = time.time()
            response = llm.invoke([sys_prompt, user_prompt])
            elapsed = time.time() - start
            print(f"    {category} (Chunk {i+1}/{len(chunks)} for {chunk_size} qs): Ollama responded in {elapsed:.1f}s")

            parsed = _parse_llm_json(response.content)
            if parsed:
                all_results.extend(parsed[:chunk_size])
        except Exception as e:
            logger.error(f"LLM batch error for {category} (Chunk {i+1}): {e}")
            print(f"LLM batch error for {category}: {e}")
            break # If one chunk fails completely due to connection error, stop and let fallback handle the rest

    return all_results


# ── Main Functions ──────────────────────────────────────────────────

def get_test_filepath(candidate_id: str, job_id: str) -> Path:
    slug = _slugify(f"{candidate_id}_{job_id}")
    return _GENERATED_DIR / f"{slug}.json"


def generate_and_save_test(
    candidate_id: str,
    job_id: str,
    job_title: str,
    requirements: list,
    total_questions: int,
) -> dict:
    """
    Generate a unique test in 3 separate LLM calls (one per section).
    Distribution: 15% Analytical, 15% English, 70% Job-specific.
    """
    filepath = get_test_filepath(candidate_id, job_id)

    n_analytical = max(1, math.ceil(total_questions * 0.15))
    n_english = max(1, math.ceil(total_questions * 0.15))
    n_job_specific = total_questions - n_analytical - n_english

    requirements_text = ", ".join(requirements) if requirements else job_title
    print(f" Generating {total_questions} questions for '{job_title}' "
          f"(analytical={n_analytical}, english={n_english}, job-specific={n_job_specific})")
    print(f"   Requirements: {requirements_text}")

    # Initialize Ollama
    llm = None
    try:
        llm = ChatOllama(
            model="llama3.2",
            temperature=0.7, 
            base_url="http://localhost:11434",
        )
    except Exception as e:
        logger.error(f"Ollama init failed: {e}")
        print(f"Ollama unavailable")

    all_questions = []

    # ── Section 1: Analytical ────────────────────────────────────
    print(f"  Section 1: {n_analytical} Analytical questions")
    anal_context = "\n".join([
        f"  {q.get('question','')[:80]}"
        for q in random.sample(_load_json("analytical") or [{}], min(3, len(_load_json("analytical") or [{}])))
    ])

    if llm:
        batch = _generate_batch(llm, n_analytical, "analytical",
                                "analytical reasoning, logic, math patterns, and sequences",
                                anal_context)
        all_questions.extend(batch)
        print(f"   Got {len(batch)}/{n_analytical} analytical questions")

    if len([q for q in all_questions if q.get('category') == 'analytical']) < n_analytical:
        deficit = n_analytical - len([q for q in all_questions if q.get('category') == 'analytical'])
        print(f"    Filling {deficit} analytical from fallback")
        all_questions.extend(_fallback_questions("analytical", deficit))

    # ── Section 2: English ────────────────────────────────────
    print(f"  Section 2: {n_english} English questions")
    eng_context = "\n".join([
        f"  {q.get('question','')[:80]}"
        for q in random.sample(_load_json("english") or [{}], min(3, len(_load_json("english") or [{}])))
    ])

    if llm:
        batch = _generate_batch(llm, n_english, "english",
                                "English vocabulary, grammar, analogies, synonyms, antonyms, and sentence completion",
                                eng_context)
        all_questions.extend(batch)
        print(f"     Got {len(batch)}/{n_english} english questions")

    if len([q for q in all_questions if q.get('category') == 'english']) < n_english:
        deficit = n_english - len([q for q in all_questions if q.get('category') == 'english'])
        print(f"     Filling {deficit} english from fallback")
        all_questions.extend(_fallback_questions("english", deficit))

    # ── Section 3: Job-Specific ────────────────────────────────
    print(f"   Section 3: {n_job_specific} {job_title} questions")
    # Get context from all CS categories
    job_context_lines = []
    for cat in _CATEGORY_FILES:
        if cat not in ("analytical", "english"):
            qs = _load_json(cat)
            if qs:
                for q in random.sample(qs, min(1, len(qs))):
                    job_context_lines.append(f"  [{cat}] {q.get('question','')[:80]}")
    job_context = "\n".join(job_context_lines[:10])

    if llm:
        batch = _generate_batch(llm, n_job_specific, job_title,
                                f"{job_title} role focusing on: {requirements_text}",
                                job_context)
        all_questions.extend(batch)
        print(f"    Got {len(batch)}/{n_job_specific} {job_title} questions")

    # Fill any remaining deficit from CS categories
    total_so_far = len(all_questions)
    if total_so_far < total_questions:
        deficit = total_questions - total_so_far
        print(f"    Filling {deficit} from CS fallback")
        for cat in _CATEGORY_FILES:
            if cat not in ("analytical", "english") and deficit > 0:
                fb = _fallback_questions(cat, min(deficit, 3))
                all_questions.extend(fb)
                deficit -= len(fb)

    # Build test document
    test_data = {
        "candidate_id": candidate_id,
        "job_id": job_id,
        "job_title": job_title,
        "requirements": requirements,
        "total_questions": len(all_questions[:total_questions]),
        "distribution": {
            "analytical": n_analytical,
            "english": n_english,
            "job_specific": n_job_specific
        },
        "questions": all_questions[:total_questions],
        "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "source": "RAG-Ollama"
    }

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(test_data, f, indent=4, ensure_ascii=False)

    print(f" Test saved to: {filepath}")
    return test_data


def load_test_from_file(candidate_id: str, job_id: str) -> dict | None:
    filepath = get_test_filepath(candidate_id, job_id)
    if filepath.exists():
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    return None