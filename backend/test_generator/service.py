"""
Service Layer for Test Generator
Provides API-like interface for integration with main project
"""

import logging
from typing import Dict, Any, Optional, List
from pathlib import Path

from .test_generator import TestGenerator
from .expertise_detector import ExpertiseDetector
from .config import TEST_COMPOSITIONS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TestGeneratorService:
    """Service layer for test generation"""
    
    def __init__(self, base_dir: Optional[Path] = None):
        self.generator = TestGenerator(base_dir)
        self.expertise_detector = ExpertiseDetector()
    
    def generate_test_for_candidate(self, candidate_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate test for a candidate based on their CV/education data
        
        Args:
            candidate_data: Dictionary containing candidate information
                Expected keys:
                - 'education': List of education entries or string
                - 'cv_data': Optional structured CV data
                - 'candidate_id': Optional candidate identifier
                - 'random_seed': Optional seed for reproducibility
        
        Returns:
            Dictionary with test data:
            {
                'candidate_id': str,
                'expertise': str,
                'questions': List[Dict],
                'total_questions': int,
                'test_id': str (can be generated)
            }
        """
        candidate_id = candidate_data.get('candidate_id', 'unknown')
        random_seed = candidate_data.get('random_seed')
        
        # Detect expertise
        expertise = None
        
        # Try structured CV data first
        if 'cv_data' in candidate_data:
            expertise = self.expertise_detector.detect_from_cv_data(candidate_data['cv_data'])
        
        # Fallback to education field
        if not expertise and 'education' in candidate_data:
            education = candidate_data['education']
            if isinstance(education, str):
                expertise = self.expertise_detector.detect_expertise(education)
            elif isinstance(education, list):
                # Try to extract text from education list
                education_text = str(education)
                expertise = self.expertise_detector.detect_expertise(education_text)
        
        if not expertise:
            raise ValueError(f"Could not detect expertise for candidate {candidate_id}")
        
        # Generate test
        questions = self.generator.generate_test(expertise, random_seed)
        
        return {
            'candidate_id': candidate_id,
            'expertise': expertise,
            'questions': questions,
            'total_questions': len(questions),
            'test_composition': TEST_COMPOSITIONS.get(expertise, {})
        }
    
    def generate_test_by_expertise(self, expertise: str, 
                                   candidate_id: Optional[str] = None,
                                   random_seed: Optional[int] = None) -> Dict[str, Any]:
        """
        Generate test directly by expertise type
        
        Args:
            expertise: One of 'physics', 'maths', 'english', 'cs'
            candidate_id: Optional candidate identifier
            random_seed: Optional seed for reproducibility
        
        Returns:
            Dictionary with test data
        """
        if expertise not in TEST_COMPOSITIONS:
            raise ValueError(f"Invalid expertise: {expertise}. Must be one of: {list(TEST_COMPOSITIONS.keys())}")
        
        questions = self.generator.generate_test(expertise, random_seed)
        
        return {
            'candidate_id': candidate_id or 'unknown',
            'expertise': expertise,
            'questions': questions,
            'total_questions': len(questions),
            'test_composition': TEST_COMPOSITIONS[expertise]
        }
    
    def detect_expertise(self, education_data: Any) -> Optional[str]:
        """
        Detect expertise from education data
        
        Args:
            education_data: String or dictionary containing education information
        
        Returns:
            Detected expertise or None
        """
        if isinstance(education_data, str):
            return self.expertise_detector.detect_expertise(education_data)
        elif isinstance(education_data, dict):
            return self.expertise_detector.detect_from_cv_data(education_data)
        else:
            return self.expertise_detector.detect_expertise(str(education_data))
    
    def get_test_composition(self, expertise: str) -> Dict[str, int]:
        """Get test composition for a given expertise"""
        return TEST_COMPOSITIONS.get(expertise, {})
    
    def validate_question_bank(self) -> Dict[str, Any]:
        """
        Validate that question bank has enough questions for all expertise types
        
        Returns:
            Dictionary with validation results
        """
        from .question_parser import QuestionParser
        from .config import QUESTION_FILES, CS_DISTRIBUTION
        
        parser = QuestionParser(self.generator.base_dir)
        validation_results = {}
        
        for expertise, composition in TEST_COMPOSITIONS.items():
            result = {
                'expertise': expertise,
                'composition': composition,
                'sufficient_questions': True,
                'category_counts': {}
            }
            
            for category, required_count in composition.items():
                if category == 'cs':
                    # Check CS subcategories
                    total_available = 0
                    for subcategory, sub_count in CS_DISTRIBUTION.items():
                        cs_files = QUESTION_FILES.get('cs', {}).get(subcategory, [])
                        questions = parser.get_all_questions_from_files(cs_files)
                        available = len(questions)
                        total_available += available
                        result['category_counts'][subcategory] = {
                            'required': sub_count,
                            'available': available,
                            'sufficient': available >= sub_count
                        }
                    result['category_counts']['cs_total'] = {
                        'required': sum(CS_DISTRIBUTION.values()),
                        'available': total_available,
                        'sufficient': total_available >= sum(CS_DISTRIBUTION.values())
                    }
                else:
                    files = QUESTION_FILES.get(category, [])
                    questions = parser.get_all_questions_from_files(files)
                    available = len(questions)
                    result['category_counts'][category] = {
                        'required': required_count,
                        'available': available,
                        'sufficient': available >= required_count
                    }
                    if available < required_count:
                        result['sufficient_questions'] = False
            
            validation_results[expertise] = result
        
        return validation_results





