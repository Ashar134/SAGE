# 📦 Requirements.txt — Dependency Report
**Project:** Final Year Project — Django Backend  
**File:** `backend/requirements.txt`  
**Report Generated:** 2026-04-25  

---

## Overview

| Category | Count |
|---|---|
| Total packages in requirements.txt | 20 |
| ✅ Already installed (pre-session) | 17 |
| ❌ Missing (installed this session) | 3 |
| ⚠️ Version mismatches detected | 8 |

---

## 1. Installation Status

All packages are now installed. The 3 that were missing have been resolved:

| Package | Required | Was Installed? | Installed Version |
|---|---|---|---|
| `openai-whisper` | (unpinned) | ❌ No | `20250625` |
| `mediapipe` | (unpinned) | ❌ No | `0.10.33` |
| `deepface` | (unpinned) | ❌ No | `0.0.99` |

---

## 2. Full Package Breakdown

### 🌐 Django & REST Framework

| Package | Required | Installed | Status |
|---|---|---|---|
| `Django` | `5.2.4` | `4.2.29` | ⚠️ Version mismatch (older) |
| `djangorestframework` | `3.16.0` | `3.16.1` | ✅ Compatible (patch ahead) |
| `django-cors-headers` | `4.7.0` | `4.9.0` | ✅ Compatible (minor ahead) |
| `djangorestframework-simplejwt` | `5.5.0` | `5.5.1` | ✅ Compatible (patch ahead) |

> [!WARNING]
> **Django version mismatch is critical.** The `requirements.txt` specifies `Django==5.2.4` but `4.2.29` is installed. This is a **major version difference** — Django 4.x and 5.x have breaking changes. Your project may have been developed and tested against 4.x. Updating to 5.2.4 could break things or vice versa. You should align the `requirements.txt` to what is actually running, or upgrade the environment deliberately.

---

### 🗄️ Database

| Package | Required | Installed | Status |
|---|---|---|---|
| `mysqlclient` | `2.2.7` | `2.2.7` | ✅ Exact match |

---

### 📄 CV Parser

| Package | Required | Installed | Status |
|---|---|---|---|
| `spacy` | `3.8.7` | `3.8.9` | ✅ Compatible (patch ahead) |
| `pycountry` | `24.6.1` | `24.6.1` | ✅ Exact match |
| `pypdf` | `5.8.0` | `6.7.5` | ⚠️ Version mismatch (major ahead) |

> [!NOTE]
> `pypdf 6.x` introduced some API changes from `5.x`. If your CV parser code uses older `pypdf` APIs, it may throw deprecation warnings or errors. Test your PDF extraction pipeline.

---

### 🤖 ML / Embeddings / Recommendations

| Package | Required | Installed | Status |
|---|---|---|---|
| `sentence-transformers` | `3.4.1` | `5.2.3` | ⚠️ Version mismatch (major ahead) |
| `nltk` | `3.9.1` | `3.9.2` | ✅ Compatible (patch ahead) |

> [!NOTE]
> `sentence-transformers 5.x` had major API reorganization from `3.x`. The `SentenceTransformer` class interface is mostly backward compatible, but some utility functions and model loading behaviors may differ. Test your embedding pipeline.

---

### 🧠 RAG / LLM (Test Generator)

| Package | Required | Installed | Status |
|---|---|---|---|
| `langchain-ollama` | `0.3.3` | `1.0.1` | ⚠️ Version mismatch (major ahead) |
| `langchain-core` | `0.3.65` | `1.2.17` | ⚠️ Version mismatch (major ahead) |
| `langchain-community` | `0.3.24` | `0.4.1` | ⚠️ Version mismatch (minor ahead) |
| `langchain-huggingface` | `0.1.2` | `1.2.1` | ⚠️ Version mismatch (major ahead) |
| `langchain-chroma` | `0.2.4` | `1.1.0` | ⚠️ Version mismatch (major ahead) |
| `chromadb` | `>=1.0.9` | `1.5.4` | ✅ Satisfies constraint |

