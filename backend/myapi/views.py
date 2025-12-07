from django.shortcuts import render, HttpResponse, redirect
from django.core.files.temp import NamedTemporaryFile
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
import json
import subprocess
from pathlib import Path
import sys

# Create your views here.
# Testing that our Django server is working fine or not
""""
# Testing that our Django server is working fine or not

def home_page(request):
    return HttpResponse("Hello, This is our Django API Home Page") 


# Testing that our Django API is working fine or not

@api_view(['GET'])
def index(request):
    return Response({"message": "Hello, This is our Django API Home Page"}) 

"""




# Our main working start from here
# Homepage or Website main page view
def homepage(request):
    return render(request, "homepage.html")


# Login and Registration Page
@csrf_exempt
def authenticate_user(request):
    if request.method == "POST":
        # TODO: add real registration/login handling.
        return redirect("http://127.0.0.1:5173/profile")
    return render(request, "authentication_page.html")


# CV parsing endpoint
@csrf_exempt
@api_view(['POST'])
def parse_cv(request):
    """
    Accepts a PDF upload and returns parsed JSON using backend/CV-Parser/parse_resume.py.
    """
    uploaded = request.FILES.get('file')
    if not uploaded:
        return Response({"error": "No file uploaded. Use form field name 'file'."},
                        status=status.HTTP_400_BAD_REQUEST)

    # Save to a temp file to pass to the parser script
    with NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        for chunk in uploaded.chunks():
            tmp.write(chunk)
        temp_path = tmp.name

    script_path = Path(__file__).resolve().parent.parent / "CV-Parser" / "cvparser.py"

    try:
        result = subprocess.run(
            [sys.executable, str(script_path), temp_path],
            capture_output=True,
            text=True,
            check=True,
        )
        parsed_json = json.loads(result.stdout)
        return Response(parsed_json, status=status.HTTP_200_OK)
    except subprocess.CalledProcessError as exc:
        return Response(
            {"error": "CV parser failed", "details": exc.stderr},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    except json.JSONDecodeError:
        return Response(
            {"error": "Parser output was not valid JSON"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
