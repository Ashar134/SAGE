"""
Service Layer for Automated Test Generation (RAG-based).
Provides a lean interface for the frontend/API to generate job-specific tests.
"""

import logging
from typing import Dict, Any, Optional
from .RAG_FYP.retrieval import generate_and_save_test, load_test_from_file

logger = logging.getLogger(__name__)


class TestGeneratorService:
    """Service layer for RAG-based test generation using Ollama."""
    
    def __init__(self):
        # No longer using legacy TestGenerator or ExpertiseDetector
        pass
    
    def generate_rag_test_for_job(self, job_id: str, job_title: str, 
                                   requirements: list, total_questions: int,
                                   candidate_id: Optional[str] = None) -> Dict[str, Any]:
        """
        On-demand job-specific test generation:
        1. Generate unique test via Ollama RAG based on job title + requirements
        2. Save to generated_tests/{candidate}_{job_id}.json
        3. Return the test data
        
        Distribution: 15% Analytical, 15% English, 70% Job-specific
        """
        cid = candidate_id or 'unknown'
        
        # Check if test already exists first
        existing_test = self.load_test(cid, job_id)
        if existing_test:
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"Loaded existing test for {cid} and {job_id}")
            return existing_test
            
        test_data = generate_and_save_test(
            candidate_id=cid,
            job_id=job_id,
            job_title=job_title,
            requirements=requirements,
            total_questions=total_questions,
        )
                
        return test_data

    def load_test(self, candidate_id: str, job_id: str) -> Optional[Dict[str, Any]]:
        """Load an existing test from file if available."""
        return load_test_from_file(candidate_id, job_id)
