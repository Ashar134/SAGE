from django.shortcuts import render, HttpResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view

# Create your views here.

"""
# Testing that our Django server is working fine or not

def home_page(request):
    return HttpResponse("Hello, This is our Django API Home Page") 
"""


# Testing that our Django API is working fine or not

@api_view(['GET'])
def home_page(request):
    return Response({"message": "Hello, This is our Django API Home Page"}) 

