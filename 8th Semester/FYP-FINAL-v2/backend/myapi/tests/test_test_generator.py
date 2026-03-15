import unittest
from unittest.mock import patch, MagicMock
from django.test import TestCase, RequestFactory
from myapi.models import User, Job, Application
from myapi.views import submit_test
import json

class TestTestScoring(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.user = User.objects.create(email="test@example.com", first_name="Test", last_name="User")
        self.job = Job.objects.create(title="Software Engineer", company_name="Test Co", location="Remote")
        self.application = Application.objects.create(user=self.user, job=self.job, status="test")

    @patch('myapi.views.TestGeneratorService')
    def test_submit_test_pass(self, mock_service_class):
        # Mock service to return a test with known answers
        mock_service = mock_service_class.return_value
        mock_service.load_test.return_value = {
            'questions': [
                {'key': 'A1', 'answers': {'A1': 'Correct'}},
                {'key': 'A2', 'answers': {'A2': 'Correct'}}
            ]
        }

        # Mock request with correct answers
        data = {
            'job_id': str(self.job.id),
            'candidate_id': str(self.user.id),
            'answers': ['Correct', 'Correct']
        }
        request = self.factory.post('/api/submit-test/', data=json.dumps(data), content_type='application/json')
        
        response = submit_test(request)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['percentage'], 100.0)
        self.assertEqual(response.data['new_status'], 'interview')
        
        # Verify DB update
        self.application.refresh_from_db()
        self.assertEqual(self.application.status, 'interview')

    @patch('myapi.views.TestGeneratorService')
    def test_submit_test_fail(self, mock_service_class):
        mock_service = mock_service_class.return_value
        mock_service.load_test.return_value = {
            'questions': [
                {'key': 'A1', 'answers': {'A1': 'Correct'}},
                {'key': 'A2', 'answers': {'A2': 'Correct'}}
            ]
        }

        # All wrong answers
        data = {
            'job_id': str(self.job.id),
            'candidate_id': str(self.user.id),
            'answers': ['Wrong', 'Wrong']
        }
        request = self.factory.post('/api/submit-test/', data=json.dumps(data), content_type='application/json')
        
        response = submit_test(request)
        
        self.assertEqual(response.data['percentage'], 0.0)
        self.assertEqual(response.data['new_status'], 'rejected')
        
        self.application.refresh_from_db()
        self.assertEqual(self.application.status, 'rejected')
