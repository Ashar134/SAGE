# Resume Parser (rule-based)

This repository contains a lightweight Python pipeline that extracts structured resume data (JSON) from PDF resumes. It is designed for autofill/profile creation flows and works on the included sample resumes in `resumes/data/data`.

## What it extracts
- Name (handles spaced-out characters like `J O H N`)
- Emails, phones, portfolio/LinkedIn/GitHub links
- City and inferred country (from common city-country map or explicit mentions)
- Skills (rule-based vocabulary, easy to extend)
- Experiences (title/period/details from Experience sections)
- Education entries
- Summary/objective (when present)

## Quick start
```bash
python3 parse_resume.py resumes/data/data/BPO/11183737.pdf
```

Write to a JSON file:
```bash
python3 parse_resume.py resumes/data/data/BPO/11183737.pdf -o output/11183737.json
```

The pipeline relies on the system `pdftotext` command (already available here) and spaCy's small English model (`en_core_web_sm`) which is preinstalled.

## Project layout
- `parse_resume.py` — CLI entry point.
- `resume_parser/` — parsing library.
  - `text_extractor.py` — PDF -> text using `pdftotext`.
  - `normalizer.py` — cleans whitespace/artifacts.
  - `entities.py` — name/contact/location extraction (handles spaced names).
  - `city_country.py` — city->country inference (extendable via `extra_cities.json`).
  - `skills.py` — skill vocabulary + matcher.
  - `sections.py` — splits sections; extracts experience/education blocks.
  - `parser.py` — orchestrates everything and returns the JSON-ready dict.

## Extending/adjusting
- Add cities to `resume_parser/extra_cities.json` for better country inference.
- Add skills in `resume_parser/skills.py` or call `extend_skills()` at runtime.
- Improve experience parsing by enriching `SECTION_HEADINGS` or the date regex in `sections.py`.

## Notes
- If a PDF cannot be parsed, ensure `pdftotext` is installed and the file is readable.
- You can wrap `parse_resume` inside your web/API layer to feed applicant-uploaded CVs and store the resulting JSON as candidate profiles.
