from django.shortcuts import render, HttpResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view
import sys
from pathlib import Path

# Add backend directory to path to import test_generator
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from test_generator.service import TestGeneratorService

# Create your views here.
# Testing that our Django server is working fine or not
""""
# Testing that our Django server is working fine or not

def home_page(request):
    return HttpResponse("Hello, This is our Django API Home Page") 


# Testing that our Django API is working fine or not

@api_view(['GET'])
def index(request):
    return Response({"message": "Hello, This is our Django API Home Page"}) 

"""




# Our main working start from here
# Homepage or Website main page view
def homepage(request):
    return render(request, "homepage.html")


# Login and Registration Page
def authenticate_user(request):
    return render(request, "authentication_page.html")


# Test Generator API Endpoints
@api_view(['GET'])
def generate_test(request):
    """
    Generate a test for a candidate
    For now, generates CS test by default
    Later will be based on candidate expertise
    """
    try:
        # Initialize test generator service
        service = TestGeneratorService()
        
        # For now, generate CS test (as requested)
        # Later: Get expertise from request or candidate data
        expertise = request.GET.get('expertise', 'cs')
        candidate_id = request.GET.get('candidate_id', 'default')
        
        # Generate test
        result = service.generate_test_by_expertise(
            expertise=expertise,
            candidate_id=candidate_id
        )
        
        # Transform questions to match frontend format
        formatted_questions = []
        for idx, question in enumerate(result['questions'], 1):
            # Extract question text
            question_text = question.get('question', question.get('Question', question.get('question_text', '')))
            
            # Extract the correct answer (string)
            correct_answer = (
                question.get('key')
                or question.get('correct_answer')
                or question.get('correct')
                or question.get('answer')
                or question.get('Answer')
            )
            
            # Extract options - handle different possible field names
            options = []
            
            # Handle answers object format (A1, A2, A3, A4)
            if 'answers' in question and isinstance(question['answers'], dict):
                # Sort by key to maintain order (A1, A2, A3, A4)
                sorted_answers = sorted(question['answers'].items())
                options = [value for key, value in sorted_answers]
            # Handle options array format
            elif 'options' in question and isinstance(question['options'], list):
                options = question['options']
            elif 'Options' in question and isinstance(question['Options'], list):
                options = question['Options']
            elif 'choices' in question and isinstance(question['choices'], list):
                options = question['choices']
            elif 'Choices' in question and isinstance(question['Choices'], list):
                options = question['Choices']
            # Handle individual option fields
            else:
                option_keys = ['option_a', 'option_b', 'option_c', 'option_d', 
                              'Option_A', 'Option_B', 'Option_C', 'Option_D',
                              'A', 'B', 'C', 'D', 'A1', 'A2', 'A3', 'A4']
                for key in option_keys:
                    if key in question and question[key]:
                        options.append(question[key])
            
            # If still no options, try to extract from any list field
            if not options:
                for key, value in question.items():
                    if isinstance(value, list) and len(value) > 0 and key != 'question':
                        options = value
                        break
            
            # If still no options, create placeholder
            if not options:
                options = ['Option A', 'Option B', 'Option C', 'Option D']
            
            formatted_questions.append({
                'id': idx,
                'question': question_text,
                'options': options,
                'correctAnswer': correct_answer  # included for scoring on frontend
            })
        
        return Response({
            'success': True,
            'expertise': result['expertise'],
            'total_questions': result['total_questions'],
            'questions': formatted_questions
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)