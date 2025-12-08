"""
Test Generator Module
Generates MCQ tests based on candidate expertise
"""

import random
from typing import List, Dict, Any, Optional, Tuple
import logging
from pathlib import Path

from .config import TEST_COMPOSITIONS, QUESTION_FILES, CS_DISTRIBUTION
from .question_parser import QuestionParser
from .expertise_detector import ExpertiseDetector

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TestGenerator:
    """Generates tests based on candidate expertise"""
    
    def __init__(self, base_dir: Optional[Path] = None):
        self.parser = QuestionParser(base_dir)
        self.expertise_detector = ExpertiseDetector()
        self.base_dir = base_dir if base_dir else Path(__file__).parent.parent
    
    def select_random_questions(self, questions: List[Dict[str, Any]], 
                               count: int) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Select random questions from a list
        
        Returns:
            Tuple of (selected_questions, tracking_info)
            tracking_info contains metadata for frequency updates
        """
        if len(questions) < count:
            logger.warning(f"Not enough questions. Requested: {count}, Available: {len(questions)}")
            count = len(questions)
        
        # Create indices list and shuffle
        indices = list(range(len(questions)))
        selected_indices = random.sample(indices, count)
        
        # Select questions and create tracking info
        selected = [questions[i].copy() for i in selected_indices]
        tracking_info = [
            {
                'question_index': idx,
                'source_file': questions[idx].get('source_file'),
                'question_text': questions[idx].get('question', '')[:50]  # First 50 chars for matching
            }
            for idx in selected_indices
        ]
        
        return selected, tracking_info
    
    def update_frequencies(self, selected_questions: List[Dict[str, Any]]) -> None:
        """Update frequency counters for selected questions in their source files"""
        # Group questions by source file for efficient batch updates
        questions_by_file = {}
        
        for question in selected_questions:
            source_file = question.get('source_file')
            if not source_file:
                continue
            
            if source_file not in questions_by_file:
                questions_by_file[source_file] = []
            questions_by_file[source_file].append(question)
        
        # Update frequencies file by file
        for source_file, questions in questions_by_file.items():
            self._update_frequencies_in_file(source_file, questions)
    
    
    def _update_frequencies_in_file(self, file_path: str, questions: List[Dict[str, Any]]) -> None:
        """Update frequencies for multiple questions in a file"""
        full_path = self.base_dir / file_path
        if not full_path.exists():
            logger.warning(f"File not found: {full_path}")
            return
        
        try:
            import json
            with open(full_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Update frequencies based on stored metadata
            for question in questions:
                file_format = question.get('_file_format', 'array')
                file_position = question.get('_file_position')
                
                if file_position is None:
                    # Fallback: try to find question by matching
                    continue
                
                if file_format == 'array' and isinstance(data, list):
                    if 0 <= file_position < len(data):
                        if 'frequency' not in data[file_position]:
                            data[file_position]['frequency'] = 0
                        data[file_position]['frequency'] += 1
                
                elif file_format == 'scenario' and isinstance(data, dict):
                    scenario_idx = question.get('_scenario_index')
                    q_idx = question.get('_question_index_in_scenario')
                    
                    if scenario_idx is not None and q_idx is not None:
                        scenarios = data.get('scenarios', [])
                        if 0 <= scenario_idx < len(scenarios):
                            scenario_questions = scenarios[scenario_idx].get('questions', [])
                            if 0 <= q_idx < len(scenario_questions):
                                if 'frequency' not in scenario_questions[q_idx]:
                                    scenario_questions[q_idx]['frequency'] = 0
                                scenario_questions[q_idx]['frequency'] += 1
                
                elif file_format == 'questions_object' and isinstance(data, dict):
                    questions_list = data.get('questions', [])
                    if 0 <= file_position < len(questions_list):
                        if 'frequency' not in questions_list[file_position]:
                            questions_list[file_position]['frequency'] = 0
                        questions_list[file_position]['frequency'] += 1
            
            # Write back to file
            with open(full_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Updated frequencies for {len(questions)} questions in {file_path}")
        
        except Exception as e:
            logger.error(f"Error updating frequencies in {full_path}: {e}")
            import traceback
            traceback.print_exc()
    
    def generate_test(self, expertise: str, random_seed: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Generate a complete test based on expertise
        
        Args:
            expertise: One of 'physics', 'maths', 'english', 'cs'
            random_seed: Optional seed for reproducibility
        
        Returns:
            List of 100 questions for the test
        """
        if random_seed is not None:
            random.seed(random_seed)
        
        if expertise not in TEST_COMPOSITIONS:
            raise ValueError(f"Unknown expertise: {expertise}. Must be one of: {list(TEST_COMPOSITIONS.keys())}")
        
        composition = TEST_COMPOSITIONS[expertise]
        test_questions = []
        
        logger.info(f"Generating test for expertise: {expertise}")
        logger.info(f"Composition: {composition}")
        
        # Generate questions for each category
        # NOTE: Order here defines the final sequence in the test.
        # We rely on the insertion order in TEST_COMPOSITIONS to keep:
        #   - All analytical first
        #   - Then English
        #   - Then subject-specific sections (Physics/Maths/CS)
        for category, count in composition.items():
            if category == "cs":
                # Handle CS subcategories – questions inside this block are grouped
                # subcategory-wise (e.g., all OOP, then DS, then DB, etc.)
                cs_questions = self._generate_cs_questions(count)
                test_questions.extend(cs_questions)
            else:
                # Non‑CS categories (analytical, english, physics, maths)
                # Questions are chosen randomly but kept together as a block.
                questions = self._generate_category_questions(category, count)
                test_questions.extend(questions)
        
        # Update frequencies for all selected questions
        self.update_frequencies(test_questions)
        
        # Clean internal metadata from questions before returning.
        # IMPORTANT: We do NOT shuffle here so that the sequence remains:
        # analytical block -> english block -> subject blocks (and CS subcategories grouped).
        cleaned_questions = []
        for question in test_questions:
            cleaned_q = {k: v for k, v in question.items()
                         if not k.startswith('_')}  # Remove internal metadata
            cleaned_questions.append(cleaned_q)
        
        # Add question numbers in the final sequential order
        for idx, question in enumerate(cleaned_questions, 1):
            question['question_number'] = idx
        
        logger.info(f"Generated test with {len(cleaned_questions)} questions")
        return cleaned_questions
    
    def _generate_category_questions(self, category: str, count: int) -> List[Dict[str, Any]]:
        """Generate questions for a specific category"""
        # Special handling for analytical questions to respect scenarios/descriptions
        if category == "analytical":
            return self._generate_analytical_questions(count)

        file_paths = QUESTION_FILES.get(category, [])
        
        if not file_paths:
            logger.error(f"No files found for category: {category}")
            return []
        
        # Load all questions from category files
        all_questions = self.parser.get_all_questions_from_files(file_paths)
        
        if not all_questions:
            logger.error(f"No questions found for category: {category}")
            return []
        
        # Select random questions
        selected, _ = self.select_random_questions(all_questions, count)
        
        # Store source info for frequency updates
        for q in selected:
            if 'category' not in q:
                q['category'] = category
        
        return selected

    def _generate_analytical_questions(self, count: int) -> List[Dict[str, Any]]:
        """
        Generate analytical questions with special rules:
        - If a question belongs to a scenario (has description), we include ALL questions
          from that scenario together.
        - Description (scenario_description) is attached to each question.
        - We first try to fill using whole scenarios (without splitting them),
          then fill any remaining slots with standalone analytical questions.
        """
        file_paths = QUESTION_FILES.get("analytical", [])
        if not file_paths:
            logger.error("No files found for analytical category")
            return []

        scenario_groups = []   # Each item: {'title', 'description', 'questions': [...]}
        single_questions = []  # Non-scenario analytical questions (treated individually)

        # Build groups from all analytical files
        for file_path in file_paths:
            format_type = self.parser.detect_file_format(file_path)

            # Scenario-based analytical files
            if format_type == "scenario":
                data = self.parser.load_json_file(file_path)
                if not isinstance(data, dict):
                    continue

                scenarios = data.get("scenarios", [])
                for scenario_idx, scenario in enumerate(scenarios):
                    scenario_title = scenario.get("title")
                    scenario_description = scenario.get("description")
                    scenario_questions_raw = scenario.get("questions", [])

                    group_questions: List[Dict[str, Any]] = []
                    for q_idx, q in enumerate(scenario_questions_raw):
                        q_copy = q.copy()
                        # Attach scenario context
                        q_copy["scenario_id"] = scenario.get("id")
                        q_copy["scenario_title"] = scenario_title
                        q_copy["scenario_description"] = scenario_description
                        # Also expose scenario text under a generic 'description' field
                        # so consumers can easily show it before the block of questions.
                        if scenario_description and "description" not in q_copy:
                            q_copy["description"] = scenario_description
                        q_copy["source_file"] = file_path
                        # Metadata needed for frequency updates
                        q_copy["_file_format"] = "scenario"
                        q_copy["_scenario_index"] = scenario_idx
                        q_copy["_question_index_in_scenario"] = q_idx
                        if "frequency" not in q_copy:
                            q_copy["frequency"] = 0
                        if "category" not in q_copy:
                            q_copy["category"] = "analytical"
                        group_questions.append(q_copy)

                    if group_questions:
                        scenario_groups.append(
                            {
                                "title": scenario_title,
                                "description": scenario_description,
                                "questions": group_questions,
                            }
                        )

            # Non-scenario analytical files (array or questions_object)
            else:
                questions = self.parser.get_all_questions_from_file(file_path)
                for q in questions:
                    # Ensure minimal fields
                    if "source_file" not in q:
                        q["source_file"] = file_path
                    if "frequency" not in q:
                        q["frequency"] = 0
                    if "category" not in q:
                        q["category"] = "analytical"
                    # These questions have no scenario_description; treat as singles
                    single_questions.append(q)

        selected_questions: List[Dict[str, Any]] = []
        remaining = count

        # 1) Randomly pick whole scenarios without exceeding the analytical count
        random.shuffle(scenario_groups)
        for group in scenario_groups:
            size = len(group["questions"])
            if size <= remaining:
                selected_questions.extend(group["questions"])
                remaining -= size
            if remaining <= 0:
                break

        # 2) Fill any remaining slots with standalone analytical questions
        if remaining > 0 and single_questions:
            # We don't want to modify the original list ordering permanently
            tmp_single = single_questions[:]
            random.shuffle(tmp_single)
            if len(tmp_single) > remaining:
                tmp_single = tmp_single[:remaining]
            selected_questions.extend(tmp_single)

        # Final safety: if still we couldn't reach requested count (very unlikely),
        # just return what we have.
        if len(selected_questions) < count:
            logger.warning(
                "Could not reach desired analytical count. "
                f"Requested: {count}, Got: {len(selected_questions)}"
            )

        return selected_questions
    
    def _generate_cs_questions(self, total_count: int) -> List[Dict[str, Any]]:
        """Generate CS questions distributed across subcategories"""
        cs_questions = []
        cs_files = QUESTION_FILES.get("cs", {})
        
        for subcategory, count in CS_DISTRIBUTION.items():
            if subcategory not in cs_files:
                logger.warning(f"CS subcategory not found: {subcategory}")
                continue
            
            file_paths = cs_files[subcategory]
            all_questions = self.parser.get_all_questions_from_files(file_paths)
            
            if all_questions:
                selected, _ = self.select_random_questions(all_questions, count)
                
                # Add subcategory info
                for q in selected:
                    q['cs_subcategory'] = subcategory
                    if 'category' not in q:
                        q['category'] = 'cs'
                
                cs_questions.extend(selected)
        
        # If we didn't get enough, randomly select from all CS questions
        if len(cs_questions) < total_count:
            all_cs_questions = []
            for subcategory_files in cs_files.values():
                all_cs_questions.extend(self.parser.get_all_questions_from_files(subcategory_files))
            
            # Remove duplicates and already selected questions
            selected_questions_text = {q.get('question') for q in cs_questions}
            remaining = [q for q in all_cs_questions if q.get('question') not in selected_questions_text]
            
            needed = total_count - len(cs_questions)
            if remaining:
                additional, _ = self.select_random_questions(remaining, min(needed, len(remaining)))
                cs_questions.extend(additional)
        
        return cs_questions
    
    def generate_test_from_education(self, education_background: str, 
                                    random_seed: Optional[int] = None) -> Dict[str, Any]:
        """
        Generate test from education background string
        
        Returns:
            Dictionary with 'expertise' and 'questions' keys
        """
        expertise = self.expertise_detector.detect_expertise(education_background)
        
        if not expertise:
            raise ValueError(f"Could not detect expertise from: {education_background}")
        
        questions = self.generate_test(expertise, random_seed)
        
        return {
            "expertise": expertise,
            "questions": questions,
            "total_questions": len(questions)
        }
    
    def generate_test_from_cv_data(self, cv_data: Dict[str, Any], 
                                   random_seed: Optional[int] = None) -> Dict[str, Any]:
        """
        Generate test from structured CV data
        
        Returns:
            Dictionary with 'expertise' and 'questions' keys
        """
        expertise = self.expertise_detector.detect_from_cv_data(cv_data)
        
        if not expertise:
            raise ValueError(f"Could not detect expertise from CV data")
        
        questions = self.generate_test(expertise, random_seed)
        
        return {
            "expertise": expertise,
            "questions": questions,
            "total_questions": len(questions)
        }

