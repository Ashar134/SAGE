"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from myapi import views
from django.conf import settings
from django.conf.urls.static import static
from django.http import FileResponse, HttpResponse
import os

def serve_video(request, path):
    """
    Serve video files with proper Range request support so the browser
    seek bar works correctly for WebM/MP4 files.
    """
    file_path = os.path.join(settings.MEDIA_ROOT, 'interviews', path)
    if not os.path.exists(file_path):
        return HttpResponse(status=404)

    file_size = os.path.getsize(file_path)
    content_type = 'video/webm' if file_path.endswith('.webm') else 'video/mp4'

    range_header = request.META.get('HTTP_RANGE', '').strip()

    if range_header:
        # Parse Range: bytes=start-end
        range_match = range_header.replace('bytes=', '').split('-')
        start = int(range_match[0]) if range_match[0] else 0
        end = int(range_match[1]) if range_match[1] else file_size - 1
        end = min(end, file_size - 1)
        length = end - start + 1

        with open(file_path, 'rb') as f:
            f.seek(start)
            data = f.read(length)

        response = HttpResponse(data, status=206, content_type=content_type)
        response['Content-Range'] = f'bytes {start}-{end}/{file_size}'
        response['Accept-Ranges'] = 'bytes'
        response['Content-Length'] = str(length)
    else:
        with open(file_path, 'rb') as f:
            data = f.read()
        response = HttpResponse(data, content_type=content_type)
        response['Accept-Ranges'] = 'bytes'
        response['Content-Length'] = str(file_size)

    response['Access-Control-Allow-Origin'] = '*'
    return response


urlpatterns = [
    path('admin/', admin.site.urls),
    path('about/', views.about_page, name='about_page'),
    path('', include('myapi.urls')),
]

if settings.DEBUG: 
    # Serve interview videos with range request support for seek bar
    urlpatterns += [
        re_path(r'^media/interviews/(?P<path>[^/]+\.webm)$', serve_video),
        re_path(r'^media/interviews/(?P<path>[^/]+\.mp4)$', serve_video),
    ]
    # Serve all other media files normally
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
