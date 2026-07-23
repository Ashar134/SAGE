# SAGE: Smart AI-Guided Employment Platform

SAGE is an AI-driven recruitment platform designed to streamline the hiring process—from candidate onboarding and job matching to assessments, interviews, and recruitment pipeline management.

This project was developed as a Final Year Project to demonstrate how full-stack development, natural language processing, retrieval-augmented generation, and machine learning can minimize repetitive tasks in recruitment workflows.


## Overview

SAGE offers two primary interfaces:

| Portal           | Purpose                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------- |
| Candidate Portal | Enables candidates to create profiles, upload CVs, explore job opportunities, complete assessments, and track applications |
| HR Dashboard     | Assists recruiters in managing job postings, applicants, interviews, hiring stages, and recruitment analytics |

Both interfaces interact with a Django REST Framework backend that handles authentication, business logic, data management, and AI-powered functionalities.

## Key Features

### Candidate Portal

- Secure user registration, login, and profile setup
- CV parsing to extract structured candidate data
- Semantic job recommendations tailored to candidate profiles
- Job application management, saved listings, and status tracking
- AI-generated assessments specific to job roles
- Voice-enabled AI interview experience

### HR Dashboard

- Comprehensive recruitment overview and analytics
- Applicant and application tracking
- Visual representation of the hiring pipeline
- Interview scheduling and evaluation tools
- Department and job posting management
- Insights into hiring stages and performance

### AI-Assisted Capabilities

- Resume data extraction using natural language processing
- Semantic matching between candidate profiles and job descriptions
- Retrieval-augmented generation for assessments
- Evaluation of interview responses based on relevance, communication, technical depth, and reasoning
- Voice transcription and speech synthesis for interactive interviews

AI-generated evaluations are intended to assist human decision-making, not replace it.

## High-Level Architecture

```text
Candidate Portal          HR Dashboard
       \                       /
        \                     /
         Django REST API
                |
       AI and NLP Services
                |
          MySQL Database

Technology Stack

Backend

Python

Django

Django REST Framework

SimpleJWT

MySQL

Frontend

React

TypeScript and JavaScript

Vite

Tailwind CSS

Shadcn/UI and Radix UI

Recharts

AI and Machine Learning

spaCy

sentence-transformers

LangChain

Ollama

ChromaDB

Whisper

gTTS

MediaPipe

DeepFace

OpenCV

Getting Started

Prerequisites

Python 3.11 or later

Node.js 20 or later

MySQL 8 or later

Ollama for local model-based features

Backend

cd backend
python -m venv venv
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python manage.py migrate
python manage.py runserver

Ensure the virtual environment is activated before installing dependencies. Configure environment variables using the provided example configuration file.

Candidate Portal

cd frontend
npm install
npm run dev

HR Dashboard

cd hr_dashboard
npm install
npm run dev

Security and Public Repository Guidance

Before deploying or sharing the project:

Avoid committing secrets, credentials, API keys, or production URLs.

Exclude local environment files, database dumps, uploaded CVs, interview recordings, generated reports, and any personal data.

Use synthetic or placeholder data for demonstrations.

Review Git history to ensure sensitive data has not been previously committed.

Configure production settings securely by disabling debug mode and restricting access.

Rotate any credentials that may have been exposed.

Recommended .gitignore entries:

.env
.env.*
!.env.example
*.sqlite3
*.sql
media/
uploads/
recordings/
test_results.json
__pycache__/
venv/
node_modules/
dist/

Responsible Use

Recruitment platforms can significantly impact individuals and may reflect biases present in data or models. It is essential to ensure transparency, fairness, and human oversight in all evaluation processes.

Contributor

Ashar Naveed: Full-Stack Developer and AI/ML Engineer

Developed as a Final Year Project.
