from .base import *  # noqa: F403

DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'testserver']
CORS_ALLOW_ALL_ORIGINS = True

REST_FRAMEWORK['DEFAULT_THROTTLE_CLASSES'] = []  # noqa: F405

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
