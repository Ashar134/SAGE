from django.shortcuts import render, HttpResponse, redirect
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.db.models import Q
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password
import sys
from pathlib import Path
from django.views.decorators.csrf import csrf_exempt
from tempfile import NamedTemporaryFile
import os
import json
from functools import wraps
from django.conf import settings
from rest_framework_simplejwt.tokens import AccessToken

# Add backend directory to path to import test_generator
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

cv_parser_dir = backend_dir / "CV-Parser"
if cv_parser_dir.exists():
    sys.path.insert(0, str(cv_parser_dir))

from test_generator.service import TestGeneratorService
from resume_parser import parse_resume

from .models import (
    User, UserSkill, Education, WorkExperience, Certificate, Research, Project, Company, Job, SavedJob, 
    Application, ApplicationTimeline
)
from .serializers import (
    UserSerializer, UserProfileSerializer, JobSerializer, SavedJobSerializer,
    ApplicationSerializer, UserSkillSerializer,
    EducationSerializer, WorkExperienceSerializer
)

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


# ============================================================================
# AUTHENTICATION DECORATOR
# ============================================================================


def require_authentication(view_func):
    """
    Decorator to validate JWT token from Authorization header.
    Extracts user from token and adds to request.user_obj
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        # Get Authorization header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return Response({
                'success': False,
                'error': 'Authentication required. Please provide a valid token.',
                'requires_auth': True
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if it's a Bearer token
        if not auth_header.startswith('Bearer '):
            return Response({
                'success': False,
                'error': 'Invalid authorization format. Use: Bearer <token>',
                'requires_auth': True
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Extract token
        token = auth_header.split(' ')[1]
        
        try:
            # Validate and decode JWT token
            from rest_framework_simplejwt.tokens import AccessToken
            access_token = AccessToken(token)
            
            # Get user_id from token payload
            user_id = access_token['user_id']
            
            # Get user from database
            try:
                user = User.objects.get(id=user_id)
                # Add user to request for easy access in view
                request.user_obj = user
            except User.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'User not found. Please login again.',
                    'requires_auth': True
                }, status=status.HTTP_401_UNAUTHORIZED)
                
        except Exception as e:
            # Token is invalid, expired, or malformed
            return Response({
                'success': False,
                'error': f'Invalid or expired token: {str(e)}',
                'requires_auth': True
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        return view_func(request, *args, **kwargs)
    return wrapper


# Our main working start from here
# Homepage or Website main page view
def homepage(request):
    return render(request, "homepage.html")


# Login and Registration Page
@csrf_exempt  # Demo-only: bypass CSRF so form can post without setup
def authenticate_user(request):
    if request.method == "POST":
        return redirect("http://localhost:5173/")
    return render(request, "authentication_page.html")


@csrf_exempt
@api_view(['POST'])
def parse_cv(request):
    """
    Accept a PDF upload, run the CV parser, save the resume file, and optionally
    attach the resume_url to an Application if application_id is provided.
    """
    uploaded = request.FILES.get("file")
    if not uploaded:
        return Response({"success": False, "error": "No file provided"}, status=400)

    # Persist to a temp file so pdftotext can read it
    with NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        for chunk in uploaded.chunks():
            tmp.write(chunk)
        temp_path = tmp.name

    try:
        parsed = parse_resume(temp_path)

        # Save the uploaded resume to media/resumes for later download
        resume_dir = Path(settings.MEDIA_ROOT) / "resumes"
        resume_dir.mkdir(parents=True, exist_ok=True)
        import uuid
        safe_name = f"{uuid.uuid4()}_{uploaded.name.replace(' ', '_')}"
        dest_path = resume_dir / safe_name
        with open(dest_path, "wb") as out_f, open(temp_path, "rb") as in_f:
            out_f.write(in_f.read())
        resume_url = request.build_absolute_uri(f"{settings.MEDIA_URL}resumes/{safe_name}")

        # Optionally attach resume to an application
        application_id = request.POST.get("application_id") or request.GET.get("application_id")
        user_id = request.POST.get("user_id") or request.GET.get("user_id")

        # Try to infer user_id from Authorization header if not provided
        if not user_id:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                try:
                    at = AccessToken(token)
                    user_id = at.get("user_id")
                except Exception:
                    user_id = None

        if application_id:
            try:
                app_obj = Application.objects.get(id=application_id)
                app_obj.resume_url = resume_url
                app_obj.save(update_fields=["resume_url", "updated_at"])
            except Application.DoesNotExist:
                pass
        elif user_id:
            # Try to attach to latest real application without a resume
            latest_app = (
                Application.objects.filter(user_id=user_id, resume_url__isnull=True)
                .exclude(job_title="Resume Upload")
                .order_by("-applied_at")
                .first()
            )
            if latest_app:
                latest_app.resume_url = resume_url
                latest_app.save(update_fields=["resume_url", "updated_at"])
            # Do NOT create a dummy application — just store on user profile below
        # Store resume URL on user profile
        if user_id:
            try:
                user_obj = User.objects.get(id=user_id)
                user_obj.resume_url = resume_url
                user_obj.save(update_fields=["resume_url", "updated_at"])
            except User.DoesNotExist:
                pass

        return Response({"success": True, "data": parsed, "resume_url": resume_url})
    except Exception as exc:
        return Response({"success": False, "error": str(exc)}, status=500)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)



# --- Automated Question Generation (RAG) ---
# Test Generator API Endpoints
@api_view(['GET'])
def generate_test(request):
    """
    Generate a test for a candidate based on the job posting.
    Looks up Job model for title, requirements, and question count.
    """
    try:
        service = TestGeneratorService()
        
        candidate_id = request.GET.get('candidate_id', 'default')
        job_id = request.GET.get('job_id', '')
        
        # Look up job details first
        if job_id:
            try:
                job = Job.objects.get(id=job_id)
                job_title = job.title
                requirements = job.requirements or []
                total_questions = job.test_no_of_questions or 100
                time_allowed = job.test_time_allowed or 60
            except Job.DoesNotExist:
                job = None
                job_title = request.GET.get('job_title', 'Software Engineer')
                requirements = []
                total_questions = 20
                time_allowed = 30
        else:
            job = None
            job_title = request.GET.get('job_title', 'Software Engineer')
            requirements = []
            total_questions = 20
            time_allowed = 30

        # Check if test was already completed for this candidate/job
        if job_id and candidate_id != 'default':
            try:
                application = Application.objects.get(job_id=job_id, user_id=candidate_id)
                if application.test_score is not None:
                    # Fetch total questions from generated test file if it exists
                    existing_test = service.load_test(candidate_id, job_id)
                    actual_total = existing_test.get('total_questions', total_questions) if existing_test else total_questions
                    
                    # Convert score from percentage back to numerical if possible
                    raw_score = round((application.test_score / 100) * actual_total)

                    return Response({
                        'success': True,
                        'already_completed': True,
                        'test_score': raw_score, 
                        'percentage': application.test_score,
                        'total_questions': actual_total,
                        'status': application.status,
                        'questions': [] 
                    })
            except Application.DoesNotExist:
                pass
        
        # Generate test using RAG
        result = service.generate_rag_test_for_job(
            job_id=job_id or 'unknown',
            job_title=job_title,
            requirements=requirements,
            total_questions=total_questions,
            candidate_id=candidate_id
        )
        
        # Transform questions to match frontend format
        formatted_questions = []
        for idx, question in enumerate(result['questions'], 1):
            # Extract question text
            question_text = question.get('question', question.get('Question', question.get('question_text', '')))
            
            # Extract the correct answer key
            raw_correct = (
                question.get('key')
                or question.get('correct_answer')
                or question.get('correct')
                or question.get('answer')
                or question.get('Answer')
            )
            
            # Extract options and try to resolve raw_correct to its text value
            options = []
            correct_answer = raw_correct
            
            # Handle answers object format (A1, A2, A3, A4)
            if 'answers' in question and isinstance(question['answers'], dict):
                answers_dict = question['answers']
                # If raw_correct is a key in the answers (e.g., "A2"), get its value
                if raw_correct in answers_dict:
                    correct_answer = answers_dict[raw_correct]
                
                # Sort by key to maintain order (A1, A2, A3, A4)
                sorted_answers = sorted(answers_dict.items())
                options = [value for key, value in sorted_answers]
                
            # Handle options array format
            elif 'options' in question and isinstance(question['options'], list):
                options = question['options']
                # If raw_correct is a number (1-indexed or 0-indexed string/int), resolve it
                try:
                    idx_val = int(raw_correct)
                    if 0 <= idx_val < len(options): # 0-indexed
                        correct_answer = options[idx_val]
                    elif 1 <= idx_val <= len(options): # 1-indexed
                        correct_answer = options[idx_val - 1]
                except (ValueError, TypeError):
                    pass
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
                
                # If it's a single character key 'A', 'B', 'C', 'D'
                if raw_correct in question and raw_correct in ['A', 'B', 'C', 'D', 'option_a', 'option_b', 'option_c', 'option_c']:
                    correct_answer = question[raw_correct]
            
            # If still no options, try to extract from any list field
            if not options:
                for key, value in question.items():
                    if isinstance(value, list) and len(value) > 0 and key != 'question':
                        options = value
                        if raw_correct in ['0', '1', '2', '3'] or isinstance(raw_correct, int):
                            try:
                                correct_answer = options[int(raw_correct)]
                            except: pass
                        break
            
            # If still no options, create placeholder
            if not options:
                options = ['Option A', 'Option B', 'Option C', 'Option D']
            
            # Determine question type from the question object itself
            category = question.get('category', 'General')
            
            formatted_questions.append({
                'id': idx,
                'question': question_text,
                'options': options,
                'correctAnswer': correct_answer,  # included for scoring on frontend
                'questionType': category.capitalize()  # Category/subject for display
            })
        
        return Response({
            'success': True,
            'expertise': job_title,
            'total_questions': result['total_questions'],
            'time_allowed': time_allowed,  # in minutes
            'questions': formatted_questions
        })
        
    except Exception as e:
        import traceback
        print("\n=== GENERATE TEST ERROR ===")
        traceback.print_exc()
        print("=========================\n")
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)


@api_view(['POST'])
def submit_test(request):
    """
    Submit test results, calculate score securely on backend, and update status.
    Threshold: 40%
    """
    try:
        data = request.data
        job_id = data.get('job_id')
        candidate_id = data.get('candidate_id')
        user_answers = data.get('answers', []) # List of strings matched to question order
        
        if not all([job_id, candidate_id]):
            return Response({
                'success': False,
                'error': 'Missing required fields: job_id, candidate_id'
            }, status=400)

        # Get the application
        try:
            application = Application.objects.get(job_id=job_id, user_id=candidate_id)
        except Application.DoesNotExist:
            return Response({'success': False, 'error': 'Application not found'}, status=404)

        # Check if already submitted
        if application.test_score is not None:
            return Response({'success': False, 'error': 'Test already submitted for this job.'}, status=400)

        # Load the generated test to calculate score securely
        service = TestGeneratorService()
        test_file_data = service.load_test(candidate_id, job_id)
        
        if not test_file_data or 'questions' not in test_file_data:
            # Fallback to frontend-provided score if file is missing (not ideal but avoids blocking)
            score = float(data.get('score', 0))
            total_questions = int(data.get('total_questions', 20))
        else:
            # Secure Backend Calculation
            questions = test_file_data['questions']
            total_questions = len(questions)
            score = 0
            
            for idx, q in enumerate(questions):
                if idx < len(user_answers):
                    user_ans = user_answers[idx]
                    if user_ans is None:
                        continue
                        
                    correct_key = q.get('key') or q.get('correct_answer')
                    answers_map = q.get('answers', q.get('options', {}))
                    
                    is_correct = False
                    if isinstance(answers_map, dict):
                        # Case 1: correct_key is an answer key like "A1", "A2" etc.
                        if correct_key in answers_map:
                            correct_text = str(answers_map[correct_key]).strip().lower()
                            if correct_text == str(user_ans).strip().lower():
                                is_correct = True
                        else:
                            # Case 2: correct_key is the answer text directly (JSON-Fallback style)
                            # Find which key maps to this text, then compare user answer
                            for k, v in answers_map.items():
                                if str(v).strip().lower() == str(correct_key).strip().lower():
                                    if str(v).strip().lower() == str(user_ans).strip().lower():
                                        is_correct = True
                                    break
                            # Also allow direct text comparison
                            if not is_correct:
                                if str(correct_key).strip().lower() == str(user_ans).strip().lower():
                                    is_correct = True
                    elif isinstance(answers_map, list):
                        try:
                            idx_val = int(correct_key)
                            if 0 <= idx_val < len(answers_map) and str(answers_map[idx_val]).strip().lower() == str(user_ans).strip().lower():
                                is_correct = True
                        except (ValueError, TypeError):
                            if str(correct_key).strip().lower() == str(user_ans).strip().lower():
                                is_correct = True
                    
                    if is_correct:
                        score += 1

        # Calculate percentage
        percentage = (float(score) / float(total_questions)) * 100 if total_questions > 0 else 0
        
        # Update application status
        old_status = application.status
        new_status = 'interview' if percentage >= 40 else 'rejected'
        
        application.test_score = percentage
        application.test_completed_at = timezone.now()
        application.status = new_status
        if new_status == 'interview':
            from datetime import timedelta
            application.interview_deadline = timezone.now() + timedelta(days=2)
        application.save()
        
        # Timeline
        ApplicationTimeline.objects.create(
            application=application,
            event_type='status_change',
            old_status=old_status,
            new_status=new_status,
            title=f'Test Completed - {percentage:.1f}%',
            description=f'Scored {score}/{total_questions} ({percentage:.1f}%). Candidate moved to {new_status}.'
        )
        
        return Response({
            'success': True,
            'percentage': percentage,
            'score': score,
            'total_questions': total_questions,
            'new_status': new_status,
            'message': f'Test submitted successfully. Your score: {percentage:.1f}%'
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)


# ============================================================================
# Authentication APIs
# ============================================================================

@csrf_exempt
@api_view(['POST'])
def register_user(request):
    """Register a new user"""
    try:
        data = request.data
        
        # Check if user already exists
        if User.objects.filter(email=data.get('email')).exists():
            return Response({
                'success': False,
                'error': 'User with this email already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create user
        user = User.objects.create(
            email=data.get('email'),
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            phone=data.get('phone', ''),
            password_hash=make_password(data.get('password'))
        )
        
        serializer = UserSerializer(user)
        return Response({
            'success': True,
            'user': serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['POST'])
def login_user(request):
    """Login user and set refresh token in HttpOnly cookie"""
    try:
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({
                'success': False,
                'error': 'Email and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check password
        if not check_password(password, user.password_hash):
            return Response({
                'success': False,
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Update last login
        user.last_login = timezone.now()
        user.save()
        
        # Generate JWT tokens
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        
        serializer = UserSerializer(user)
        response = Response({
            'success': True,
            'user': serializer.data,
            'access_token': str(refresh.access_token),
        })

        # Set refresh token in HttpOnly cookie
        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite='Lax',
            max_age=7 * 24 * 60 * 60,  # 7 days
            path='/'
        )
        
        return response
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['POST'])
def refresh_token(request):
    """Refresh access token using refresh token from HttpOnly cookie"""
    try:
        from rest_framework_simplejwt.tokens import RefreshToken
        
        # Try to get refresh token from cookie first
        refresh_token_val = request.COOKIES.get('refresh_token')
        
        # Fallback to request body if needed (though we want to move away from this)
        if not refresh_token_val:
            refresh_token_val = request.data.get('refresh')
            
        if not refresh_token_val:
            return Response({
                'success': False,
                'error': 'Refresh token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            refresh = RefreshToken(refresh_token_val)
            return Response({
                'success': True,
                'access_token': str(refresh.access_token)
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Invalid or expired refresh token'
            }, status=status.HTTP_401_UNAUTHORIZED)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['POST'])
def logout_user(request):
    """Logout user and clear the refresh token cookie"""
    response = Response({
        'success': True,
        'message': 'Logged out successfully'
    })
    response.delete_cookie('refresh_token')
    return response


@csrf_exempt
@api_view(['POST'])
def verify_token(request):
    """Verify if access token is valid"""
    try:
        from rest_framework_simplejwt.tokens import AccessToken
        
        token = request.data.get('token')
        if not token:
            return Response({
                'success': False,
                'error': 'Token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            AccessToken(token)
            return Response({
                'success': True,
                'valid': True
            })
        except Exception:
            return Response({
                'success': True,
                'valid': False
            })
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# Job APIs
# ============================================================================


@api_view(['GET'])
def get_jobs(request):
    """Get all jobs with optional filtering"""
    try:
        queryset = Job.objects.filter(is_active=True).select_related('company')
        
        # Filter by search query
        search = request.GET.get('search', '')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(company_name__icontains=search) |
                Q(description__icontains=search)
            )
        
        # Filter by location
        location = request.GET.get('location', '')
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        # Filter by work mode
        work_mode = request.GET.get('work_mode', '')
        if work_mode:
            queryset = queryset.filter(work_mode__contains=[work_mode])
        
        # Filter by job type
        job_type = request.GET.get('job_type', '')
        if job_type:
            queryset = queryset.filter(job_type__contains=[job_type])
        
        # Filter by remote
        is_remote = request.GET.get('is_remote', '')
        if is_remote:
            queryset = queryset.filter(is_remote=(is_remote.lower() == 'true'))
        
        # Filter by salary range
        min_salary = request.GET.get('min_salary', '')
        if min_salary:
            queryset = queryset.filter(salary_min__gte=float(min_salary))
        
        max_salary = request.GET.get('max_salary', '')
        if max_salary:
            queryset = queryset.filter(salary_max__lte=float(max_salary))
        
        serializer = JobSerializer(queryset, many=True, context={'request': request})
        return Response({
            'success': True,
            'count': queryset.count(),
            'jobs': serializer.data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_job_detail(request, job_id):
    """Get single job details"""
    try:
        job = Job.objects.select_related('company').get(id=job_id, is_active=True)
        serializer = JobSerializer(job, context={'request': request})
        return Response({
            'success': True,
            'job': serializer.data
        })
    except Job.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Job not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# Saved Jobs APIs
# ============================================================================

@csrf_exempt
@api_view(['GET', 'POST'])
@require_authentication
def saved_jobs(request):
    """Get or create saved jobs"""
    try:
        # Get user from JWT token (added by decorator)
        user_id = request.user_obj.id
        
        if request.method == 'GET':
            # Get all saved jobs for user
            saved = SavedJob.objects.filter(user_id=user_id).select_related('job', 'job__company')
            serializer = SavedJobSerializer(saved, many=True)
            return Response({
                'success': True,
                'count': saved.count(),
                'saved_jobs': serializer.data
            })
        
        elif request.method == 'POST':
            # Save a job
            job_id = request.data.get('job_id')
            if not job_id:
                return Response({
                    'success': False,
                    'error': 'Job ID is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if already saved
            if SavedJob.objects.filter(user_id=user_id, job_id=job_id).exists():
                return Response({
                    'success': False,
                    'error': 'Job already saved'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            saved_job = SavedJob.objects.create(
                user_id=user_id,
                job_id=job_id,
                notes=request.data.get('notes', '')
            )
            
            serializer = SavedJobSerializer(saved_job)
            return Response({
                'success': True,
                'saved_job': serializer.data
            }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['DELETE'])
@require_authentication
def unsave_job(request, job_id):
    """Remove a saved job"""
    try:
        # Get user from JWT token (added by decorator)
        user_id = request.user_obj.id
        
        saved_job = SavedJob.objects.get(user_id=user_id, job_id=job_id)
        saved_job.delete()
        
        return Response({
            'success': True,
            'message': 'Job unsaved successfully'
        })
    
    except SavedJob.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Saved job not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# Application APIs
# ============================================================================

@csrf_exempt
@api_view(['GET', 'POST'])
@require_authentication
def applications(request):
    """Get or create applications"""
    try:
        # Get user from JWT token (added by decorator)
        user_id = request.user_obj.id
        
        if request.method == 'GET':
            # Get all applications for user
            apps = Application.objects.filter(user_id=user_id).prefetch_related('timeline')
            
            # Filter by status
            status_filter = request.GET.get('status')
            if status_filter:
                apps = apps.filter(status=status_filter)
            
            serializer = ApplicationSerializer(apps, many=True)
            return Response({
                'success': True,
                'count': apps.count(),
                'applications': serializer.data
            })
        
        elif request.method == 'POST':
            # Create new application
            data = request.data
            
            # Get job details if job_id provided
            job_id = data.get('job_id')
            
            # Prevent duplicate job applications (unless the previous one was withdrawn)
            existing_app = None
            if job_id:
                existing_app = Application.objects.filter(user_id=user_id, job_id=job_id).first()
                if existing_app and existing_app.status != 'withdrawn':
                    return Response({
                        'success': False,
                        'error': 'You have already applied for this job.'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            if existing_app and existing_app.status == 'withdrawn':
                # Reuse the withdrawn application
                application = existing_app
                application.status = 'test'
                application.applied_at = timezone.now()
                # Clear previous scores if they exist
                application.test_score = None
                application.interview_score = None
                application.save()
                
                # Create timeline entry for re-application
                ApplicationTimeline.objects.create(
                    application=application,
                    event_type='status_change',
                    new_status='test',
                    title='Re-applied for Job',
                    description=f'Re-applied for {application.job_title} after previous withdrawal'
                )
                
                serializer = ApplicationSerializer(application)
                return Response({
                    'success': True,
                    'application': serializer.data,
                    'message': 'Re-applied successfully'
                }, status=status.HTTP_201_CREATED)
            
            # Normal creation flow for new applications
            if job_id:
                try:
                    job = Job.objects.select_related('company').get(id=job_id)
                    # Pre-fill job details
                    data['job_title'] = data.get('job_title', job.title)
                    data['company_name'] = data.get('company_name', job.company_name)
                    data['location'] = data.get('location', job.location)
                    if job.salary_min and job.salary_max:
                        data['salary_range'] = f"${job.salary_min}k - ${job.salary_max}k"
                    if job.company:
                        data['company_logo_color'] = job.company.logo_color
                        data['company_logo_initial'] = job.company.logo_initial
                except Job.DoesNotExist:
                    pass
            
            # Inherit resume from user profile if not explicitly provided
            final_resume_url = data.get('resume_url') or (request.user_obj.resume_url if hasattr(request.user_obj, 'resume_url') else None)

            application = Application.objects.create(
                user_id=user_id,
                job_id=job_id if job_id else None,
                job_title=data.get('job_title'),
                company_name=data.get('company_name'),
                company_logo_color=data.get('company_logo_color', '#6366f1'),
                company_logo_initial=data.get('company_logo_initial', ''),
                location=data.get('location', ''),
                salary_range=data.get('salary_range', ''),
                status=data.get('status', 'test'),  # Assessments status directly upon apply
                cover_letter=data.get('cover_letter', ''),
                resume_url=final_resume_url or '',
                notes=data.get('notes', '')
            )
            
            # Create initial timeline entry
            ApplicationTimeline.objects.create(
                application=application,
                event_type='status_change',
                new_status='test',
                title='Application Submitted',
                description=f'Applied for {application.job_title} at {application.company_name}'
            )
            
            serializer = ApplicationSerializer(application)
            return Response({
                'success': True,
                'application': serializer.data
            }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['GET', 'PUT', 'DELETE'])
@require_authentication
def application_detail(request, app_id):
    """Get, update, or delete a specific application"""
    try:
        # Get user from JWT token (added by decorator)
        user_id = request.user_obj.id
        
        try:
            application = Application.objects.prefetch_related('timeline').get(
                id=app_id,
                user_id=user_id
            )
        except Application.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Application not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if request.method == 'GET':
            serializer = ApplicationSerializer(application)
            return Response({
                'success': True,
                'application': serializer.data
            })
        
        elif request.method == 'PUT':
            # Update application
            data = request.data
            old_status = application.status
            
            for field in ['status', 'interview_type', 'interview_date', 'interview_notes', 'notes']:
                if field in data:
                    setattr(application, field, data[field])
            
            application.save()
            
            # Create timeline entry if status changed
            if 'status' in data and old_status != data['status']:
                ApplicationTimeline.objects.create(
                    application=application,
                    event_type='status_change',
                    old_status=old_status,
                    new_status=data['status'],
                    title=f'Status changed to {data["status"].capitalize()}',
                    description=f'Application status updated from {old_status.capitalize()} to {data["status"].capitalize()}'
                )
            
            serializer = ApplicationSerializer(application)
            return Response({
                'success': True,
                'application': serializer.data
            })
        
        elif request.method == 'DELETE':
            application.delete()
            return Response({
                'success': True,
                'message': 'Application deleted successfully'
            })
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# HR Dashboard APIs (MySQL)
# ============================================================================


def _serialize_hr_job(job):
    requirements = job.requirements or []
    if isinstance(requirements, list):
        requirements_str = ", ".join(requirements)
    else:
        requirements_str = str(requirements or "")

    return {
        'id': str(job.id),
        'title': job.title,
        'department': job.company_name,
        'type': job.job_type[0] if isinstance(job.job_type, list) and job.job_type else 'Full-time',
        'location': job.location,
        'deadline': job.expires_at,
        'salary': job.salary_max or job.salary_min,
        'description': job.description,
        'requirements': requirements_str,
        'created_at': job.created_at,
        'test_no_of_questions': job.test_no_of_questions,
        'test_time_allowed': job.test_time_allowed,
        'test_deadline_days': job.test_deadline_days,
        'company': {
            'logo_url': job.company.logo_url if job.company else '/loop.png'
        }
    }


def _compute_skill_score(skills_list, job):
    """
    Compute a 0-100 skill-to-job-description overlap score.
    Checks how many of the candidate's skills appear in the job description/requirements.
    """
    if not skills_list or not job:
        return None
    job_text = ' '.join(filter(None, [
        job.title or '',
        job.description or '',
        ' '.join(job.requirements or []),
        ' '.join(job.responsibilities or []),
    ])).lower()
    if not job_text.strip():
        return None
    matched = sum(1 for skill in skills_list if skill.lower() in job_text)
    return round((matched / len(skills_list)) * 100)


def _compute_final_match_score(skill_score, test_score, interview_score):
    """
    Weighted Final Matched Score:
      - Skill-to-JD score:   10% weight
      - Assessment score:    50% weight
      - Interview score:     40% weight

    If a component is missing (None), its weight is redistributed
    proportionally among the available components so the result
    is always a meaningful 0-100 score.
    """
    components = [
        (skill_score,     0.10),
        (test_score,      0.50),
        (interview_score, 0.40),
    ]
    available = [(v, w) for v, w in components if v is not None]
    if not available:
        return None
    total_weight = sum(w for _, w in available)
    weighted_sum = sum(v * w for v, w in available)
    return round(weighted_sum / total_weight)


def _serialize_hr_applicant(app):
    user = getattr(app, 'user', None)
    full_name = None
    email = None
    education_list = []
    skills_list = []
    resume_url = app.resume_url or None
    # Prefer user-level resume if available
    if user:
        if user.resume_url:
            resume_url = resume_url or user.resume_url
    if user:
        full_name = f"{user.first_name or ''} {user.last_name or ''}".strip() or None
        email = user.email
        for edu in getattr(user, "education", []).all() if hasattr(user, "education") else []:
            edu_str = f"{edu.degree or ''} @ {edu.school or ''}".strip()
            if edu_str:
                education_list.append(edu_str)
        for skill in getattr(user, "skills", []).all() if hasattr(user, "skills") else []:
            if skill.skill_name:
                skills_list.append(skill.skill_name)
        
        # If still no resume, look through all user applications for any non-empty resume URL
        if not resume_url:
            latest_with_resume = (
                Application.objects.filter(user=user)
                .exclude(resume_url__isnull=True)
                .exclude(resume_url='')
                .order_by("-applied_at")
                .first()
            )
            if latest_with_resume:
                resume_url = latest_with_resume.resume_url

    # ── Score computation ────────────────────────────────────────────────
    # skill_score: 10% — candidate skills vs job description overlap
    job_obj = getattr(app, 'job', None)
    skill_score = _compute_skill_score(skills_list, job_obj)

    # test_score / interview_score are stored as 0-100 floats (percentage)
    test_score = app.test_score  # already a percentage
    interview_score = app.interview_score  # already a percentage

    # final_match_score: weighted composite (10/50/40)
    final_match_score = _compute_final_match_score(skill_score, test_score, interview_score)
    # ─────────────────────────────────────────────────────────────────────

    return {
        'id': str(app.id),
        'candidate_code': str(app.id),
        'name': full_name or app.job_title,
        'department': app.company_name,
        'role': app.job_title,
        'email': email,
        'status': app.status,
        'applied_date': app.applied_at,
        'education': education_list[0] if education_list else None,
        'education_list': education_list,
        'skills': skills_list,
        'test_score': test_score,
        # ── Interview fields ──────────────────────────────────────────────
        'interview_score': interview_score,
        'confidence_score': app.confidence_score,
        'interview_completed_at': app.interview_completed_at,
        'interview_transcript': app.interview_transcript or [],
        'interview_recording_url': app.interview_recording_url or (
            user.interview_recording_url if user and user.interview_recording_url else None
        ),
        # ── Score breakdown ───────────────────────────────────────────────
        'skill_score': skill_score,        # 10% weight — skill vs JD overlap
        'match_score': final_match_score,  # final weighted composite score
        # ─────────────────────────────────────────────────────────────────
        'video_url': app.interview_recording_url or (
            user.interview_recording_url if user and user.interview_recording_url else None
        ),
        'resume_url': resume_url,
        'rejection_reason': app.notes,
        'job_id': str(app.job_id) if app.job_id else None,
        'company_logo': app.job.company.logo_url if app.job and app.job.company else '/loop.png',
    }


@csrf_exempt
@api_view(['GET'])
def hr_applicants(request):
    """List applicants using existing Application records."""
    try:
        qs = (
            Application.objects
            .select_related('user', 'job__company')
            .prefetch_related('user__education', 'user__skills')
            .exclude(job_title="Resume Upload")
            .exclude(status='withdrawn')
        )

        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        job_title_filter = request.GET.get('job_title', '').strip()

        if start_date:
            qs = qs.filter(applied_at__gte=start_date)
        if end_date:
            qs = qs.filter(applied_at__lte=end_date)
        if job_title_filter:
            qs = qs.filter(job_title__iexact=job_title_filter)

        qs = qs.order_by('-applied_at')

        applicants = [_serialize_hr_applicant(a) for a in qs]

        # Collect distinct job titles for the filter dropdown
        job_titles = (
            Application.objects
            .exclude(job_title="Resume Upload")
            .values_list('job_title', flat=True)
            .distinct()
            .order_by('job_title')
        )

        return Response({
            'success': True,
            'applicants': applicants,
            'job_titles': list(job_titles),
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['GET', 'POST'])
def hr_jobs(request):
    """List or create job postings using existing Job model."""
    try:
        if request.method == 'GET':
            qs = Job.objects.all()
            return Response({
                'success': True,
                'jobs': [_serialize_hr_job(j) for j in qs]
            })

        # POST -> create Job
        data = request.data

        # Map incoming fields to Job fields
        salary_str = data.get('salary', '')
        salary_min = None
        salary_max = None
        
        import re
        # Basic parsing: find all numbers
        numbers = re.findall(r'\d+', salary_str.replace(',', ''))
        if numbers:
            if len(numbers) >= 2:
                salary_min = float(numbers[0])
                salary_max = float(numbers[1])
                # If they typed "100 - 150" or "100k":
                if salary_min < 1000 and 'k' in salary_str.lower(): salary_min *= 1000
                if salary_max < 1000 and 'k' in salary_str.lower(): salary_max *= 1000
            elif len(numbers) == 1:
                salary_min = float(numbers[0])
                if salary_min < 1000 and 'k' in salary_str.lower(): salary_min *= 1000

        # Ensure "Loop" company exists and associate job with it
        company, _ = Company.objects.get_or_create(name="Loop", defaults={'logo_url': '/loop.png'})

        job = Job.objects.create(
            company=company,
            title=data.get('title', ''),
            company_name=data.get('department', ''),
            location=data.get('location', ''),
            description=data.get('description', ''),
            job_type=[data.get('type', 'Full-time')],
            requirements=[s.strip() for s in data.get('requirements', '').split(',') if s.strip()],
            salary_min=salary_min,
            salary_max=salary_max,
            salary_currency='USD',
            expires_at=data.get('deadline') or None,
            test_no_of_questions=int(data.get('test_no_of_questions', 100)),
            test_time_allowed=int(data.get('test_time_allowed', 60)),
            test_deadline_days=int(data.get('test_deadline_days', 3)),
        )

        return Response({'success': True, 'job': _serialize_hr_job(job)}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['DELETE'])
def hr_job_detail(request, job_id):
    """Delete a job posting (Job model)."""
    try:
        job = Job.objects.get(id=job_id)
        job.delete()
        return Response({'success': True})
    except Job.DoesNotExist:
        return Response({'success': False, 'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['GET'])
def hr_job_applicants(request, job_id):
    """List applicants for a specific job using Application model."""
    try:
        qs = Application.objects.select_related('user', 'job__company').filter(job_id=job_id).exclude(status='withdrawn').order_by('-applied_at')
        return Response({'success': True, 'applicants': [_serialize_hr_applicant(a) for a in qs]})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['PATCH', 'POST'])
def hr_update_applicant_status(request, applicant_id):
    """Update Application status (id or candidate_code alias)."""
    try:
        status_val = request.data.get('status')
        rejection_reason = request.data.get('rejection_reason')
        if not status_val:
            return Response({'success': False, 'error': 'status is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            applicant = Application.objects.get(id=applicant_id)
        except Application.DoesNotExist:
            try:
                applicant = Application.objects.get(id=applicant_id)
            except Application.DoesNotExist:
                return Response({'success': False, 'error': 'Applicant not found'}, status=status.HTTP_404_NOT_FOUND)

        applicant.status = status_val
        applicant.notes = rejection_reason or applicant.notes
        applicant.last_status_update = timezone.now()

        # Reset test scores if moved back to assessment
        if status_val == 'test':
            applicant.test_score = None
            applicant.test_completed_at = None

        applicant.save()

        return Response({'success': True, 'applicant': _serialize_hr_applicant(applicant)})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['PATCH', 'POST'])
def hr_update_applicant_resume(request, applicant_id):
    """Attach or update resume_url for an applicant (HR-side override)."""
    try:
        resume_url = request.data.get('resume_url') or request.data.get('resumeUrl')
        if not resume_url:
            return Response({'success': False, 'error': 'resume_url is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            applicant = Application.objects.get(id=applicant_id)
        except Application.DoesNotExist:
            return Response({'success': False, 'error': 'Applicant not found'}, status=status.HTTP_404_NOT_FOUND)

        applicant.resume_url = resume_url
        applicant.updated_at = timezone.now()
        applicant.save(update_fields=["resume_url", "updated_at"])

        return Response({'success': True, 'applicant': _serialize_hr_applicant(applicant)})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# User Profile APIs
# ============================================================================

@api_view(['GET'])
def get_user_profile(request, user_id):
    """Get complete user profile with skills, education, and work experience"""
    try:
        user = User.objects.prefetch_related('skills', 'education', 'work_experience', 'certificates', 'research', 'projects').get(id=user_id)
        serializer = UserProfileSerializer(user)
        return Response({
            'success': True,
            'user': serializer.data
        })
    except User.DoesNotExist:
        return Response({
            'success': False,
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['PUT'])
@require_authentication
def update_user_profile(request, user_id):
    """Update user profile information"""
    try:
        user = User.objects.get(id=user_id)
        
        # Update user fields
        data = request.data
        for field in ['first_name', 'last_name', 'phone', 'bio', 'avatar_url', 
                      'street_address', 'city_state', 'postal_code', 'country']:
            if field in data:
                setattr(user, field, data[field])
        
        user.save()
        
        serializer = UserSerializer(user)
        return Response({
            'success': True,
            'user': serializer.data
        })
    
    except User.DoesNotExist:
        return Response({
            'success': False,
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['POST'])
@require_authentication
def complete_onboarding(request):
    """
    Complete user onboarding:
    1. Update user profile details
    2. Add skills, education, and experience
    3. Set is_onboarded = True
    """
    try:
        user_id = request.user_obj.id
        user = User.objects.get(id=user_id)
        data = request.data
        
        # 1. Update basic info
        full_name = data.get('fullName', '')
        if full_name:
            parts = full_name.split(' ', 1)
            user.first_name = parts[0]
            if len(parts) > 1:
                user.last_name = parts[1]
        
        if data.get('phone'):
            user.phone = data.get('phone')
        
        if data.get('summary'):
            user.bio = data.get('summary')
            
        location = data.get('location')
        if location:
            # Simple assumption: "City, Country"
            parts = location.split(',')
            if len(parts) > 0:
                user.city_state = parts[0].strip()
            if len(parts) > 1:
                user.country = parts[-1].strip()
                
        # 2. Process Skills
        skills_text = data.get('skillsText', '')
        if skills_text:
            # Clear existing skills to avoid duplicates if retrying
            UserSkill.objects.filter(user=user).delete()
            
            skill_names = [s.strip() for s in skills_text.split(',') if s.strip()]
            for name in skill_names:
                # Basic inference of type (can be improved)
                skill_type = 'tool'
                if name.lower() in ['python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'ruby', 'go']:
                    skill_type = 'language'
                elif name.lower() in ['react', 'node', 'django', 'flask', 'vue', 'angular', 'spring']:
                    skill_type = 'framework'
                    
                UserSkill.objects.create(
                    user=user,
                    skill_name=name,
                    skill_type=skill_type,
                    proficiency_level='intermediate' # Default
                )

        # 3. Process Education
        education_data = data.get('education')
        edu_text = data.get('educationText', '')
        
        if education_data and isinstance(education_data, list):
            Education.objects.filter(user=user).delete()
            for edu_item in education_data:
                # { degree, institution, year, details }
                Education.objects.create(
                    user=user,
                    degree=edu_item.get('degree') or "Degree",
                    school=edu_item.get('institution') or "Institution",
                    description=f"Dates: {edu_item.get('year', '')}\n{edu_item.get('details', '')}",
                    start_date=timezone.now().date() # Placeholder
                )
        elif edu_text:
            Education.objects.filter(user=user).delete()
            lines = [l.strip() for l in edu_text.split('\n') if l.strip()]
            for line in lines:
                parts = line.split(' · ')
                if len(parts) < 2:
                    parts = line.split(',')
                    
                degree = parts[0].strip() if len(parts) > 0 else "Degree"
                school = parts[1].strip() if len(parts) > 1 else "Institution"
                dates = parts[2].strip() if len(parts) > 2 else ""
                
                Education.objects.create(
                    user=user,
                    degree=degree,
                    school=school,
                    description=f"Dates: {dates}", 
                    start_date=timezone.now().date()
                )

        # 4. Process Experience
        experience_data = data.get('experience')
        exp_text = data.get('experienceText', '')
        
        if experience_data and isinstance(experience_data, list):
            WorkExperience.objects.filter(user=user).delete()
            for exp_item in experience_data:
                # { title, organization, period, details }
                WorkExperience.objects.create(
                    user=user,
                    job_title=exp_item.get('title') or "Title",
                    company=exp_item.get('organization') or "Company",
                    description=f"Period: {exp_item.get('period', '')}\n{exp_item.get('details', '')}",
                    start_date=timezone.now().date() # Placeholder
                )
        elif exp_text:
            WorkExperience.objects.filter(user=user).delete()
            lines = [l.strip() for l in exp_text.split('\n') if l.strip()]
            for line in lines:
                parts = line.split(' · ')
                if len(parts) < 2:
                    parts = line.split(',')
                
                title = parts[0].strip() if len(parts) > 0 else "Title"
                company = parts[1].strip() if len(parts) > 1 else "Company"
                period = parts[2].strip() if len(parts) > 2 else ""
                
                WorkExperience.objects.create(
                    user=user,
                    job_title=title,
                    company=company,
                    start_date=timezone.now().date(),
                    description=f"Period: {period}"
                )

        # 5. Process Certificates
        certificates_data = data.get('certificates')
        if certificates_data and isinstance(certificates_data, list):
            Certificate.objects.filter(user=user).delete()
            for cert in certificates_data:
                Certificate.objects.create(
                    user=user,
                    name=cert.get('name') or "Certificate",
                    issuer=cert.get('issuer') or "",
                    year=cert.get('year') or ""
                )

        # 6. Process Research
        research_data = data.get('research')
        if research_data and isinstance(research_data, list):
            Research.objects.filter(user=user).delete()
            for res in research_data:
                Research.objects.create(
                    user=user,
                    title=res.get('title') or "Research Project",
                    organization=res.get('organization') or "",
                    period=res.get('period') or "",
                    details=res.get('details') or ""
                )

        # 7. Process Projects
        projects_data = data.get('projects')
        if projects_data and isinstance(projects_data, list):
            Project.objects.filter(user=user).delete()
            for proj in projects_data:
                Project.objects.create(
                    user=user,
                    title=proj.get('title') or "Project",
                    organization=proj.get('organization') or "",
                    period=proj.get('period') or "",
                    details=proj.get('details') or ""
                )

        # 8. Set Onboarded
        user.is_onboarded = True
        user.save()
        
        refresh = False
        # Return new token if user info changed significantly? No need usually.
        
        serializer = UserSerializer(user)
        return Response({
            'success': True,
            'user': serializer.data
        })

    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# User Skills APIs
# ============================================================================

@csrf_exempt
@api_view(['POST'])
@require_authentication
def add_user_skill(request, user_id):
    """Add a skill to user profile"""
    try:
        data = request.data
        skill = UserSkill.objects.create(
            user_id=user_id,
            skill_name=data.get('skill_name'),
            skill_type=data.get('skill_type'),
            proficiency_level=data.get('proficiency_level'),
            years_of_experience=data.get('years_of_experience')
        )
        
        serializer = UserSkillSerializer(skill)
        return Response({
            'success': True,
            'skill': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['DELETE'])
@require_authentication
def delete_user_skill(request, skill_id):
    """Delete a user skill"""
    try:
        skill = UserSkill.objects.get(id=skill_id)
        skill.delete()
        return Response({
            'success': True,
            'message': 'Skill deleted successfully'
        })
    except UserSkill.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Skill not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# Education APIs
# ============================================================================

@csrf_exempt
@api_view(['POST'])
@require_authentication
def add_education(request, user_id):
    """Add education to user profile"""
    try:
        data = request.data
        education = Education.objects.create(
            user_id=user_id,
            degree=data.get('degree'),
            school=data.get('school'),
            field_of_study=data.get('field_of_study'),
            start_date=data.get('start_date'),
            end_date=data.get('end_date'),
            is_current=data.get('is_current', False),
            gpa=data.get('gpa'),
            description=data.get('description')
        )
        
        serializer = EducationSerializer(education)
        return Response({
            'success': True,
            'education': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['PUT', 'DELETE'])
@require_authentication
def manage_education(request, education_id):
    """Update or delete education entry"""
    try:
        education = Education.objects.get(id=education_id)
        
        if request.method == 'PUT':
            data = request.data
            for field in ['degree', 'school', 'field_of_study', 'start_date', 
                          'end_date', 'is_current', 'gpa', 'description']:
                if field in data:
                    setattr(education, field, data[field])
            
            education.save()
            serializer = EducationSerializer(education)
            return Response({
                'success': True,
                'education': serializer.data
            })
        
        elif request.method == 'DELETE':
            education.delete()
            return Response({
                'success': True,
                'message': 'Education deleted successfully'
            })
    
    except Education.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Education not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# Work Experience APIs
# ============================================================================

@csrf_exempt
@api_view(['POST'])
@require_authentication
def add_work_experience(request, user_id):
    """Add work experience to user profile"""
    try:
        data = request.data
        experience = WorkExperience.objects.create(
            user_id=user_id,
            job_title=data.get('job_title'),
            company=data.get('company'),
            location=data.get('location'),
            start_date=data.get('start_date'),
            end_date=data.get('end_date'),
            is_current=data.get('is_current', False),
            description=data.get('description'),
            responsibilities=data.get('responsibilities', []),
            achievements=data.get('achievements', [])
        )
        
        serializer = WorkExperienceSerializer(experience)
        return Response({
            'success': True,
            'experience': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['PUT', 'DELETE'])
@require_authentication
def manage_work_experience(request, experience_id):
    """Update or delete work experience entry"""
    try:
        experience = WorkExperience.objects.get(id=experience_id)
        
        if request.method == 'PUT':
            data = request.data
            for field in ['job_title', 'company', 'location', 'start_date', 
                          'end_date', 'is_current', 'description', 'responsibilities', 'achievements']:
                if field in data:
                    setattr(experience, field, data[field])
            
            experience.save()
            serializer = WorkExperienceSerializer(experience)
            return Response({
                'success': True,
                'experience': serializer.data
            })
        
        elif request.method == 'DELETE':
            experience.delete()
            return Response({
                'success': True,
                'message': 'Work experience deleted successfully'
            })
    
    except WorkExperience.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Work experience not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# Skills API
# ============================================================================

@api_view(['GET'])
def get_available_skills(request):
    """Get list of available skills with optional filtering"""
    try:
        # Comprehensive skills list
        all_skills = [
            # Programming Languages
            "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "Swift", "Kotlin",
            "PHP", "Ruby", "Scala", "R", "MATLAB", "Perl", "Objective-C", "Dart", "Julia", "Haskell",
            
            # Web Development
            "React", "Angular", "Vue.js", "Next.js", "Node.js", "Express.js", "Django", "Flask", "FastAPI",
            "Spring Boot", "ASP.NET", "Laravel", "Ruby on Rails", "HTML", "CSS", "SASS", "LESS", "Bootstrap",
            "Tailwind CSS", "jQuery", "Redux", "MobX", "GraphQL", "REST API", "WebSockets",
            
            # Mobile Development
            "React Native", "Flutter", "Android", "iOS", "Xamarin", "Ionic", "SwiftUI",
            
            # Databases
            "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Cassandra", "Oracle", "Microsoft SQL Server",
            "SQLite", "DynamoDB", "Firebase", "Elasticsearch", "Neo4j", "CouchDB", "MariaDB",
            
            # Cloud & DevOps
            "AWS", "Azure", "Google Cloud Platform", "Docker", "Kubernetes", "Jenkins", "GitLab CI/CD",
            "GitHub Actions", "Terraform", "Ansible", "Chef", "Puppet", "CircleCI", "Travis CI",
            "Heroku", "DigitalOcean", "Netlify", "Vercel",
            
            # Data Science & ML
            "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Scikit-learn", "Keras", "Pandas",
            "NumPy", "SciPy", "Matplotlib", "Seaborn", "Jupyter", "Apache Spark", "Hadoop", "NLP",
            "Computer Vision", "Neural Networks", "Data Analysis", "Data Visualization", "Statistical Analysis",
            
            # Testing
            "Jest", "Mocha", "Chai", "Pytest", "JUnit", "TestNG", "Selenium", "Cypress", "Playwright",
            "Postman", "Unit Testing", "Integration Testing", "E2E Testing", "TDD", "BDD",
            
            # Version Control & Collaboration
            "Git", "GitHub", "GitLab", "Bitbucket", "SVN", "Mercurial", "Jira", "Confluence", "Trello",
            "Asana", "Slack", "Microsoft Teams",
            
            # Design & UI/UX
            "Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator", "InVision", "Zeplin", "UI Design",
            "UX Design", "Wireframing", "Prototyping", "User Research", "Responsive Design",
            
            # Other Technical Skills
            "Microservices", "System Design", "API Development", "Agile", "Scrum", "Kanban", "CI/CD",
            "Linux", "Unix", "Bash", "Shell Scripting", "Networking", "Security", "Cybersecurity",
            "Blockchain", "Solidity", "Cryptography", "OAuth", "JWT", "WebRTC",
            
            # Soft Skills
            "Leadership", "Communication", "Problem Solving", "Critical Thinking", "Team Collaboration",
            "Project Management", "Time Management", "Analytical Skills", "Creativity", "Adaptability",
            "Public Speaking", "Mentoring", "Strategic Planning", "Conflict Resolution",
            
            # Business & Analytics
            "Business Analysis", "Data Analytics", "Power BI", "Tableau", "Excel", "Google Analytics",
            "SEO", "SEM", "Digital Marketing", "Content Marketing", "Social Media Marketing",
            
            # Other Technologies
            "IoT", "AR/VR", "Unity", "Unreal Engine", "WebGL", "Three.js", "D3.js",
            "Socket.io", "RabbitMQ", "Kafka", "gRPC", "Microservices Architecture"
        ]
        
        # Filter by search query if provided
        search_query = request.GET.get('search', '').strip()
        if search_query:
            filtered_skills = [
                skill for skill in all_skills 
                if search_query.lower() in skill.lower()
            ]
        else:
            filtered_skills = all_skills
        
        # Limit results if requested
        limit = request.GET.get('limit')
        if limit:
            try:
                filtered_skills = filtered_skills[:int(limit)]
            except ValueError:
                pass
        
        return Response({
            'success': True,
            'count': len(filtered_skills),
            'skills': filtered_skills
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# Semantic Job Recommendation Engine
# ============================================================================

_embedding_model = None

def _get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        from sentence_transformers import SentenceTransformer
        _embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
    return _embedding_model


_TECH_SEED_GROUPS = [
    # Frontend
    ['react', 'reactjs', 'react.js', 'frontend', 'front-end', 'ui development'],
    ['angular', 'angularjs', 'angular.js', 'frontend', 'front-end'],
    ['vue', 'vuejs', 'vue.js', 'frontend', 'front-end'],
    ['javascript', 'js', 'ecmascript', 'es6', 'frontend'],
    ['typescript', 'ts', 'javascript', 'js'],
    ['html', 'html5', 'frontend', 'web development'],
    ['css', 'css3', 'sass', 'scss', 'less', 'styling', 'frontend'],
    ['next.js', 'nextjs', 'react', 'ssr', 'frontend'],
    # Backend
    ['node', 'nodejs', 'node.js', 'express', 'backend', 'server-side', 'javascript'],
    ['python', 'django', 'flask', 'fastapi', 'backend', 'scripting'],
    ['django', 'python', 'backend', 'rest api', 'web framework'],
    ['flask', 'python', 'backend', 'rest api', 'microservices'],
    ['java', 'spring', 'spring boot', 'jvm', 'backend', 'enterprise'],
    ['spring', 'spring boot', 'java', 'backend', 'microservices'],
    ['ruby', 'rails', 'ruby on rails', 'backend'],
    ['php', 'laravel', 'backend', 'web development'],
    ['go', 'golang', 'backend', 'microservices', 'distributed systems'],
    ['rust', 'systems programming', 'backend'],
    ['c#', 'dotnet', '.net', 'asp.net', 'backend', 'microsoft'],
    ['c++', 'systems programming', 'embedded', 'performance'],
    # Databases
    ['sql', 'mysql', 'postgresql', 'database', 'rdbms', 'relational database'],
    ['mysql', 'sql', 'database', 'rdbms'],
    ['postgresql', 'postgres', 'sql', 'database', 'rdbms'],
    ['mongodb', 'nosql', 'database', 'document database'],
    ['redis', 'caching', 'in-memory', 'nosql'],
    ['elasticsearch', 'search', 'nosql', 'database', 'kibana'],
    ['firebase', 'nosql', 'database', 'real-time', 'google cloud'],
    ['dynamodb', 'aws', 'nosql', 'database'],
    # DevOps / Cloud
    ['docker', 'containerization', 'devops', 'containers', 'kubernetes', 'microservices'],
    ['kubernetes', 'k8s', 'orchestration', 'devops', 'containers', 'docker'],
    ['aws', 'amazon web services', 'cloud', 'devops', 'ec2', 's3', 'lambda'],
    ['azure', 'microsoft azure', 'cloud', 'devops'],
    ['gcp', 'google cloud', 'google cloud platform', 'cloud', 'devops'],
    ['jenkins', 'ci/cd', 'devops', 'automation', 'pipeline'],
    ['terraform', 'infrastructure as code', 'iac', 'devops', 'cloud'],
    ['ansible', 'configuration management', 'devops', 'automation'],
    ['linux', 'unix', 'bash', 'shell', 'devops', 'systems'],
    # Data Science / ML / AI
    ['machine learning', 'ml', 'ai', 'artificial intelligence', 'data science', 'deep learning', 'neural network'],
    ['deep learning', 'neural network', 'ml', 'ai', 'tensorflow', 'pytorch'],
    ['tensorflow', 'deep learning', 'ml', 'machine learning', 'keras', 'python'],
    ['pytorch', 'deep learning', 'ml', 'machine learning', 'python'],
    ['data science', 'machine learning', 'statistics', 'python', 'data analysis', 'analytics'],
    ['nlp', 'natural language processing', 'text processing', 'ml', 'ai'],
    ['computer vision', 'cv', 'image processing', 'ml', 'ai', 'deep learning', 'opencv'],
    ['pandas', 'python', 'data analysis', 'data science'],
    ['spark', 'apache spark', 'big data', 'data engineering', 'scala'],
    ['hadoop', 'big data', 'data engineering', 'mapreduce'],
    ['tableau', 'data visualization', 'bi', 'business intelligence', 'analytics'],
    ['power bi', 'data visualization', 'bi', 'business intelligence', 'analytics', 'microsoft'],
    # Mobile
    ['ios', 'swift', 'swiftui', 'objective-c', 'xcode', 'mobile development'],
    ['android', 'kotlin', 'java', 'mobile development'],
    ['flutter', 'dart', 'mobile development', 'cross-platform'],
    ['react native', 'react', 'mobile development', 'cross-platform'],
    # Architecture & Methodology
    ['microservices', 'distributed systems', 'docker', 'kubernetes', 'api', 'backend'],
    ['rest api', 'restful', 'api', 'backend', 'web services'],
    ['graphql', 'api', 'backend', 'query language'],
    ['agile', 'scrum', 'kanban', 'project management', 'sprint'],
    ['devops', 'ci/cd', 'docker', 'kubernetes', 'cloud', 'automation'],
]


def _ensure_nltk_wordnet():
    """Download NLTK WordNet corpus if not already present (runs once)."""
    import nltk
    for resource in ['wordnet', 'omw-1.4']:
        try:
            nltk.data.find(f'corpora/{resource}')
        except LookupError:
            nltk.download(resource, quiet=True)


def _build_tech_synonyms():
    """
    Build the TECH_SYNONYMS dict dynamically using two layers:

    Layer 1 – Seed groups (_TECH_SEED_GROUPS):
        Bidirectional expansion within each group so every term in a cluster
        is linked to every other term in that cluster.

    Layer 2 – NLTK WordNet:
        For each canonical term, look up WordNet synsets and add any lemma
        names found there. Limited to the top-2 synsets to avoid noise from
        unrelated word senses (e.g. 'python' the snake).

    Returns:
        dict[str, set[str]]: canonical term → set of related terms.
    """
    _ensure_nltk_wordnet()
    import nltk
    from nltk.corpus import wordnet

    synonyms_dict: dict = {}

    # --- Layer 1: bidirectional seed-group expansion ---
    for group in _TECH_SEED_GROUPS:
        group_set = {term.lower() for term in group}
        for term in group:
            term_lower = term.lower()
            synonyms_dict.setdefault(term_lower, set())
            synonyms_dict[term_lower] |= group_set - {term_lower}

    # --- Layer 2: WordNet augmentation ---
    for term in list(synonyms_dict.keys()):
        # Convert term to a WordNet-friendly identifier
        wn_key = term.replace('.', '').replace('-', '_').replace(' ', '_')
        try:
            synsets = wordnet.synsets(wn_key)
            for synset in synsets[:2]:          # top-2 senses only
                for lemma in synset.lemmas():
                    wordnet_syn = lemma.name().replace('_', ' ').lower()
                    if wordnet_syn != term and len(wordnet_syn) > 2:
                        synonyms_dict[term].add(wordnet_syn)
        except Exception:
            pass  # silently skip if WordNet has no entry for a tech term

    return synonyms_dict


# Built once at module load time; reused on every recommendation request.
TECH_SYNONYMS = _build_tech_synonyms()


def _expand_terms_with_synonyms(text: str) -> str:
    """
    Expand the given text with semantic synonyms.
    Finds all known technology terms in the text and appends their synonyms.
    This boosts recall for semantically related but differently named skills.
    """
    text_lower = text.lower()
    extra_terms = set()

    for canonical, synonyms in TECH_SYNONYMS.items():
        # Check if the canonical term or any synonym is in the text
        all_terms = {canonical} | synonyms
        for term in all_terms:
            if term in text_lower:
                # Add all related terms to expand the representation
                extra_terms |= all_terms
                break

    if extra_terms:
        return text + ' ' + ' '.join(extra_terms)
    return text


def _cosine_similarity_np(vec_a, vec_b) -> float:
    """
    Compute cosine similarity between two dense numpy embedding vectors.
    Returns a float in [0, 1].
    """
    import numpy as np
    norm_a = np.linalg.norm(vec_a)
    norm_b = np.linalg.norm(vec_b)
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return float(np.dot(vec_a, vec_b) / (norm_a * norm_b))


def _build_candidate_text(user) -> str:
    """
    Combine all user profile data into a single rich text representation
    for semantic matching: skills, job titles, descriptions, education, bio, etc.
    """
    parts = []

    # Bio / summary (high signal)
    if user.bio:
        parts.append(user.bio)
        parts.append(user.bio)  # Double weight bio

    # Skills (highest signal — repeat 3x for weighting)
    skills = user.skills.all()
    skill_names = [s.skill_name for s in skills]
    if skill_names:
        skill_text = ' '.join(skill_names)
        parts.append(skill_text)
        parts.append(skill_text)
        parts.append(skill_text)

    # Work experience
    experiences = user.work_experience.all()
    for exp in experiences:
        if exp.job_title:
            parts.append(exp.job_title)
        if exp.description:
            parts.append(exp.description)
        if exp.responsibilities:
            if isinstance(exp.responsibilities, list):
                parts.extend(exp.responsibilities)
            else:
                parts.append(str(exp.responsibilities))
        if exp.achievements:
            if isinstance(exp.achievements, list):
                parts.extend(exp.achievements)

    # Education
    education = user.education.all()
    for edu in education:
        if edu.degree:
            parts.append(edu.degree)
        if edu.field_of_study:
            parts.append(edu.field_of_study)
        if edu.description:
            parts.append(edu.description)

    # Projects
    projects = user.projects.all()
    for proj in projects:
        if proj.title:
            parts.append(proj.title)
        if proj.details:
            parts.append(proj.details)

    # Research
    research = user.research.all()
    for res in research:
        if res.title:
            parts.append(res.title)
        if res.details:
            parts.append(res.details)

    # Certificates
    certs = user.certificates.all()
    for cert in certs:
        if cert.name:
            parts.append(cert.name)

    # Return the clean combined text — the embedding model handles semantic
    # similarity natively; synonym expansion is NOT needed and actually
    # pollutes similarity by adding unrelated generic terms.
    return ' '.join(filter(None, parts))


def _build_job_text(job) -> str:
    """Build a rich text representation for a single job posting."""
    parts = []

    if job.title:
        # Title is highest signal — repeat 3x
        parts.append(job.title)
        parts.append(job.title)
        parts.append(job.title)

    if job.description:
        parts.append(job.description)

    if job.requirements:
        if isinstance(job.requirements, list):
            parts.extend(job.requirements)
        else:
            parts.append(str(job.requirements))

    if job.responsibilities:
        if isinstance(job.responsibilities, list):
            parts.extend(job.responsibilities)

    if job.benefits:
        if isinstance(job.benefits, list):
            parts.extend(job.benefits)

    # Same as candidate text: embedding model handles semantics natively.
    return ' '.join(filter(None, parts))


def _compute_skill_overlap_bonus(candidate_skills: list, job_text: str) -> float:
    """
    Compute a direct skill overlap bonus score (0-1).
    This gives extra weight to exact/near-exact skill name matches.
    """
    if not candidate_skills:
        return 0.0

    job_lower = job_text.lower()
    matches = 0
    for skill in candidate_skills:
        skill_lower = skill.lower()
        # Check canonical name and its synonyms
        if skill_lower in job_lower:
            matches += 1
        else:
            # Check synonyms
            synonyms = TECH_SYNONYMS.get(skill_lower, set())
            if any(syn in job_lower for syn in synonyms):
                matches += 0.7  # Partial credit for synonym match

    return min(matches / len(candidate_skills), 1.0)


@api_view(['GET'])
def get_job_recommendations(request):
    
    try:
        user_id = request.GET.get('user_id')
        top_n = int(request.GET.get('top_n', 10))

        if not user_id:
            return Response({
                'success': False,
                'error': 'user_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Fetch user with all related profile data
        try:
            user = User.objects.prefetch_related(
                'skills', 'work_experience', 'education',
                'projects', 'research', 'certificates'
            ).get(id=user_id)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Build candidate profile text
        candidate_text = _build_candidate_text(user)

        # Check if profile has meaningful content
        if len(candidate_text.strip()) < 20:
            # Not enough profile data — return jobs sorted by date instead
            jobs = Job.objects.filter(is_active=True).select_related('company').order_by('-posted_date')[:top_n]
            serializer = JobSerializer(jobs, many=True, context={'request': request})
            return Response({
                'success': True,
                'has_profile': False,
                'message': 'Complete your profile for personalized recommendations',
                'recommendations': [
                    # No relevance_score or match_label — profile is empty,
                    # so any score would be meaningless. Frontend should
                    # hide the score badge when has_profile is False.
                    {**job_data, 'relevance_score': None, 'match_label': None}
                    for job_data in serializer.data
                ]
            })

        # Fetch all active jobs
        all_jobs = list(Job.objects.filter(is_active=True).select_related('company').order_by('-posted_date'))

        if not all_jobs:
            return Response({
                'success': True,
                'has_profile': True,
                'recommendations': []
            })

        # Build job texts
        job_texts = [_build_job_text(job) for job in all_jobs]

        # Get candidate skill names for overlap bonus
        candidate_skill_names = [s.skill_name for s in user.skills.all()]

        # Encode candidate and all jobs into dense embedding vectors
        model = _get_embedding_model()
        corpus = [candidate_text] + job_texts
        embeddings = model.encode(corpus, convert_to_numpy=True, show_progress_bar=False)

        candidate_vec = embeddings[0]
        job_vecs = embeddings[1:]

        # Score each job
        scored_jobs = []
        for i, job in enumerate(all_jobs):
            # Raw cosine similarity from sentence embeddings.
            # 'all-MiniLM-L6-v2' produces values roughly in [0.0, 1.0] for
            # real-world text; do NOT shift or amplify — use the value as-is.
            cosine_sim = _cosine_similarity_np(candidate_vec, job_vecs[i])
            # Clamp to [0, 1] — cosine can technically be slightly negative
            cosine_sim = max(cosine_sim, 0.0)

            # Direct skill overlap bonus (0-1)
            overlap_bonus = _compute_skill_overlap_bonus(candidate_skill_names, job_texts[i])

            # Combined score: 50% semantic embedding similarity + 50% exact skill overlap
            # Skills now carry equal weight — both components are in [0, 1]
            combined = (cosine_sim * 0.50) + (overlap_bonus * 0.50)

            # Honest linear scaling to 0-100 — no artificial amplification
            relevance_score = round(min(max(combined * 100, 0), 100))

            scored_jobs.append((relevance_score, job))

        # Sort by score descending
        scored_jobs.sort(key=lambda x: x[0], reverse=True)

        # NOTE: Forced normalization ("top score always ≥ 70") is intentionally
        # removed. It created false confidence — a poor match profile would
        # still display 70%+ scores. Scores are now genuine (0-100).

        # Take top N
        top_jobs = scored_jobs[:top_n]

        # Determine match label based on score
        def get_match_label(score: int) -> str:
            if score >= 85:
                return 'Excellent Match'
            elif score >= 70:
                return 'Strong Match'
            elif score >= 55:
                return 'Good Match'
            elif score >= 40:
                return 'Fair Match'
            else:
                return 'Potential Match'

        # Serialize and attach scores
        result_jobs = []
        for score, job in top_jobs:
            serializer = JobSerializer(job, context={'request': request})
            job_data = serializer.data
            job_data['relevance_score'] = score
            job_data['match_label'] = get_match_label(score)
            result_jobs.append(job_data)

        return Response({
            'success': True,
            'has_profile': True,
            'candidate_name': f"{user.first_name or ''} {user.last_name or ''}".strip() or user.email,
            'total_jobs_analyzed': len(all_jobs),
            'recommendations': result_jobs
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# Interview Bot APIs
# ============================================================================

@csrf_exempt
@api_view(['GET'])
@require_authentication
def interview_get_questions(request):
    """
    Generate interview questions for a candidate's application.
    Only allowed if application status is 'interview'.
    GET /api/interview/questions/?application_id=<uuid>
    """
    try:
        user = request.user_obj

        application_id = request.GET.get('application_id')
        if not application_id:
            return Response({'success': False, 'error': 'application_id required'}, status=400)

        application = Application.objects.select_related('job').get(id=application_id, user=user)

        if application.status != 'interview':
            return Response({'success': False, 'error': 'Interview not available for this application'}, status=403)

        if application.interview_score is not None:
            return Response({'success': False, 'error': 'Interview already completed', 'already_completed': True}, status=400)

        # Check interview deadline
        if application.interview_deadline and timezone.now() > application.interview_deadline:
            # Auto-reject and update status
            application.status = 'rejected'
            application.notes = 'Interview deadline passed (2-day window expired).'
            application.save(update_fields=['status', 'notes', 'updated_at'])
            ApplicationTimeline.objects.create(
                application=application,
                event_type='status_change',
                old_status='interview',
                new_status='rejected',
                title='Interview Deadline Expired',
                description='Candidate did not complete the interview within the 2-day window.'
            )
            return Response({
                'success': False,
                'error': 'Interview deadline has passed. You had 2 days to complete the interview.',
                'deadline_expired': True
            }, status=403)

        job_title = application.job_title
        requirements = application.job.requirements if application.job else []

        from interview.service import generate_interview_questions
        questions = generate_interview_questions(job_title, requirements, n=7)

        return Response({'success': True, 'questions': questions, 'job_title': job_title})

    except Application.DoesNotExist:
        return Response({'success': False, 'error': 'Application not found'}, status=404)
    except Exception as e:
        import traceback; traceback.print_exc()
        return Response({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
@api_view(['POST'])
def interview_tts(request):
    """
    Convert a question text to audio (MP3).
    POST /api/interview/tts/
    Body: { "text": "..." }
    Returns: audio/mpeg binary
    """
    try:
        text = request.data.get('text', '').strip()
        if not text:
            return Response({'success': False, 'error': 'text required'}, status=400)

        from interview.service import text_to_speech
        from django.http import HttpResponse
        audio_bytes = text_to_speech(text)
        return HttpResponse(audio_bytes, content_type='audio/mpeg')

    except Exception as e:
        import traceback; traceback.print_exc()
        return Response({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
@api_view(['POST'])
def interview_stt(request):
    """
    Transcribe candidate's audio answer to text using Whisper.
    POST /api/interview/stt/
    Body: multipart/form-data with 'audio' file
    Returns: { "text": "..." }
    """
    try:
        audio_file = request.FILES.get('audio')
        if not audio_file:
            return Response({'success': False, 'error': 'audio file required'}, status=400)

        audio_bytes = audio_file.read()
        content_type = audio_file.content_type or ''
        print(f"[STT] Received audio: size={len(audio_bytes)}, content_type={content_type}, name={audio_file.name}")

        if 'webm' in content_type or audio_file.name.endswith('.webm'):
            fmt = 'webm'
        elif 'wav' in content_type or audio_file.name.endswith('.wav'):
            fmt = 'wav'
        elif 'mp4' in content_type or audio_file.name.endswith('.mp4'):
            fmt = 'mp4'
        elif 'ogg' in content_type or audio_file.name.endswith('.ogg'):
            fmt = 'ogg'
        else:
            fmt = 'webm'

        print(f"[STT] Using format: {fmt}")
        from interview.service import speech_to_text
        transcript = speech_to_text(audio_bytes, fmt)
        print(f"[STT] Transcript result: {repr(transcript)}")

        return Response({'success': True, 'text': transcript})

    except Exception as e:
        import traceback; traceback.print_exc()
        return Response({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
@api_view(['POST'])
@require_authentication
def interview_submit(request):
    """
    Submit full interview transcript, score all answers, save results.
    POST /api/interview/submit/
    Body: {
        "application_id": "...",
        "transcript": [
            {"question": "...", "answer": "..."},
            ...
        ]
    }
    """
    try:
        user = request.user_obj

        application_id = request.data.get('application_id')
        transcript = request.data.get('transcript', [])

        if not application_id or not transcript:
            return Response({'success': False, 'error': 'application_id and transcript required'}, status=400)

        application = Application.objects.get(id=application_id, user=user)

        if application.interview_score is not None:
            return Response({'success': False, 'error': 'Interview already submitted'}, status=400)

        from interview.service import score_answer, calculate_final_score

        requirements = list(application.job.requirements) if application.job and application.job.requirements else []

        scored_transcript = []
        for item in transcript:
            question = item.get('question', '')
            answer = item.get('answer', '')
            scores = score_answer(question, answer, application.job_title, requirements)
            scored_transcript.append({
                'question': question,
                'answer': answer,
                'scores': scores
            })

        final_score = calculate_final_score([item['scores'] for item in scored_transcript])

        old_status = application.status
        application.interview_score = final_score
        application.interview_transcript = scored_transcript
        application.interview_completed_at = timezone.now()
        application.status = 'reviewing'
        application.save()

        ApplicationTimeline.objects.create(
            application=application,
            event_type='interview_completed',
            old_status=old_status,
            new_status='reviewing',
            title=f'Interview Completed - {final_score:.1f}%',
            description=f'AI interview completed. Score: {final_score:.1f}%. Application moved to HR review.'
        )

        return Response({
            'success': True,
            'interview_score': final_score,
            'message': 'Interview submitted successfully. HR will review your application.'
        })

    except Application.DoesNotExist:
        return Response({'success': False, 'error': 'Application not found'}, status=404)
    except Exception as e:
        import traceback; traceback.print_exc()
        return Response({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
@api_view(['POST'])
@require_authentication
def interview_upload_video(request):
    """
    Upload interview video — saves permanently to media/interviews/,
    runs confidence analysis, stores recording URL and confidence score.
    POST /api/interview/upload-video/
    Body: multipart/form-data with 'video' file and 'application_id'
    """
    try:
        user = request.user_obj
        application_id = request.data.get('application_id')
        video_file = request.FILES.get('video')

        if not application_id or not video_file:
            return Response({'success': False, 'error': 'application_id and video required'}, status=400)

        application = Application.objects.get(id=application_id, user=user)

        video_bytes = video_file.read()
        suffix = '.webm'
        if video_file.name.endswith('.mp4'):
            suffix = '.mp4'

        # ── Save video permanently ────────────────────────────────────────
        import uuid as uuid_lib
        from pathlib import Path as FPath
        import subprocess
        interviews_dir = FPath(settings.MEDIA_ROOT) / 'interviews'
        interviews_dir.mkdir(parents=True, exist_ok=True)

        # Save raw upload first
        raw_filename = f"{uuid_lib.uuid4()}_{application_id}_raw{suffix}"
        raw_path = interviews_dir / raw_filename
        with open(raw_path, 'wb') as f:
            f.write(video_bytes)

        # Remux with ffmpeg to inject duration metadata (fixes seek bar)
        final_filename = f"{uuid_lib.uuid4()}_{application_id}{suffix}"
        final_path = interviews_dir / final_filename
        try:
            subprocess.run(
                ['ffmpeg', '-i', str(raw_path), '-c', 'copy', str(final_path), '-y'],
                capture_output=True, timeout=60
            )
            raw_path.unlink(missing_ok=True)  # remove raw file
            video_path = final_path
        except Exception:
            # ffmpeg failed — use raw file as fallback
            raw_path.rename(final_path)
            video_path = final_path

        recording_url = request.build_absolute_uri(f"{settings.MEDIA_URL}interviews/{final_filename}")

        # ── Run confidence analysis ───────────────────────────────────────
        from interview.confidence import score_confidence_from_video
        result = score_confidence_from_video(str(video_path))
        # ── Save to DB ────────────────────────────────────────────────────
        application.confidence_score = result['confidence_score']
        application.interview_recording_url = recording_url

        if application.interview_transcript:
            from interview.service import calculate_final_score
            scored_answers = [item.get('scores', {}) for item in application.interview_transcript]
            new_final = calculate_final_score(scored_answers, confidence_score=result['confidence_score'])
            application.interview_score = new_final

        application.save(update_fields=['confidence_score', 'interview_recording_url', 'interview_score'])

        return Response({
            'success': True,
            'confidence_score': result['confidence_score'],
            'recording_url': recording_url,
            'breakdown': result,
        })

    except Application.DoesNotExist:
        return Response({'success': False, 'error': 'Application not found'}, status=404)
    except Exception as e:
        import traceback; traceback.print_exc()
        return Response({'success': False, 'error': str(e)}, status=500)


# ============================================================================
# HR Company Profile APIs
# ============================================================================

@csrf_exempt
@api_view(['GET'])
def hr_get_company_info(request):
    """Get information for the default company (Loop)."""
    try:
        company, _ = Company.objects.get_or_create(name="Loop", defaults={'logo_url': '/loop.png'})
        return Response({
            'success': True,
            'company': {
                'id': str(company.id),
                'name': company.name,
                'logo_url': company.logo_url
            }
        })
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
@api_view(['POST'])
def hr_update_company_logo(request):
    """Update the logo for the default company (Loop) via file upload or URL."""
    try:
        company, _ = Company.objects.get_or_create(name="Loop", defaults={'logo_url': '/loop.png'})
        
        logo_file = request.FILES.get('logo')
        if logo_file:
            import os
            import uuid
            from django.core.files.storage import default_storage
            
            # Ensure the directory exists
            logos_dir = os.path.join(settings.MEDIA_ROOT, 'company_logos')
            if not os.path.exists(logos_dir):
                os.makedirs(logos_dir)
                
            ext = os.path.splitext(logo_file.name)[1]
            filename = f"company_logos/{uuid.uuid4()}{ext}"
            saved_path = default_storage.save(filename, logo_file)
            logo_url = request.build_absolute_uri(settings.MEDIA_URL + saved_path)
            company.logo_url = logo_url
        else:
            logo_url = request.data.get('logo_url')
            if logo_url:
                company.logo_url = logo_url
            else:
                return Response({'success': False, 'error': 'No logo file or URL provided'}, status=400)
        
        company.save(update_fields=['logo_url', 'updated_at'])
        
        return Response({
            'success': True,
            'message': 'Company logo updated successfully',
            'logo_url': company.logo_url
        })
    except Exception as e:
        import traceback; traceback.print_exc()
        return Response({'success': False, 'error': str(e)}, status=500)

