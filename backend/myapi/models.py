import uuid
from django.db import models
from django.utils import timezone


class User(models.Model):
    """User model with profile information"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    avatar_url = models.URLField(max_length=500, blank=True, null=True)
    password_hash = models.CharField(max_length=255, blank=True, null=True)
    
    # Address Information
    street_address = models.CharField(max_length=255, blank=True, null=True)
    city_state = models.CharField(max_length=100, blank=True, null=True)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    
    # Metadata
    is_onboarded = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(blank=True, null=True)
    resume_url = models.URLField(max_length=500, blank=True, null=True)
    interview_recording_url = models.URLField(max_length=500, blank=True, null=True)
    
    class Meta:
        db_table = 'users'
        
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"


class UserSkill(models.Model):
    """User skills with proficiency levels"""
    SKILL_TYPES = [
        ('language', 'Language'),
        ('framework', 'Framework'),
        ('tool', 'Tool'),
        ('soft_skill', 'Soft Skill'),
    ]
    
    PROFICIENCY_LEVELS = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skills')
    skill_name = models.CharField(max_length=100)
    skill_type = models.CharField(max_length=20, choices=SKILL_TYPES)
    proficiency_level = models.CharField(max_length=20, choices=PROFICIENCY_LEVELS, blank=True, null=True)
    years_of_experience = models.DecimalField(max_digits=3, decimal_places=1, blank=True, null=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_skills'
        unique_together = ['user', 'skill_name', 'skill_type']
        
    def __str__(self):
        return f"{self.user.email} - {self.skill_name}"


class Education(models.Model):
    """User education history"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='education')
    degree = models.CharField(max_length=200)
    school = models.CharField(max_length=200)
    field_of_study = models.CharField(max_length=200, blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    is_current = models.BooleanField(default=False)
    gpa = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'education'
        
    def __str__(self):
        return f"{self.degree} from {self.school}"


class WorkExperience(models.Model):
    """User work experience history"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='work_experience')
    job_title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True, null=True)
    responsibilities = models.JSONField(default=list, blank=True, null=True)
    achievements = models.JSONField(default=list, blank=True, null=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'work_experience'
        
    def __str__(self):
        return f"{self.job_title} at {self.company}"


class Certificate(models.Model):
    """User certificates and awards"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certificates')
    name = models.CharField(max_length=255)
    issuer = models.CharField(max_length=255, blank=True, null=True)
    year = models.CharField(max_length=50, blank=True, null=True)
    link = models.URLField(max_length=500, blank=True, null=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_certificates'
        
    def __str__(self):
        return f"{self.name} from {self.issuer}"


class Research(models.Model):
    """User research work and publications"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='research')
    title = models.CharField(max_length=255)
    organization = models.CharField(max_length=255, blank=True, null=True)
    period = models.CharField(max_length=100, blank=True, null=True)
    details = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_research'
        verbose_name_plural = 'research projects'
        
    def __str__(self):
        return self.title


class Project(models.Model):
    """User technical or academic projects"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=255)
    organization = models.CharField(max_length=255, blank=True, null=True)
    period = models.CharField(max_length=100, blank=True, null=True)
    details = models.TextField(blank=True, null=True)
    link = models.URLField(max_length=500, blank=True, null=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_projects'
        
    def __str__(self):
        return self.title


class Company(models.Model):
    """Company information for jobs"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, unique=True)
    logo_url = models.URLField(max_length=500, blank=True, null=True)
    logo_color = models.CharField(max_length=7, default='#6366f1')
    logo_initial = models.CharField(max_length=2, blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True, null=True)
    company_size = models.CharField(max_length=50, blank=True, null=True)
    website_url = models.URLField(max_length=500, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'companies'
        verbose_name_plural = 'companies'
        
    def __str__(self):
        return self.name


class Job(models.Model):
    """Job listings"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True, related_name='jobs')
    
    # Basic Information
    title = models.CharField(max_length=200)
    company_name = models.CharField(max_length=200)  # Denormalized
    location = models.CharField(max_length=200)
    description = models.TextField()
    
    # Job Details
    job_type = models.JSONField(default=list, blank=True)
    work_mode = models.JSONField(default=list, blank=True)
    salary_min = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    salary_currency = models.CharField(max_length=3, default='USD')
    
    # Requirements & Bullets
    requirements = models.JSONField(default=list, blank=True, null=True)
    responsibilities = models.JSONField(default=list, blank=True, null=True)
    benefits = models.JSONField(default=list, blank=True, null=True)
    selection_process = models.JSONField(default=list, blank=True, null=True)
    
    # Metadata
    is_remote = models.BooleanField(default=False)
    posted_date = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField(blank=True, null=True)
    source_url = models.URLField(max_length=500, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    # Vacancy
    available_positions = models.IntegerField(default=1, help_text="Number of open positions / seats for this job", blank=True, null=True)

    # Test Configuration
    test_no_of_questions = models.IntegerField(default=100, blank=True, null=True)
    test_time_allowed = models.IntegerField(default=60, help_text="Time allowed in minutes", blank=True, null=True)
    test_deadline_days = models.IntegerField(default=3, help_text="Days to complete test after application", blank=True, null=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'jobs'
        ordering = ['-posted_date']
        
    def __str__(self):
        return f"{self.title} at {self.company_name}"


class SavedJob(models.Model):
    """Tracks jobs saved/bookmarked by users"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_jobs')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='saved_by')
    notes = models.TextField(blank=True, null=True)
    
    saved_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'saved_jobs'
        unique_together = ['user', 'job']
        
    def __str__(self):
        return f"{self.user.email} saved {self.job.title}"


class Application(models.Model):
    """Job applications submitted by users"""
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('reviewing', 'Reviewing'),
        ('interview', 'Interview'),
        ('test', 'Test'),
        ('offer', 'Offer'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
        ('accepted', 'Accepted'),
    ]
    
    INTERVIEW_TYPES = [
        ('phone_screen', 'Phone Screen'),
        ('technical', 'Technical'),
        ('behavioral', 'Behavioral'),
        ('panel', 'Panel'),
        ('test', 'Test'),
        ('assessment', 'Assessment'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    job = models.ForeignKey(Job, on_delete=models.SET_NULL, null=True, blank=True, related_name='applications')
    
    # Job Information (denormalized)
    job_title = models.CharField(max_length=200)
    company_name = models.CharField(max_length=200)
    company_logo_color = models.CharField(max_length=7, default='#6366f1')
    company_logo_initial = models.CharField(max_length=2, blank=True, null=True)
    location = models.CharField(max_length=200, blank=True, null=True)
    salary_range = models.CharField(max_length=100, blank=True, null=True)
    
    # Application Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    
    # Interview/Test Information
    interview_type = models.CharField(max_length=20, choices=INTERVIEW_TYPES, blank=True, null=True)
    interview_date = models.DateTimeField(blank=True, null=True)
    interview_notes = models.TextField(blank=True, null=True)
    
    # Offer Information
    offer_deadline = models.DateTimeField(blank=True, null=True)
    
    # Tracking
    applied_at = models.DateTimeField(default=timezone.now)
    last_status_update = models.DateTimeField(default=timezone.now)
    
    # Additional Information
    cover_letter = models.TextField(blank=True, null=True)
    resume_url = models.URLField(max_length=500, blank=True, null=True)
    test_score = models.FloatField(blank=True, null=True)
    test_completed_at = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    # Interview Results
    interview_score = models.FloatField(blank=True, null=True)
    interview_transcript = models.JSONField(default=list, blank=True, null=True)
    interview_completed_at = models.DateTimeField(blank=True, null=True)
    confidence_score = models.FloatField(blank=True, null=True)
    interview_recording_url = models.URLField(max_length=500, blank=True, null=True)
    interview_deadline = models.DateTimeField(blank=True, null=True)  # 2 days after passing test
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'applications'
        ordering = ['-applied_at']
        
    def __str__(self):
        return f"{self.user.email} - {self.job_title} at {self.company_name}"


class ApplicationTimeline(models.Model):
    """Tracks status changes and events in the application process"""
    EVENT_TYPES = [
        ('status_change', 'Status Change'),
        ('interview_scheduled', 'Interview Scheduled'),
        ('interview_completed', 'Interview Completed'),
        ('test_scheduled', 'Test Scheduled'),
        ('test_completed', 'Test Completed'),
        ('note_added', 'Note Added'),
        ('document_submitted', 'Document Submitted'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='timeline')
    
    event_type = models.CharField(max_length=30, choices=EVENT_TYPES)
    old_status = models.CharField(max_length=20, blank=True, null=True)
    new_status = models.CharField(max_length=20, blank=True, null=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    event_date = models.DateTimeField(default=timezone.now)
    
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'application_timeline'
        ordering = ['-event_date']
        
    def __str__(self):
        return f"{self.application.job_title} - {self.title}"


# ============================================================================
# HR Dashboard Models (MySQL)
# ============================================================================

