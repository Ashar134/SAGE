from django.urls import path, include
from . import views

 
urlpatterns = [
    # For testing the index view
    # path('', views.index, name='index'),  
    path("", views.homepage, name="homepage"),


]




