from django.core.management.base import BaseCommand
from myapi.models import Application, User
from django.utils import timezone


class Command(BaseCommand):
    help = 'Verify application timestamps'

    def handle(self, *args, **options):
        user = User.objects.first()
        
        if not user:
            self.stdout.write(self.style.ERROR("No users found!"))
            return
        
        apps = Application.objects.filter(user=user).order_by('-applied_at')
        
        self.stdout.write("\n" + "=" * 80)
        self.stdout.write(self.style.SUCCESS("APPLICATION TIMESTAMPS VERIFICATION"))
        self.stdout.write("=" * 80)
        
        for app in apps:
            days_diff = (timezone.now() - app.applied_at).days
            hours_diff = (timezone.now() - app.applied_at).seconds // 3600
            
            if days_diff == 0:
                if hours_diff == 0:
                    time_ago = "just now"
                else:
                    time_ago = f"{hours_diff} hours ago"
            elif days_diff == 1:
                time_ago = "yesterday"
            elif days_diff < 7:
                time_ago = f"{days_diff} days ago"
            elif days_diff < 14:
                time_ago = "1 week ago"
            else:
                weeks = days_diff // 7
                time_ago = f"{weeks} weeks ago"
            
            self.stdout.write(
                f"• {app.job_title} at {app.company_name}\n"
                f"  Applied: {app.applied_at.strftime('%Y-%m-%d %H:%M:%S')}\n"
                f"  Relative: {time_ago} ({days_diff} days)\n"
                f"  Status: {app.status.upper()}\n"
            )
        
        self.stdout.write("=" * 80)
        self.stdout.write(self.style.SUCCESS(f"\nTotal: {apps.count()} applications with realistic timestamps!"))
        self.stdout.write("=" * 80)
