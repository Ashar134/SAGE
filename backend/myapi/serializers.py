from rest_framework import serializers
from .models import (
    User, UserSkill, Education, WorkExperience, Company, Job,
    SavedJob, Application, ApplicationTimeline
)


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'phone', 'bio',
            'avatar_url', 'street_address', 'city_state', 'postal_code',
            'country', 'created_at', 'updated_at', 'last_login'
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
            'requirements', 'responsibilities', 'benefits', 'is_remote', 'posted_date',
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
    
    class Meta:
        model = Application
        fields = [
            'id', 'user', 'job', 'job_title', 'company_name', 'company_logo_color',
            'company_logo_initial', 'location', 'salary_range', 'status',
            'interview_type', 'interview_date', 'interview_notes', 'offer_deadline', 
            'applied_at', 'last_status_update', 'cover_letter', 'resume_url', 'notes',
            'created_at', 'updated_at', 'timeline'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_status_update']





class UserProfileSerializer(serializers.ModelSerializer):
    """Complete user profile with related data"""
    skills = UserSkillSerializer(many=True, read_only=True)
    education = EducationSerializer(many=True, read_only=True)
    work_experience = WorkExperienceSerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'phone', 'bio',
            'avatar_url', 'street_address', 'city_state', 'postal_code',
            'country', 'skills', 'education', 'work_experience',
            'created_at', 'updated_at', 'last_login'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
