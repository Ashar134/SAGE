from django.urls import path, include
from . import views

 
urlpatterns = [
    # For testing the index view
    # path('api/', views.index, name='index'), 
     
     
    path("", views.homepage, name="homepage"),
    path("auth/", views.authenticate_user, name="authentication_page"),
    
    # Test Generator API
    path("api/generate-test/", views.generate_test, name="generate_test"),


]




