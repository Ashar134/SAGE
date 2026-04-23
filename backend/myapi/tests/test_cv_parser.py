import unittest
from unittest.mock import patch, MagicMock
import sys
from pathlib import Path

# Add the CV-Parser directory to sys.path for importing resume_parser
curr_dir = Path(__file__).resolve().parent
backend_dir = curr_dir.parent.parent
cv_parser_dir = backend_dir / "CV-Parser"
if cv_parser_dir.exists() and str(cv_parser_dir) not in sys.path:
    sys.path.insert(0, str(cv_parser_dir))

from resume_parser.parser import parse_resume

class TestCVParser(unittest.TestCase):
    
    @patch('CV_Parser.resume_parser.parser.extract_text_from_pdf')
    @patch('CV_Parser.resume_parser.parser.extract_links_from_pdf')
    def test_parse_resume_basic(self, mock_links, mock_text):
        # Mocking the PDF text extraction
        mock_text.return_value = """
        John Doe
        john.doe@example.com | 123-456-7890
        Software Engineer with 5 years of experience.
        
        EXPERIENCE
        Senior Developer at Tech Corp (2020 - Present)
        Developed high-scale systems.
        
        EDUCATION
        B.S. in Computer Science, FAST University (2016-2020)
        
        SKILLS
        Python, Django, React, SQL
        """
        mock_links.return_value = []

        # Running the parser
        # Note: We pass a dummy path because the file extraction is mocked
        result = parse_resume("dummy_path.pdf")

        # Assertions
        self.assertEqual(result['name'], "John Doe")
        self.assertIn("john.doe@example.com", str(result['contact']))
        self.assertIn("Python", result['skills'])
        self.assertIn("Django", result['skills'])
        self.assertTrue(len(result['experience']) > 0)
        self.assertEqual(result['education'][0]['school'], "FAST University")
