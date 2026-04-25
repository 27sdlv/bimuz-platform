"""
WSGI config for online_courses project.

This file is used when deploying to a production web server
(like Gunicorn or uWSGI). For local development, you don't
need to touch this file — Django's dev server handles it.
"""

import os
from django.core.wsgi import get_wsgi_application

# Tell Django which settings file to use
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'online_courses.settings')

# Create the WSGI application object
application = get_wsgi_application()
