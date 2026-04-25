from django.contrib.auth.backends import ModelBackend
from .models import CustomUser

class AuthBackend(ModelBackend):
    @staticmethod
    def _normalize_phone(value):
        return ''.join(ch for ch in (value or '') if ch.isdigit())

    def authenticate(self, request, username=None, password=None, **kwargs):
        identifier = (username or kwargs.get('username') or kwargs.get('identifier') or '').strip()
        if not identifier or password is None:
            return None

        user = CustomUser.objects.filter(username__iexact=identifier).first()

        if user is None:
            normalized_identifier = self._normalize_phone(identifier)
            if normalized_identifier:
                for candidate in CustomUser.objects.exclude(phone__isnull=True).exclude(phone=''):
                    if self._normalize_phone(candidate.phone) == normalized_identifier:
                        user = candidate
                        break

        if user and user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None

    def get_user(self, user_id):
        try:
            return CustomUser.objects.get(pk=user_id)
        except CustomUser.DoesNotExist:
            return None