> [!WARNING]
> The entire **LangChain stack is significantly ahead** of what `requirements.txt` specifies. LangChain 1.x has numerous breaking API changes from 0.3.x — particularly in how chains, retrievers, and prompts are constructed. If your RAG/Test Generator was built against 0.3.x, it **will likely have compatibility issues** with the currently installed 1.x versions.  
> **Recommendation:** Either pin your requirements to the installed 1.x versions, or test thoroughly for `LangChainDeprecationWarning` messages.

---

### 🛠️ Utilities

| Package | Required | Installed | Status |
|---|---|---|---|
| `Pillow` | `11.2.1` | `11.2.1` | ✅ Exact match |
| `python-dotenv` | `1.1.0` | `1.2.1` | ✅ Compatible (minor ahead) |

---

### 🎙️ Interview Bot

| Package | Required | Installed | Status |
|---|---|---|---|
| `gTTS` | `2.5.3` | `2.5.4` | ✅ Compatible (patch ahead) |
| `openai-whisper` | (unpinned) | `20250625` | ✅ Installed (this session) |

---

### 👁️ Visual Confidence Analysis

| Package | Required | Installed | Status |
|---|---|---|---|
| `mediapipe` | (unpinned) | `0.10.33` | ✅ Installed (this session) |
| `deepface` | (unpinned) | `0.0.99` | ✅ Installed (this session) |
| `opencv-python` | (unpinned) | `4.13.0.92` | ✅ Already installed |
| `textstat` | (unpinned) | `0.7.13` | ✅ Already installed |

> [!NOTE]
> `deepface` pulled in a large dependency tree including **TensorFlow 2.21.0** (~351 MB), Keras 3.14, MTCNN, and RetinaFace. These are used for face recognition and emotion detection. Expect ~1 GB total additional disk space used.

---

## 3. Heavy Dependencies Pulled In (Side Effects)

The newly installed packages brought in these large indirect dependencies:

| Dependency | Size | Why |
|---|---|---|
| `tensorflow` 2.21.0 | ~351 MB | Required by `deepface` |
| `keras` 3.14.0 | ~1.6 MB | Required by `deepface` / `tensorflow` |
| `llvmlite` 0.47.0 | ~38 MB | Required by `numba` → `openai-whisper` |
| `numba` 0.65.1 | ~2.8 MB | Required by `openai-whisper` |
| `tiktoken` 0.12.0 | ~879 KB | Required by `openai-whisper` |
| `mtcnn` 1.0.0 | ~1.9 MB | Required by `deepface` (face detector) |

---

## 4. Recommendations

### 🔴 Critical
1. **Resolve Django version mismatch** — `requirements.txt` says `5.2.4`, but `4.2.29` is installed. Pick one and align both the file and the environment.

### 🟡 Important
2. **Audit LangChain usage** — The entire LangChain stack is 1+ major versions ahead of what was specified. Run and test the test-generator and RAG pipeline thoroughly.
3. **Pin unpinned packages** — `openai-whisper`, `mediapipe`, `deepface`, `opencv-python`, and `textstat` have no version pins in `requirements.txt`. This makes builds non-reproducible.

### 🟢 Suggested
4. **Update `requirements.txt`** to reflect the actual installed versions for reproducibility:
```
# Suggested pins for currently unpinned packages
openai-whisper==20250625
mediapipe==0.10.33
deepface==0.0.99
opencv-python==4.13.0.92
textstat==0.7.13
```
5. **Consider using a virtual environment** (`.venv`) scoped to this project to prevent system-wide conflicts.

---

## 5. Module → Feature Mapping

```
backend/
├── CV-Parser/          → spacy, pycountry, pypdf
├── Sage_Questions/     → langchain-*, chromadb (RAG pipeline)
├── test_generator/     → langchain-*, chromadb, sentence-transformers
├── interview/          → gTTS, openai-whisper, mediapipe, deepface, opencv-python
└── myapi/              → Django, DRF, simplejwt, mysqlclient
```
