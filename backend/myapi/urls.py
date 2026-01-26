from django.urls import path, include
from . import views

 
urlpatterns = [
    # For testing the index view
    # path('api/', views.index, name='index'), 
     
    # Pages
    path("", views.homepage, name="homepage"),
    path("auth/", views.authenticate_user, name="authentication_page"),
    
    # Test Generator & CV Parser APIs
    path("api/generate-test/", views.generate_test, name="generate_test"),
    path("api/parse-cv/", views.parse_cv, name="parse_cv"),
    
    # Authentication APIs
    path("api/auth/register/", views.register_user, name="register_user"),
    path("api/auth/login/", views.login_user, name="login_user"),
    path("api/auth/logout/", views.logout_user, name="logout_user"),
    path("api/auth/refresh/", views.refresh_token, name="refresh_token"),
    


    
    # Job APIs
    path("api/jobs/", views.get_jobs, name="get_jobs"),
    path("api/jobs/<uuid:job_id>/", views.get_job_detail, name="get_job_detail"),
    
    # Saved Jobs APIs
    path("api/saved-jobs/", views.saved_jobs, name="saved_jobs"),
    path("api/saved-jobs/<uuid:job_id>/", views.unsave_job, name="unsave_job"),
    
    # Application APIs
    path("api/applications/", views.applications, name="applications"),
    path("api/applications/<uuid:app_id>/", views.application_detail, name="application_detail"),
    
    # User Profile APIs
    path("api/users/<uuid:user_id>/profile/", views.get_user_profile, name="get_user_profile"),
    path("api/users/<uuid:user_id>/profile/update/", views.update_user_profile, name="update_user_profile"),
    
    # User Skills APIs
    path("api/users/<uuid:user_id>/skills/", views.add_user_skill, name="add_user_skill"),
    path("api/skills/<uuid:skill_id>/", views.delete_user_skill, name="delete_user_skill"),
    
    # Education APIs
    path("api/users/<uuid:user_id>/education/", views.add_education, name="add_education"),
    path("api/education/<uuid:education_id>/", views.manage_education, name="manage_education"),
    
    # Work Experience APIs
    path("api/users/<uuid:user_id>/experience/", views.add_work_experience, name="add_work_experience"),
    path("api/experience/<uuid:experience_id>/", views.manage_work_experience, name="manage_work_experience"),
]




