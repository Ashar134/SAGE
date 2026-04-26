from rest_framework import serializers
from .models import (
    User, UserSkill, Education, WorkExperience, Certificate, Research, Project, Company, Job,
    SavedJob, Application, ApplicationTimeline
)


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'phone', 'bio',
            'avatar_url', 'street_address', 'city_state', 'postal_code',
            'country', 'is_onboarded', 'created_at', 'updated_at', 'last_login'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserSkillSerializer(serializers.ModelSerializer):
    """Serializer for UserSkill model"""
    class Meta:
        model = UserSkill
        fields = [
            'id', 'user', 'skill_name', 'skill_type', 'proficiency_level',
            'years_of_experience', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EducationSerializer(serializers.ModelSerializer):
    """Serializer for Education model"""
    class Meta:
        model = Education
        fields = [
            'id', 'user', 'degree', 'school', 'field_of_study', 'start_date',
            'end_date', 'is_current', 'gpa', 'description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class WorkExperienceSerializer(serializers.ModelSerializer):
    """Serializer for WorkExperience model"""
    class Meta:
        model = WorkExperience
        fields = [
            'id', 'user', 'job_title', 'company', 'location', 'start_date',
            'end_date', 'is_current', 'description', 'responsibilities',
            'achievements', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CertificateSerializer(serializers.ModelSerializer):
    """Serializer for Certificate model"""
    class Meta:
        model = Certificate
        fields = ['id', 'user', 'name', 'issuer', 'year', 'link', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ResearchSerializer(serializers.ModelSerializer):
    """Serializer for Research model"""
    class Meta:
        model = Research
        fields = ['id', 'user', 'title', 'organization', 'period', 'details', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for Project model"""
    class Meta:
        model = Project
        fields = ['id', 'user', 'title', 'organization', 'period', 'details', 'link', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CompanySerializer(serializers.ModelSerializer):
    """Serializer for Company model"""
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'logo_url', 'logo_color', 'logo_initial', 'industry',
            'company_size', 'website_url', 'description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class JobSerializer(serializers.ModelSerializer):
    """Serializer for Job model"""
    company = CompanySerializer(read_only=True)
    is_saved = serializers.SerializerMethodField()
    
    class Meta:
        model = Job
        fields = [
            'id', 'company', 'title', 'company_name', 'location', 'description',
            'job_type', 'work_mode', 'salary_min', 'salary_max', 'salary_currency',
            'requirements', 'responsibilities', 'benefits', 'selection_process', 'is_remote', 'posted_date',
            'expires_at', 'source_url', 'is_active', 'created_at', 'updated_at', 'is_saved'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_is_saved(self, obj):
        """Check if the job is saved by the current user"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            user_id = request.GET.get('user_id')
            if user_id:
                return SavedJob.objects.filter(user_id=user_id, job=obj).exists()
        return False


class SavedJobSerializer(serializers.ModelSerializer):
    """Serializer for SavedJob model"""
    job = JobSerializer(read_only=True)
    job_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = SavedJob
        fields = ['id', 'user', 'job', 'job_id', 'notes', 'saved_at']
        read_only_fields = ['id', 'saved_at']


class ApplicationTimelineSerializer(serializers.ModelSerializer):
    """Serializer for ApplicationTimeline model"""
    class Meta:
        model = ApplicationTimeline
        fields = [
            'id', 'application', 'event_type', 'old_status', 'new_status',
            'title', 'description', 'event_date', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ApplicationSerializer(serializers.ModelSerializer):
    """Serializer for Application model"""
    timeline = ApplicationTimelineSerializer(many=True, read_only=True)
    test_deadline = serializers.SerializerMethodField()
    company_logo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Application
        fields = [
            'id', 'user', 'job', 'job_title', 'company_name', 'company_logo_color',
            'company_logo_initial', 'company_logo_url', 'location', 'salary_range', 'status',
            'interview_type', 'interview_date', 'interview_notes', 'offer_deadline',
            'test_score', 'test_completed_at', 'test_deadline',
            # Interview results
            'interview_score', 'interview_transcript', 'interview_completed_at',
            'confidence_score', 'interview_recording_url', 'interview_deadline',
            'applied_at', 'last_status_update', 'cover_letter', 'resume_url', 'notes',
            'created_at', 'updated_at', 'timeline'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_status_update']

    def get_company_logo_url(self, obj):
        if obj.job and obj.job.company:
            return obj.job.company.logo_url
        return '/loop.png'

    def get_test_deadline(self, obj):
        if not hasattr(obj, 'job') or obj.job is None:
            return None
            
        test_deadline_days = getattr(obj.job, 'test_deadline_days', 3)
        if getattr(obj, 'applied_at', None):
            from datetime import timedelta
            deadline = obj.applied_at + timedelta(days=test_deadline_days)
            return deadline.isoformat()
        return None





class UserProfileSerializer(serializers.ModelSerializer):
    """Complete user profile with related data"""
    skills = UserSkillSerializer(many=True, read_only=True)
    education = EducationSerializer(many=True, read_only=True)
    work_experience = WorkExperienceSerializer(many=True, read_only=True)
    certificates = CertificateSerializer(many=True, read_only=True)
    research = ResearchSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'phone', 'bio',
            'avatar_url', 'street_address', 'city_state', 'postal_code',
            'country', 'is_onboarded', 'skills', 'education', 'work_experience',
            'certificates', 'research', 'projects',
            'created_at', 'updated_at', 'last_login'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
