# backend/users/backends.py
from django.contrib.auth.backends import ModelBackend
from .models import CustomUser

class CustomUserBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        # This is for the login form
        try:
            user = CustomUser.objects.get(email=username)
            if user.check_password(password):
                return user
        except CustomUser.DoesNotExist:
            return None

    def get_user(self, user_id):
        # This is the crucial part for authenticating API requests
        try:
            return CustomUser.objects.get(pk=user_id)
        except CustomUser.DoesNotExist:
            return None