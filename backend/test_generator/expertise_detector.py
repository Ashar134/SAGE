"""
Expertise Detector Module
Identifies candidate expertise based on education background
"""

import re
from typing import Optional, List
import logging

from .config import EXPERTISE_KEYWORDS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ExpertiseDetector:
    """Detects candidate expertise from education background"""
    
    def __init__(self):
        self.keywords = EXPERTISE_KEYWORDS
    
    def normalize_text(self, text: str) -> str:
        """Normalize text for keyword matching"""
        if not text:
            return ""
        return text.lower().strip()
    
    def find_keywords(self, text: str, keywords: List[str]) -> bool:
        """Check if any keyword matches in the text"""
        normalized_text = self.normalize_text(text)
        
        for keyword in keywords:
            # Use word boundary matching for better accuracy
            pattern = r'\b' + re.escape(keyword.lower()) + r'\b'
            if re.search(pattern, normalized_text, re.IGNORECASE):
                return True
        return False
    
    def detect_expertise(self, education_background: str, 
                        degree_level: Optional[str] = None) -> Optional[str]:
        """
        Detect expertise from education background
        
        Args:
            education_background: String containing degree/major information
            degree_level: Optional degree level (bachelor, master, etc.)
        
        Returns:
            Expertise type: 'physics', 'maths', 'english', 'cs', or None
        """
        if not education_background:
            logger.warning("Empty education background provided")
            return None
        
        # Check each expertise category
        for expertise, keywords in self.keywords.items():
            if self.find_keywords(education_background, keywords):
                logger.info(f"Detected expertise: {expertise} from education: {education_background}")
                return expertise
        
        logger.warning(f"Could not detect expertise from: {education_background}")
        return None
    
    def detect_from_cv_data(self, cv_data: dict) -> Optional[str]:
        """
        Detect expertise from structured CV data
        
        Expected CV data structure:
        {
            "education": [
                {"degree": "Bachelor of Science", "major": "Computer Science", ...},
                ...
            ],
            ...
        }
        """
        if not cv_data or 'education' not in cv_data:
            logger.warning("No education data found in CV")
            return None
        
        education_list = cv_data.get('education', [])
        
        # Check all education entries (prioritize higher degrees)
        # Reverse to check masters before bachelors
        for edu in reversed(education_list):
            major = edu.get('major', '') or edu.get('subject', '') or edu.get('field', '')
            degree = edu.get('degree', '') or edu.get('qualification', '')
            
            combined_text = f"{degree} {major}"
            
            expertise = self.detect_expertise(combined_text)
            if expertise:
                return expertise
        
        # Fallback: check entire education string
        education_text = str(education_list)
        return self.detect_expertise(education_text)
    
    def detect_from_multiple_degrees(self, degrees: List[str]) -> Optional[str]:
        """
        Detect expertise from multiple degree descriptions
        Returns the first match found
        """
        for degree in degrees:
            expertise = self.detect_expertise(degree)
            if expertise:
                return expertise
        return None





