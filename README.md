<div align="center">

# 🧠SAGE | AI-Powered Autonomous Recruitment Intelligence Platform
### *An end-to-end, AI-powered recruitment ecosystem for the modern hiring era*

[![Django](https://img.shields.io/badge/Django-5.2-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![LangChain](https://img.shields.io/badge/LangChain-RAG-1C3C3C?style=for-the-badge&logo=chainlink&logoColor=white)](https://langchain.com/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

<br/>

>  **Final Year Project** — A full-stack intelligent hiring platform that automates CV parsing, AI test generation, real-time interview scoring, and HR pipeline management — powered by LLMs, NLP, and computer vision.

</div>

---

## Table of Contents

- [Overview](#-overview)
- [Architecture](#️-architecture)
- [Key Features](#-key-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#️-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup-candidate-portal)
  - [HR Dashboard Setup](#hr-dashboard-setup)
- [API Overview](#-api-overview)
- [AI & ML Modules](#-ai--ml-modules)
- [Database Schema](#️-database-schema)
- [Testing](#-testing)
- [Contributors](#-contributors)

---

## Overview

**SAGE** is a production-grade, AI-driven recruitment platform built as a Final Year Project. It digitises and automates the entire hiring pipeline — from a candidate's first visit, through CV parsing and skill matching, automated test generation, live AI-powered interviews, and finally HR pipeline management via a dedicated analytics dashboard.

The system serves **two distinct user types**:

| Portal | Audience | Technology |
|---|---|---|
| **Candidate Portal** | Job seekers applying for roles | React + TypeScript + Vite |
| **HR Dashboard** | Recruiters managing the pipeline | React + JSX + Shadcn/UI |
| **Backend API** | Shared services & AI engine | Django REST Framework |

---

## Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│                           SAGE Platform                               │
│                                                                       │
│  ┌─────────────────────┐        ┌─────────────────────────────────┐  │
│  │   Candidate Portal  │        │         HR Dashboard            │  │
│  │  React + TypeScript │        │   React + Shadcn/UI + Recharts  │  │
│  │   (Port 5173)       │        │         (Port 5174)             │  │
│  └────────┬────────────┘        └───────────────┬─────────────────┘  │
│           │                                     │                    │
│           └─────────────┬───────────────────────┘                    │
│                         │  REST API (JWT Auth)                        │
│                         ▼                                             │
│         ┌───────────────────────────────┐                            │
│         │    Django REST Framework      │                            │
│         │         (Port 8000)           │                            │
│         │                               │                            │
│         │  ┌──────────┐ ┌────────────┐  │                            │
│         │  │  CV/NLP  │ │  RAG / LLM │  │                            │
│         │  │  Parser  │ │  (Ollama)  │  │                            │
│         │  └──────────┘ └────────────┘  │                            │
│         │  ┌──────────┐ ┌────────────┐  │                            │
│         │  │Interview │ │  Sentence  │  │                            │
│         │  │  Bot AI  │ │ Embeddings │  │                            │
│         │  └──────────┘ └────────────┘  │                            │
│         │  ┌──────────┐ ┌────────────┐  │                            │
│         │  │MediaPipe │ │  DeepFace  │  │                            │
│         │  │Confidence│ │  Emotion   │  │                            │
│         │  └──────────┘ └────────────┘  │                            │
│         └───────────────────────────────┘                            │
│                         │                                             │
│                         ▼                                             │
│              ┌────────────────────┐                                   │
│              │   MySQL Database   │                                   │
│              └────────────────────┘                                   │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Key Features

### Candidate Portal

- **Auth & Onboarding** — Secure JWT-based authentication with CV-driven profile onboarding
- **Smart CV Parser** — Upload a PDF resume and have skills, experience, and education auto-extracted using spaCy NLP
- **AI-Powered Job Matching** — Semantic similarity matching between candidate profiles and job descriptions using `sentence-transformers`
- **Job Applications** — Apply to jobs and track status through a live application timeline
- **AI-Generated Tests** — Sit auto-generated assessments built from job descriptions using RAG (LangChain + Ollama)
- **AI Interview Bot** — Live voice-based interview with gTTS speech synthesis and OpenAI Whisper transcription
- **Saved Jobs & Profile Management** — Bookmark jobs, manage resume, skills, education, and experience

### HR Dashboard

- **Recruitment Analytics** — Charts and KPIs covering applications, interviews, and offer rates (Recharts)
- **Applicants Management** — Full applicant table with status filters and pipeline views
- **Kanban Board** — Drag-and-drop style visual hiring pipeline
- **Interview Management** — Schedule and review interview outcomes with AI confidence scores
- **Department & Job Postings** — Manage departments, create and publish job listings
- **Pipeline Insights** — Deep-dive analytics into each hiring stage

### AI Engine

- **Confidence Scoring** — MediaPipe + DeepFace analyze facial expressions and body language during video interviews
- **Answer Relevance** — Sentence-level semantic scoring of interview answers against expected topics
- **Communication Quality** — Textstat-powered readability and fluency analysis
- **Technical Depth** — Keyword and concept density scoring for technical roles
- **Reasoning & Logic** — Structured reasoning assessment in candidate responses

---

## 🛠️ Tech Stack

### Backend

| Technology | Role |
|---|---|
| **Django 5.2** | Web framework & ORM |
| **Django REST Framework** | RESTful API layer |
| **SimpleJWT** | JWT authentication |
| **MySQL** | Primary relational database |
| **spaCy** | CV/Resume NLP parsing |
| **sentence-transformers** | Semantic job-matching embeddings |
| **LangChain + Ollama** | RAG pipeline for test generation |
| **ChromaDB** | Vector store for RAG |
| **gTTS + Whisper** | Interview voice I/O |
| **MediaPipe + DeepFace** | Visual confidence analysis |
| **OpenCV** | Video frame processing |
| **textstat** | Communication quality scoring |

### Frontend — Candidate Portal

| Technology | Role |
|---|---|
| **React 19 + TypeScript** | UI framework |
| **Vite 7** | Build tool |
| **React Router v7** | Client-side routing |
| **Framer Motion** | Animations |
| **Axios** | API communication |
| **Leaflet / React-Leaflet** | Interactive maps |
| **Tailwind CSS 4** | Utility styling |

### Frontend — HR Dashboard

| Technology | Role |
|---|---|
| **React 19 + JSX** | UI framework |
| **Vite 7** | Build tool |
| **Shadcn/UI + Radix UI** | Component library |
| **Recharts** | Analytics charts |
| **Framer Motion** | Animations |
| **Tailwind CSS 3** | Utility styling |
| **Lucide React** | Icons |

---

## 📁 Project Structure

```
Final-Year-Project/
│
├── 📂 backend/                      # Django REST API
│   ├── 📂 myapi/                    # Core API app
│   │   ├── models.py                # Database models (User, Job, Application…)
│   │   ├── serializers.py           # DRF serializers
│   │   ├── views.py                 # API view logic
│   │   └── urls.py                  # API routes
│   ├── 📂 interview/                # AI Interview scoring engine
│   │   ├── communication.py         # Fluency & communication scoring
│   │   ├── confidence.py            # MediaPipe + DeepFace visual scoring
│   │   ├── relevance.py             # Semantic answer relevance
│   │   ├── technical.py             # Technical depth analysis
│   │   └── reasoning.py             # Logic & reasoning scoring
│   ├── 📂 CV-Parser/                # Resume PDF parser (spaCy)
│   ├── 📂 test_generator/           # RAG-based test question generator
│   │   └── RAG_FYP/                 # LangChain + ChromaDB + Ollama pipeline
│   ├── 📂 Sage_Questions/           # Question bank management
│   └── requirements.txt
│
├── 📂 frontend/                     # Candidate-facing React app (TypeScript)
│   └── src/
│       ├── 📂 components/
│       │   ├── Auth/                # Login / registration
│       │   ├── MainLayout/          # Home, Jobs, Applications, Profile
│       │   ├── TestPageLayout/      # AI-generated test interface
│       │   ├── InterviewPageLayout/ # Voice interview UI
│       │   └── Onboarding/          # CV-driven profile setup
│       ├── 📂 contexts/             # Auth & SavedJobs context providers
│       └── 📂 utils/                # Helper utilities
│
├── 📂 hr_dashboard/                 # HR-facing React app (JSX + Shadcn)
│   └── src/
│       ├── 📂 components/dashboard/ # Reusable dashboard widgets
│       └── 📂 pages/
│           ├── Dashboard.jsx        # KPI overview
│           ├── Applicants.jsx       # Applicant management
│           ├── Interviews.jsx       # Interview tracking
│           ├── JobPostings.jsx      # Job listing management
│           ├── Kanban.jsx           # Visual hiring pipeline
│           ├── Departments.jsx      # Department management
│           ├── Analytics.jsx        # Recruitment analytics
│           └── PipelineInsights.jsx # Stage-by-stage funnel
│
├── sage_db.sql                      # MySQL database dump
└── test_results.json                # Automated test results
```

---

## Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Python | >= 3.11 |
| Node.js | >= 20.x |
| MySQL | >= 8.0 |
| Ollama | Latest (for LLM test generation) |

>  **Ollama must be running** with the required model pulled before starting the backend if you intend to use test generation.

---

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# 3. Install all Python dependencies
pip install -r requirements.txt

# 4. Download spaCy language model
python -m spacy download en_core_web_sm

# 5. Configure environment variables
cp .env.example .env           # then fill in your values

# 6. Import the database
mysql -u root -p < ../sage_db.sql

# 7. Apply Django migrations
python manage.py migrate

# 8. Start the development server
python manage.py runserver
```

> API available at **http://localhost:8000**

---

### Frontend Setup (Candidate Portal)

```bash
cd frontend
npm install
npm run dev
```

> Candidate portal available at **http://localhost:5173**

---

### HR Dashboard Setup

```bash
cd hr_dashboard
npm install
npm run dev
```

> HR dashboard available at **http://localhost:5174**

---

## 📡 API Overview

All endpoints are prefixed with `/api/`. Authentication uses **JWT Bearer tokens**.

| Category | Endpoint | Description |
|---|---|---|
| **Auth** | `POST /api/auth/register/` | Register new user |
| **Auth** | `POST /api/auth/login/` | Login & obtain JWT |
| **Profile** | `GET/PUT /api/profile/` | View & update profile |
| **CV** | `POST /api/cv/parse/` | Parse uploaded CV |
| **Jobs** | `GET /api/jobs/` | List all active jobs |
| **Jobs** | `GET /api/jobs/recommended/` | AI-matched job recommendations |
| **Applications** | `POST /api/applications/` | Submit a job application |
| **Applications** | `GET /api/applications/` | List user applications |
| **Tests** | `GET /api/test/{job_id}/` | Fetch AI-generated test |
| **Tests** | `POST /api/test/submit/` | Submit test answers |
| **Interview** | `POST /api/interview/start/` | Start AI interview session |
| **Interview** | `POST /api/interview/score/` | Score interview response |
| **HR** | `GET /api/hr/applicants/` | List all applicants (HR) |
| **HR** | `GET /api/hr/analytics/` | Recruitment analytics data |
| **HR** | `PUT /api/hr/applications/{id}/status/` | Update applicant status |

---

## 🤖 AI & ML Modules

### 📄 CV Parser (`backend/CV-Parser/`)

Uses **spaCy** and **pycountry** to extract structured data from PDF resumes:
- Personal information (name, email, phone, address)
- Skills with type classification (language, framework, tool, soft skill)
- Education history (degree, institution, GPA)
- Work experience (title, company, dates, responsibilities)
- Projects, certifications, and publications

### 🧪 Test Generator (`backend/test_generator/`)

A **RAG (Retrieval-Augmented Generation)** pipeline powered by:
- **LangChain** for pipeline orchestration
- **Ollama** for local LLM inference
- **ChromaDB** as the vector store
- **HuggingFace Embeddings** for document vectorisation

Generates role-specific MCQ assessments from job descriptions.

### 🎤 Interview Bot (`backend/interview/`)

A multi-dimensional AI scoring system evaluating candidates across 5 axes:

```
Interview Score = weighted average of:
  ├── 🗣️  Communication  — fluency, readability, coherence
  ├── 🎯  Relevance      — semantic match to expected answer
  ├── 💡  Technical      — concept depth & keyword density
  ├── 🧩  Reasoning      — logical structure & argument quality
  └── 😐  Confidence     — MediaPipe pose + DeepFace emotion analysis
```

### 🔍 Job Matcher

`sentence-transformers` generates embeddings for both job descriptions and candidate profiles. Cosine similarity ranks the best-fit jobs for each user.

---

*Django · React · spaCy · LangChain · MediaPipe · DeepFace · sentence-transformers*

</div>
