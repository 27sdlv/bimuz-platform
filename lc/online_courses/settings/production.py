from .base import *  # noqa: F403

DEBUG = False
CORS_ALLOW_ALL_ORIGINS = False

if not CORS_ALLOWED_ORIGINS:  # noqa: F405
    raise ValueError('Set CORS_ALLOWED_ORIGINS in production (comma-separated origins).')

if not _s3_settings:  # noqa: F405
    raise ValueError(
        'Production requires S3 media storage. Set AWS_STORAGE_BUCKET_NAME and AWS credentials in env.'
    )

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = env.bool('SECURE_SSL_REDIRECT', default=True)  # noqa: F405
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

LOGGING['root']['level'] = 'WARNING'  # noqa: F405
LOGGING['loggers']['django']['level'] = 'WARNING'  # noqa: F405
