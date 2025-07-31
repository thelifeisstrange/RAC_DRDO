# backend/users/backends.py
from django.contrib.auth.backends import ModelBackend
from .models import CustomUser

class CustomUserBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        # We use 'username' here because that's what the system passes,
        # but we know it actually contains the email.
        email = username
        try:
            # Find the user by their email address, which is our login field.
            user = CustomUser.objects.get(email=email)
            # Check if the provided password is correct for that user.
            if user.check_password(password):
                return user
        except CustomUser.DoesNotExist:
            # No user was found, so authentication fails.
            return None

    def get_user(self, user_id):
        try:
            return CustomUser.objects.get(pk=user_id)
        except CustomUser.DoesNotExist:
            return None