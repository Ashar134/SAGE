"""
Script to insert sample application data into the database.
Run this with: python manage.py shell < insert_sample_applications.py
"""

from myapi.models import User, Application, ApplicationTimeline
from django.utils import timezone

print("=" * 60)
print("INSERTING SAMPLE APPLICATION DATA")
print("=" * 60)

# Get the first user (you can change this to your email)
try:
    # Try to get user by email - CHANGE THIS to your email
    user = User.objects.first()
    
    if not user:
        print("\n❌ No users found in database!")
        print("Please create a user first through registration.")
        exit()
    
    print(f"\n✅ Found user: {user.email} (ID: {user.id})")
    
except Exception as e:
    print(f"\n❌ Error finding user: {e}")
    exit()

# Sample applications data
applications_data = [
    {
        'job_title': 'Senior Full Stack Developer',
        'company_name': 'Google',
        'company_logo_color': '#4285f4',
        'company_logo_initial': 'G',
        'location': 'Mountain View, CA',
        'salary_range': '$140k - $200k',
        'status': 'interview',
        'interview_type': 'technical',
    },
    {
        'job_title': 'Frontend Engineer',
        'company_name': 'Meta',
        'company_logo_color': '#0668E1',
        'company_logo_initial': 'M',
        'location': 'Menlo Park, CA',
        'salary_range': '$130k - $180k',
        'status': 'reviewing',
    },
    {
        'job_title': 'Software Engineer',
        'company_name': 'Microsoft',
        'company_logo_color': '#00A4EF',
        'company_logo_initial': 'M',
        'location': 'Redmond, WA',
        'salary_range': '$120k - $170k',
        'status': 'applied',
    },
    {
        'job_title': 'Backend Developer',
        'company_name': 'Amazon',
        'company_logo_color': '#FF9900',
        'company_logo_initial': 'A',
        'location': 'Seattle, WA',
        'salary_range': '$135k - $185k',
        'status': 'interview',
        'interview_type': 'assessment',
    },
    {
        'job_title': 'DevOps Engineer',
        'company_name': 'Netflix',
        'company_logo_color': '#E50914',
        'company_logo_initial': 'N',
        'location': 'Los Gatos, CA',
        'salary_range': '$150k - $210k',
        'status': 'offer',
    },
    {
        'job_title': 'React Developer',
        'company_name': 'Airbnb',
        'company_logo_color': '#FF5A5F',
        'company_logo_initial': 'A',
        'location': 'San Francisco, CA',
        'salary_range': '$125k - $175k',
        'status': 'applied',
    },
    {
        'job_title': 'Python Developer',
        'company_name': 'Spotify',
        'company_logo_color': '#1DB954',
        'company_logo_initial': 'S',
        'location': 'New York, NY',
        'salary_range': '$130k - $180k',
        'status': 'rejected',
    },
]

print(f"\n📝 Creating {len(applications_data)} sample applications...")
print("-" * 60)

created_count = 0
for app_data in applications_data:
    try:
        # Create application
        application = Application.objects.create(
            user=user,
            **app_data
        )
        
        # Create initial timeline entry
        ApplicationTimeline.objects.create(
            application=application,
            event_type='status_change',
            new_status=app_data['status'],
            title=f"Application {app_data['status'].capitalize()}",
            description=f"Applied for {app_data['job_title']} at {app_data['company_name']}"
        )
        
        created_count += 1
        print(f"✅ {created_count}. {app_data['job_title']} at {app_data['company_name']} - {app_data['status'].upper()}")
        
    except Exception as e:
        print(f"❌ Error creating application for {app_data['company_name']}: {e}")

print("-" * 60)
print(f"\n🎉 Successfully created {created_count} applications!")

# Show summary by status
print("\n📊 SUMMARY BY STATUS:")
print("-" * 60)
for status_choice in Application.STATUS_CHOICES:
    status_code = status_choice[0]
    status_label = status_choice[1]
    count = Application.objects.filter(user=user, status=status_code).count()
    if count > 0:
        print(f"   {status_label}: {count}")

print("-" * 60)
print(f"\nTotal applications for {user.email}: {Application.objects.filter(user=user).count()}")
print("\n✅ Sample data insertion complete!")
print("=" * 60)
