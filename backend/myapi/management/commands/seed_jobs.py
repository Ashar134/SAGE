from django.core.management.base import BaseCommand
from myapi.models import Job, Company
from django.utils import timezone
from decimal import Decimal
import random

class Command(BaseCommand):
    help = 'Populates the database with sample jobs and companies'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')

        # 1. Create Companies
        companies_data = [
            {
                'name': 'Apple',
                'logo_color': '#000000',
                'logo_initial': '', # Apple usually uses icon
                'location': 'Cupertino, CA'
            },
            {
                'name': 'Google',
                'logo_color': '#4285f4',
                'logo_initial': 'G',
                'location': 'Mountain View, CA'
            },
            {
                'name': 'Meta',
                'logo_color': '#0668E1',
                'logo_initial': 'M',
                'location': 'Menlo Park, CA'
            },
            {
                'name': 'Netflix',
                'logo_color': '#E50914',
                'logo_initial': 'N',
                'location': 'Los Gatos, CA'
            },
            {
                'name': 'Airbnb',
                'logo_color': '#FF5A5F',
                'logo_initial': 'A',
                'location': 'San Francisco, CA'
            },
            {
                'name': 'Spotify',
                'logo_color': '#1DB954',
                'logo_initial': 'S',
                'location': 'New York, NY'
            },
            {
                'name': 'Microsoft',
                'logo_color': '#00A4EF',
                'logo_initial': 'M',
                'location': 'Redmond, WA'
            },
            {
                'name': 'Amazon',
                'logo_color': '#FF9900',
                'logo_initial': 'A',
                'location': 'Seattle, WA'
            }
        ]

        companies = {}
        for c_data in companies_data:
            company, created = Company.objects.get_or_create(
                name=c_data['name'],
                defaults={
                    'logo_color': c_data['logo_color'],
                    'logo_initial': c_data['logo_initial'],
                    'description': f"Leading technology company based in {c_data['location']}."
                }
            )
            companies[c_data['name']] = company
            if created:
                self.stdout.write(f"Created company: {company.name}")

        # 2. Create Jobs
        jobs_data = [
            {
                'title': 'Human Interface Designer',
                'company': 'Apple',
                'location': 'Cupertino, California',
                'description': 'Design intuitive and beautiful user interfaces for Apple products. Work with cutting-edge technology. You will be responsible for defining the visual language of our next generation operating systems.',
                'job_type': ['Full-Time', 'Flexible schedule'],
                'salary_min': 150000,
                'salary_max': 220000,
                'is_remote': False,
                'days_ago': 30
            },
            {
                'title': 'Product Designer',
                'company': 'Google',
                'location': 'Mountain View, California',
                'description': 'Create world-class product experiences for billions of users. Join our design team to solve complex problems using material design principles.',
                'job_type': ['Full-time', 'Remote'],
                'salary_min': 120000,
                'salary_max': 180000,
                'is_remote': True,
                'days_ago': 0
            },
            {
                'title': 'Senior UX Designer',
                'company': 'Meta',
                'location': 'Menlo Park, California',
                'description': 'Shape the future of social connection through innovative design solutions in the Metaverse and our family of apps.',
                'job_type': ['Full-time', 'Hybrid'],
                'salary_min': 130000,
                'salary_max': 200000,
                'is_remote': False,
                'days_ago': 2
            },
            {
                'title': 'UI/UX Designer',
                'company': 'Netflix',
                'location': 'Los Gatos, California',
                'description': 'Design experiences that entertain millions worldwide. Be part of our creative team improving the content discovery journey.',
                'job_type': ['Full-time'],
                'salary_min': 110000,
                'salary_max': 160000,
                'is_remote': False,
                'days_ago': 7
            },
            {
                'title': 'Interaction Designer',
                'company': 'Airbnb',
                'location': 'San Francisco, California',
                'description': 'Design delightful experiences for travelers and hosts around the world. Focus on building trust and connection.',
                'job_type': ['Full-time', 'Remote'],
                'salary_min': 115000,
                'salary_max': 170000,
                'is_remote': True,
                'days_ago': 3
            },
            {
                'title': 'Visual Designer',
                'company': 'Spotify',
                'location': 'New York, New York',
                'description': 'Create stunning visual designs for the world\'s leading music streaming platform. Help artists connect with fans.',
                'job_type': ['Full-time', 'Flexible schedule'],
                'salary_min': 100000,
                'salary_max': 150000,
                'is_remote': False,
                'days_ago': 5
            },
            {
                'title': 'Frontend Engineer',
                'company': 'Microsoft',
                'location': 'Redmond, Washington',
                'description': 'Build modern web applications using React and TypeScript for Azure cloud services.',
                'job_type': ['Full-time', 'Hybrid'],
                'salary_min': 140000,
                'salary_max': 210000,
                'is_remote': False,
                'days_ago': 1
            },
            {
                'title': 'Backend Developer',
                'company': 'Amazon',
                'location': 'Seattle, Washington',
                'description': 'Scale high-performance distributed systems for AWS. Experience with Java or Go required.',
                'job_type': ['Full-time'],
                'salary_min': 160000,
                'salary_max': 230000,
                'is_remote': False,
                'days_ago': 4
            }
        ]

        for job_data in jobs_data:
            company = companies[job_data['company']]
            posted_date = timezone.now() - timezone.timedelta(days=job_data['days_ago'])
            
            job, created = Job.objects.get_or_create(
                title=job_data['title'],
                company=company,
                defaults={
                    'company_name': company.name, # Denormalized
                    'location': job_data['location'],
                    'description': job_data['description'],
                    'job_type': job_data['job_type'],
                    'salary_min': job_data['salary_min'],
                    'salary_max': job_data['salary_max'],
                    'is_remote': job_data['is_remote'],
                    'posted_date': posted_date,
                    'requirements': ['Extensive experience required.', 'Bachelor degree in related field.', 'Strong communication skills.'],
                    'responsibilities': ['Lead design projects.', 'Collaborate with cross-functional teams.', 'Mentor junior designers.'],
                    'benefits': ['Health insurance', '401k matching', 'Free lunch']
                }
            )
            
            if created:
                # Hack to force the posted_date to be in the past (auto_now_add usually overrides on creation)
                Job.objects.filter(id=job.id).update(posted_date=posted_date)
                self.stdout.write(f"Created job: {job.title} at {company.name}")
            else:
                self.stdout.write(f"Job already exists: {job.title} at {company.name}")

        self.stdout.write(self.style.SUCCESS('Successfully seeded database with jobs.'))
