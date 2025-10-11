from django.urls import path, include
from . import views

 
urlpatterns = [
    # For testing the index view
    # path('api/', views.index, name='index'), 
     
     
    path("", views.homepage, name="homepage"),


]




