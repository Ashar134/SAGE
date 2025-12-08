"""
Configuration file for test generator
Defines test compositions based on candidate expertise
"""

import os
from pathlib import Path

# Base directory for question bank
BASE_DIR = Path(__file__).parent.parent
QUESTIONS_DIR = BASE_DIR / "Sage_Questions"

# Test compositions (total = 100 MCQs per test)
TEST_COMPOSITIONS = {
    "physics": {
        "analytical": 30,
        "english": 20,
        "physics": 40,
        "maths": 10
    },
    "maths": {
        "analytical": 30,
        "english": 20,
        "maths": 40,
        "physics": 10
    },
    "english": {
        "analytical": 40,
        "english": 60
    },
    "cs": {
        "analytical": 20,
        "english": 10,
        "cs": 70  # Will be distributed across CS subcategories
    }
}

# Question file mappings
QUESTION_FILES = {
    "analytical": [
        "Sage_Questions/Analytical/analytical_variant_questions_100plus.json",
        "Sage_Questions/Analytical/analytics1.json"
    ],
    "english": [
        "Sage_Questions/English/English_Complete_200_Questions_Final (1).json"
    ],
    "physics": [
        "Sage_Questions/Physics/NUST_NET_Physics_MCQs_Full_Answers.json"
    ],
    "maths": [
        "Sage_Questions/Maths/Advanced_Mathematics_CLEAN_FINAL_200.json",
        "Sage_Questions/Maths/NET_Maths_Past_Papers_Complete.json"
    ],
    "cs": {
        "OOP": [
            "Sage_Questions/CS/OOP/OOP_Batch_1_100_Questions.json",
            "Sage_Questions/CS/OOP/OOP_Batch_2_100_Questions.json"
        ],
        "Data Structures": [
            "Sage_Questions/CS/Data Structures/DS_Complete_200_Questions_Final.json"
        ],
        "Database": [
            "Sage_Questions/CS/Database/DB_Complete_200_Questions_Final.json"
        ],
        "CN": [
            "Sage_Questions/CS/CN/CN_Complete_200_Questions.json"
        ],
        "Web-Engineering": [
            "Sage_Questions/CS/Web-Engineering/WebEngineering_Complete_200_Questions.json"
        ],
        "AI": [
            "Sage_Questions/CS/AI/AI_ML_Batch3_Complete_200_Questions (2).json"
        ],
        "ML": [
            "Sage_Questions/CS/ML/ML_Complete_200_Questions.json"
        ]
    }
}

# CS question distribution for CS tests (total = 70)
CS_DISTRIBUTION = {
    "OOP": 15,
    "Data Structures": 12,
    "Database": 10,
    "CN": 10,
    "Web-Engineering": 10,
    "AI": 8,
    "ML": 5
}

# Keywords to identify expertise from education
EXPERTISE_KEYWORDS = {
    "physics": ["physics", "physical sciences", "applied physics", "theoretical physics"],
    "maths": ["mathematics", "math", "applied mathematics", "pure mathematics", "statistics"],
    "english": ["english", "literature", "linguistics", "language"],
    "cs": [
        "computer science", "cs", "software engineering", "se",
        "information technology", "it", "cyber security", "cybersecurity",
        "artificial intelligence", "ai", "machine learning", "ml",
        "data science", "computer engineering", "ce",
        "information systems", "is", "software", "programming"
    ]
}



