"""
Question Parser Module
Handles parsing of different JSON question file formats
"""

import json
from pathlib import Path
from typing import List, Dict, Any, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class QuestionParser:
    """Parses questions from JSON files supporting multiple formats"""
    
    def __init__(self, base_dir: Optional[Path] = None):
        if base_dir is None:
            base_dir = Path(__file__).parent.parent
        self.base_dir = base_dir
    
    def load_json_file(self, file_path: str) -> Any:
        """Load JSON file and return parsed data"""
        full_path = self.base_dir / file_path
        
        if not full_path.exists():
            logger.error(f"File not found: {full_path}")
            return None
        
        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing JSON file {full_path}: {e}")
            return None
        except Exception as e:
            logger.error(f"Error loading file {full_path}: {e}")
            return None
    
    def extract_questions(self, data: Any, source_file: str) -> List[Dict[str, Any]]:
        """
        Extract all questions from parsed JSON data
        Handles 3 formats:
        1. Simple array format: [{question1}, {question2}, ...]
        2. Scenario format: {"scenarios": [{"questions": [...]}]}
        3. Questions object: {"questions": [...]}
        """
        questions = []
        
        if data is None:
            return questions
        
        # Format 1: Simple array
        if isinstance(data, list):
            for idx, q in enumerate(data):
                q_copy = q.copy()
                q_copy['_file_position'] = idx
                q_copy['_file_format'] = 'array'
                questions.append(q_copy)
        
        # Format 2: Scenario-based format
        elif isinstance(data, dict):
            if 'scenarios' in data:
                global_idx = 0
                for scenario_idx, scenario in enumerate(data.get('scenarios', [])):
                    scenario_questions = scenario.get('questions', [])
                    # Add scenario context to each question
                    for q_idx, q in enumerate(scenario_questions):
                        q_copy = q.copy()
                        q_copy['scenario_id'] = scenario.get('id')
                        q_copy['scenario_title'] = scenario.get('title')
                        q_copy['scenario_description'] = scenario.get('description')
                        q_copy['_file_position'] = global_idx
                        q_copy['_file_format'] = 'scenario'
                        q_copy['_scenario_index'] = scenario_idx
                        q_copy['_question_index_in_scenario'] = q_idx
                        questions.append(q_copy)
                        global_idx += 1
            
            # Format 3: Questions object format
            elif 'questions' in data:
                for idx, q in enumerate(data.get('questions', [])):
                    q_copy = q.copy()
                    q_copy['_file_position'] = idx
                    q_copy['_file_format'] = 'questions_object'
                    questions.append(q_copy)
        
        # Add source file information to each question
        for q in questions:
            if 'source_file' not in q:
                q['source_file'] = source_file
            # Ensure frequency field exists
            if 'frequency' not in q:
                q['frequency'] = 0
        
        return questions
    
    def get_all_questions_from_file(self, file_path: str) -> List[Dict[str, Any]]:
        """Load and extract all questions from a JSON file"""
        data = self.load_json_file(file_path)
        return self.extract_questions(data, file_path)
    
    def get_all_questions_from_files(self, file_paths: List[str]) -> List[Dict[str, Any]]:
        """Get all questions from multiple files"""
        all_questions = []
        for file_path in file_paths:
            questions = self.get_all_questions_from_file(file_path)
            all_questions.extend(questions)
        return all_questions
    
    def update_question_frequency(self, file_path: str, question_index: int, 
                                  format_type: str = "array") -> bool:
        """
        Update frequency of a question in the JSON file
        Returns True if successful, False otherwise
        """
        full_path = self.base_dir / file_path
        
        if not full_path.exists():
            logger.error(f"File not found for frequency update: {full_path}")
            return False
        
        try:
            # Load the file
            with open(full_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Update frequency based on format
            if format_type == "array":
                if isinstance(data, list) and 0 <= question_index < len(data):
                    if 'frequency' not in data[question_index]:
                        data[question_index]['frequency'] = 0
                    data[question_index]['frequency'] += 1
            
            elif format_type == "scenario":
                if isinstance(data, dict) and 'scenarios' in data:
                    # Find the question and update
                    for scenario in data.get('scenarios', []):
                        questions = scenario.get('questions', [])
                        if 0 <= question_index < len(questions):
                            if 'frequency' not in questions[question_index]:
                                questions[question_index]['frequency'] = 0
                            questions[question_index]['frequency'] += 1
                            break
            
            elif format_type == "questions_object":
                if isinstance(data, dict) and 'questions' in data:
                    questions = data.get('questions', [])
                    if 0 <= question_index < len(questions):
                        if 'frequency' not in questions[question_index]:
                            questions[question_index]['frequency'] = 0
                        questions[question_index]['frequency'] += 1
            
            # Write back to file
            with open(full_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            return True
            
        except Exception as e:
            logger.error(f"Error updating frequency in {full_path}: {e}")
            return False
    
    def detect_file_format(self, file_path: str) -> str:
        """Detect the format of a JSON question file"""
        data = self.load_json_file(file_path)
        
        if isinstance(data, list):
            return "array"
        elif isinstance(data, dict):
            if 'scenarios' in data:
                return "scenario"
            elif 'questions' in data:
                return "questions_object"
        
        return "unknown"

