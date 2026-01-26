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

# Add backend directory to path to import test_generator
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

cv_parser_dir = backend_dir / "CV-Parser"
if cv_parser_dir.exists():
    sys.path.insert(0, str(cv_parser_dir))

from test_generator.service import TestGeneratorService
from test_generator.config import TEST_COMPOSITIONS, CS_DISTRIBUTION
from resume_parser import parse_resume

from .models import (
    User, UserSkill, Education, WorkExperience, Certificate, Research, Project, Job, SavedJob, 
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
    Accept a PDF upload, run the CV parser, and return structured data.
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
        return Response({"success": True, "data": parsed})
    except Exception as exc:
        return Response({"success": False, "error": str(exc)}, status=500)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


def get_question_type(expertise: str, question_number: int) -> str:
    """
    Determine the question type based on expertise and question number.
    Uses TEST_COMPOSITIONS to determine which category a question belongs to.
    """
    if expertise not in TEST_COMPOSITIONS:
        return "Test"
    
    composition = TEST_COMPOSITIONS[expertise]
    current_pos = 1
    
    # Go through each category in order
    for category, count in composition.items():
        end_pos = current_pos + count - 1
        
        if current_pos <= question_number <= end_pos:
            # If it's CS category, need to determine subcategory
            if category == "cs":
                cs_current_pos = current_pos
                # Go through CS subcategories
                for subcategory, sub_count in CS_DISTRIBUTION.items():
                    cs_end_pos = cs_current_pos + sub_count - 1
                    if cs_current_pos <= question_number <= cs_end_pos:
                        return subcategory
                    cs_current_pos = cs_end_pos + 1
                return "CS"  # Fallback
            else:
                # Capitalize first letter for display
                return category.capitalize()
        
        current_pos = end_pos + 1
    
    return "Test"  # Fallback


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
            
            # Determine question type based on position
            question_type = get_question_type(expertise, idx)
            
            formatted_questions.append({
                'id': idx,
                'question': question_text,
                'options': options,
                'correctAnswer': correct_answer,  # included for scoring on frontend
                'questionType': question_type  # Category/subject for display
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
            
            application = Application.objects.create(
                user_id=user_id,
                job_id=job_id if job_id else None,
                job_title=data.get('job_title'),
                company_name=data.get('company_name'),
                company_logo_color=data.get('company_logo_color', '#6366f1'),
                company_logo_initial=data.get('company_logo_initial', ''),
                location=data.get('location', ''),
                salary_range=data.get('salary_range', ''),
                status=data.get('status', 'applied'),
                cover_letter=data.get('cover_letter', ''),
                resume_url=data.get('resume_url', ''),
                notes=data.get('notes', '')
            )
            
            # Create initial timeline entry
            ApplicationTimeline.objects.create(
                application=application,
                event_type='status_change',
                new_status='applied',
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

