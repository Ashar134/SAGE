from django.core.management.base import BaseCommand
from myapi.models import User, Application, ApplicationTimeline
from django.utils import timezone


class Command(BaseCommand):
    help = 'Insert sample application data for testing'

    def handle(self, *args, **options):
        self.stdout.write("=" * 60)
        self.stdout.write(self.style.SUCCESS("INSERTING SAMPLE APPLICATION DATA"))
        self.stdout.write("=" * 60)

        # Get the first user
        user = User.objects.first()
        
        if not user:
            self.stdout.write(self.style.ERROR("\nNo users found in database!"))
            self.stdout.write("Please create a user first through registration.")
            return
        
        self.stdout.write(self.style.SUCCESS(f"\nFound user: {user.email} (ID: {user.id})"))
        
        # Sample applications data with dynamic dates
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
                'days_ago': 3,  # Applied 3 days ago
            },
            {
                'job_title': 'Frontend Engineer',
                'company_name': 'Meta',
                'company_logo_color': '#0668E1',
                'company_logo_initial': 'M',
                'location': 'Menlo Park, CA',
                'salary_range': '$130k - $180k',
                'status': 'reviewing',
                'days_ago': 5,  # Applied 5 days ago
            },
            {
                'job_title': 'Software Engineer',
                'company_name': 'Microsoft',
                'company_logo_color': '#00A4EF',
                'company_logo_initial': 'M',
                'location': 'Redmond, WA',
                'salary_range': '$120k - $170k',
                'status': 'applied',
                'days_ago': 7,  # Applied 1 week ago
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
                'days_ago': 2,  # Applied 2 days ago
            },
            {
                'job_title': 'DevOps Engineer',
                'company_name': 'Netflix',
                'company_logo_color': '#E50914',
                'company_logo_initial': 'N',
                'location': 'Los Gatos, CA',
                'salary_range': '$150k - $210k',
                'status': 'offer',
                'days_ago': 10,  # Applied 10 days ago
            },
            {
                'job_title': 'React Developer',
                'company_name': 'Airbnb',
                'company_logo_color': '#FF5A5F',
                'company_logo_initial': 'A',
                'location': 'San Francisco, CA',
                'salary_range': '$125k - $175k',
                'status': 'applied',
                'days_ago': 1,  # Applied yesterday
            },
            {
                'job_title': 'Python Developer',
                'company_name': 'Spotify',
                'company_logo_color': '#1DB954',
                'company_logo_initial': 'S',
                'location': 'New York, NY',
                'salary_range': '$130k - $180k',
                'status': 'rejected',
                'days_ago': 14,  # Applied 2 weeks ago
            },
        ]

        self.stdout.write(f"\nCreating {len(applications_data)} sample applications...")
        self.stdout.write("-" * 60)

        created_count = 0
        for app_data in applications_data:
            try:
                # Calculate applied_at date based on days_ago
                days_ago = app_data.pop('days_ago', 0)
                applied_at = timezone.now() - timezone.timedelta(days=days_ago)
                
                # Set specific dates based on status
                interview_date = None
                offer_deadline = None
                
                if app_data['status'] == 'interview':
                    # Set interview 3 days from now (upcoming) or 2 days ago (past) depending on scenario
                    # For this demo, let's make them upcoming so they show on calendar
                    # Google: 4 days from now
                    if app_data['company_name'] == 'Google':
                         interview_date = timezone.now() + timezone.timedelta(days=4)
                         interview_date = interview_date.replace(hour=14, minute=0, second=0, microsecond=0)
                    # Amazon: 5 days from now
                    elif app_data['company_name'] == 'Amazon':
                         interview_date = timezone.now() + timezone.timedelta(days=5)
                         interview_date = interview_date.replace(hour=10, minute=0, second=0, microsecond=0)
                
                if app_data['status'] == 'offer':
                    # Set deadline 1 week from now
                    offer_deadline = timezone.now() + timezone.timedelta(days=7)
                    offer_deadline = offer_deadline.replace(hour=17, minute=0, second=0, microsecond=0)

                # Create application with dynamic timestamp
                application = Application.objects.create(
                    user=user,
                    applied_at=applied_at,
                    last_status_update=applied_at,
                    interview_date=interview_date,
                    offer_deadline=offer_deadline,
                    **app_data
                )
                
                # Force update timestamps
                Application.objects.filter(id=application.id).update(
                    applied_at=applied_at,
                    last_status_update=applied_at,
                    interview_date=interview_date,
                    offer_deadline=offer_deadline
                )
                
                # Create initial timeline entry with the same timestamp
                ApplicationTimeline.objects.create(
                    application=application,
                    event_type='status_change',
                    new_status=app_data['status'],
                    title=f"Application {app_data['status'].capitalize()}",
                    description=f"Applied for {app_data['job_title']} at {app_data['company_name']}",
                    event_date=applied_at
                )

                # If there's an interview, add a timeline event for it
                if interview_date:
                     ApplicationTimeline.objects.create(
                        application=application,
                        event_type='interview',
                        new_status='interview',
                        title=f"Scheduled {app_data.get('interview_type', 'Interview').capitalize()}",
                        description=f"Upcoming at {interview_date.strftime('%Y-%m-%d %H:%M')}",
                        event_date=interview_date
                    )
                
                created_count += 1
                
                # Show relative time
                if days_ago == 0:
                    time_ago = "today"
                elif days_ago == 1:
                    time_ago = "yesterday"
                elif days_ago < 7:
                    time_ago = f"{days_ago} days ago"
                elif days_ago < 14:
                    time_ago = "1 week ago"
                else:
                    weeks = days_ago // 7
                    time_ago = f"{weeks} weeks ago"
                
                self.stdout.write(self.style.SUCCESS(
                    f"{created_count}. {app_data['job_title']} at {app_data['company_name']} - {app_data['status'].upper()} ({time_ago})"
                ))
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(
                    f"Error creating application for {app_data['company_name']}: {e}"
                ))

        self.stdout.write("-" * 60)
        self.stdout.write(self.style.SUCCESS(f"\nSuccessfully created {created_count} applications!"))

        # Show summary by status
        self.stdout.write("\nSUMMARY BY STATUS:")
        self.stdout.write("-" * 60)
        for status_choice in Application.STATUS_CHOICES:
            status_code = status_choice[0]
            status_label = status_choice[1]
            count = Application.objects.filter(user=user, status=status_code).count()
            if count > 0:
                self.stdout.write(f"   {status_label}: {count}")

        self.stdout.write("-" * 60)
        total = Application.objects.filter(user=user).count()
        self.stdout.write(self.style.SUCCESS(f"\nTotal applications for {user.email}: {total}"))
        self.stdout.write(self.style.SUCCESS("\nSample data insertion complete!"))
        self.stdout.write("=" * 60)
