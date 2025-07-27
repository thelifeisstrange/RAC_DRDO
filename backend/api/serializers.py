# backend/api/serializers.py
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from users.models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        # Define the fields for the API
        fields = ['id', 'email', 'first_name', 'role']
        # Mark fields that should not be changed via this endpoint
        read_only_fields = ['id', 'email', 'first_name']

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims to the token
        token['first_name'] = user.first_name
        token['email'] = user.email
        token['role'] = user.role
        return token
