import unittest
from unittest.mock import patch, MagicMock
import numpy as np
from myapi.views import _build_candidate_text, _build_job_text, _cosine_similarity_np

class TestRecommendations(unittest.TestCase):
    
    def test_cosine_similarity(self):
        vec_a = np.array([1, 0, 0])
        vec_b = np.array([1, 0, 0])
        self.assertAlmostEqual(_cosine_similarity_np(vec_a, vec_b), 1.0)
        
        vec_c = np.array([0, 1, 0])
        self.assertAlmostEqual(_cosine_similarity_np(vec_a, vec_c), 0.0)

    def test_build_job_text(self):
        job = MagicMock()
        job.title = "Software Engineer"
        job.description = "Coding in Python"
        job.requirements = ["Python", "Django"]
        job.responsibilities = ["Develop APIs"]
        job.benefits = ["Remote"]
        
        text = _build_job_text(job)
        self.assertIn("Software Engineer", text)
        self.assertIn("Python", text)
        self.assertIn("Develop APIs", text)

    def test_candidate_text_weighting(self):
        user = MagicMock()
        user.bio = "Expert Developer"
        
        skill = MagicMock()
        skill.skill_name = "Python"
        user.skills.all.return_value = [skill]
        
        user.work_experience.all.return_value = []
        user.education.all.return_value = []
        user.projects.all.return_value = []
        user.research.all.return_value = []
        user.certificates.all.return_value = []
        
        text = _build_candidate_text(user)
        # Python should appear multiple times due to weighting
        self.assertTrue(text.count("Python") >= 3)
        self.assertTrue(text.count("Expert Developer") >= 2)
