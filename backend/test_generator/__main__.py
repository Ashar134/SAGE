"""
Main entry point for test generator
Can be run as a module: python -m test_generator
"""

import json
import sys
from pathlib import Path
from .service import TestGeneratorService


def main():
    """Main function for command-line usage"""
    if len(sys.argv) < 2:
        print("Usage: python -m test_generator <expertise|education_text> [candidate_id]")
        print("\nExamples:")
        print("  python -m test_generator cs")
        print("  python -m test_generator physics candidate_123")
        print("  python -m test_generator 'Bachelor in Computer Science' candidate_456")
        sys.exit(1)
    
    input_arg = sys.argv[1]
    candidate_id = sys.argv[2] if len(sys.argv) > 2 else "test_candidate"
    
    service = TestGeneratorService()
    
    try:
        # Check if input is an expertise type or education text
        valid_expertise = ['physics', 'maths', 'english', 'cs']
        
        if input_arg.lower() in valid_expertise:
            # Direct expertise
            result = service.generate_test_by_expertise(
                input_arg.lower(),
                candidate_id=candidate_id
            )
        else:
            # Education text - detect expertise first
            expertise = service.detect_expertise(input_arg)
            if not expertise:
                print(f"Error: Could not detect expertise from: {input_arg}")
                sys.exit(1)
            
            print(f"Detected expertise: {expertise}")
            result = service.generate_test_by_expertise(
                expertise,
                candidate_id=candidate_id
            )
        
        # Output results
        output_file = f"test_{candidate_id}_{result['expertise']}.json"
        
        # Prepare output (remove source_file info for cleaner output)
        output_data = {
            'candidate_id': result['candidate_id'],
            'expertise': result['expertise'],
            'total_questions': result['total_questions'],
            'test_composition': result['test_composition'],
            'questions': []
        }
        
        for q in result['questions']:
            clean_q = {
                'question_number': q.get('question_number'),
                'type': q.get('type'),
                'category': q.get('category'),
                'question': q.get('question'),
                'answers': q.get('answers'),
                'key': q.get('key'),
                'justification': q.get('justification')
            }
            if 'cs_subcategory' in q:
                clean_q['cs_subcategory'] = q['cs_subcategory']
            output_data['questions'].append(clean_q)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        print(f"\nTest generated successfully!")
        print(f"  Candidate ID: {result['candidate_id']}")
        print(f"  Expertise: {result['expertise']}")
        print(f"  Total Questions: {result['total_questions']}")
        print(f"  Output file: {output_file}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()





