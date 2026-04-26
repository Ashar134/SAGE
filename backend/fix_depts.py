import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from myapi.models import Application

# Delete orphaned applications with no valid job link or junk department
deleted, _ = Application.objects.filter(company_name='computer scinece').delete()
print(f'Deleted {deleted} orphaned application(s) with department "computer scinece"')

# Also delete Resume Upload applications (they pollute the board)
deleted2, _ = Application.objects.filter(job_title='Resume Upload').delete()
print(f'Deleted {deleted2} "Resume Upload" placeholder application(s)')

print('\nDone.')
