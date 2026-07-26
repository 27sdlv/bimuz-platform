import logging

from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None and response.status_code >= 500:
        view = context.get('view')
        logger.exception(
            'API error %s on %s',
            response.status_code,
            getattr(view, '__class__', type(view)).__name__ if view else 'unknown',
        )
    return response
