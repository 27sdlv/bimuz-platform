import mimetypes
import os
import re

from django.http import StreamingHttpResponse


def serve_range_file(request, file_path):
    """Serve a file with support for HTTP Range requests (seeking)."""
    range_header = request.META.get('HTTP_RANGE', '').strip()
    range_match = re.match(r'bytes=(\d+)-(\d*)', range_header)
    file_size = os.path.getsize(file_path)
    content_type, _ = mimetypes.guess_type(file_path)

    if range_match:
        first_byte, last_byte = range_match.groups()
        first_byte = int(first_byte) if first_byte else 0
        last_byte = int(last_byte) if last_byte else file_size - 1
        if last_byte >= file_size:
            last_byte = file_size - 1
        length = last_byte - first_byte + 1

        def file_iterator(size=8192):
            with open(file_path, 'rb') as f:
                f.seek(first_byte)
                remaining = length
                while remaining > 0:
                    chunk_size = min(size, remaining)
                    chunk = f.read(chunk_size)
                    if not chunk:
                        break
                    yield chunk
                    remaining -= len(chunk)

        response = StreamingHttpResponse(file_iterator(), status=206, content_type=content_type)
        response['Content-Length'] = str(length)
        response['Content-Range'] = f'bytes {first_byte}-{last_byte}/{file_size}'
    else:
        def file_iterator(size=8192):
            with open(file_path, 'rb') as f:
                while True:
                    chunk = f.read(size)
                    if not chunk:
                        break
                    yield chunk

        response = StreamingHttpResponse(file_iterator(), content_type=content_type)
        response['Content-Length'] = str(file_size)

    response['Accept-Ranges'] = 'bytes'
    return response
