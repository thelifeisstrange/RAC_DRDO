# backend/api/authentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from users.models import CustomUser

class CustomJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        """
        Attempts to find and return a user using the given validated token.
        """
        try:
            user_id = validated_token['user_id']
        except KeyError:
            return None

        try:
            user = CustomUser.objects.get(pk=user_id)
        except CustomUser.DoesNotExist:
            return None

        return user