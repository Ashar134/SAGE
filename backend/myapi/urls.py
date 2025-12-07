from django.urls import path, include
from . import views

 
urlpatterns = [
    # For testing the index view
    # path('api/', views.index, name='index'), 
     
     
    path("", views.homepage, name="homepage"),
    path("auth/", views.authenticate_user, name="authentication_page"),
    path("api/cv/parse", views.parse_cv, name="parse_cv"),


]



