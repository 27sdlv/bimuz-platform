"""
Project-level URL configuration for online_courses.

This file is the starting point for all URL routing.
Django reads this file first when a request comes in,
then delegates to the app's urls.py file.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from django.urls import re_path
from online_courses.media_utils import serve_range_file

def dev_media_serve(request, path):
    full_path = os.path.join(settings.MEDIA_ROOT, path)
    if os.path.exists(full_path) and os.path.isfile(full_path):
        return serve_range_file(request, full_path)
    from django.views.static import serve
    return serve(request, path, document_root=settings.MEDIA_ROOT)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('online_courses.api_urls')),
]

import os
if settings.DEBUG:
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', dev_media_serve),
    ]
