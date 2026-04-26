from django.core.management.base import BaseCommand
from myapi.models import Job, Application


# Map job titles to the correct department name
TITLE_TO_DEPT = {
    # Frontend Engineering
    'Frontend Developer':                    'Frontend Engineering',
    'Front-end Developer':                   'Frontend Engineering',
    'Front-end developer and React Expert':  'Frontend Engineering',
    'WEB DEveloper':                         'Frontend Engineering',
    'Web Engineer':                          'Frontend Engineering',

    # Backend Engineering
    'Backend Developer':                     'Backend Engineering',
    'Python Backend Developer':              'Backend Engineering',
    'Software Engineer - Backend':           'Backend Engineering',
    'Django Developer':                      'Backend Engineering',
    'PHP Developer':                         'Backend Engineering',
    'PHP developer':                         'Backend Engineering',

    # Software Development (full-stack / generic)
    'Software Engineer':                     'Software Development',
    'Full Stack Developer':                  'Software Development',

    # DevOps & Cloud Engineering
    'DevOps Engineer':                       'DevOps & Cloud Engineering',
    'Cloud Engineer':                        'DevOps & Cloud Engineering',

    # Machine Learning Engineering
    'Machine Learning Engineer':             'Machine Learning Engineering',

    # Data Science & AI
    'AI Engineer':                           'Data Science & AI',
    'AI/ML Engineer':                        'Data Science & AI',
}


class Command(BaseCommand):
    help = 'Update job and application department (company_name) to specific engineering departments'

    def handle(self, *args, **options):
        jobs_updated = 0
        apps_updated = 0

        for title, dept in TITLE_TO_DEPT.items():
            # Update matching jobs
            count = Job.objects.filter(title=title).update(company_name=dept)
            if count:
                self.stdout.write(f'  Jobs  [{count}] "{title}" -> "{dept}"')
                jobs_updated += count

        # Now sync applications that have a linked job
        for app in Application.objects.select_related('job').filter(job__isnull=False):
            correct_dept = app.job.company_name
            if app.company_name != correct_dept:
                app.company_name = correct_dept
                app.save(update_fields=['company_name'])
                apps_updated += 1

        self.stdout.write(self.style.SUCCESS(
            f'\nDone — {jobs_updated} job(s) and {apps_updated} application(s) updated.'
        ))
