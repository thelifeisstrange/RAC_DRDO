# backend/api/serializers.py
from rest_framework import serializers
from users.models import CustomUser, Role

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'can_manage_users', 'can_screen_applications', 'can_manage_roles', 'is_deletable']

class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    class Meta:
        model = CustomUser
        fields = ['email', 'first_name', 'last_name', 'password', 'password2']
        extra_kwargs = {'password': {'write_only': True}}
    def create(self, validated_data):
        try:
            applicant_role = Role.objects.get(name='APPLICANT')
            validated_data['role'] = applicant_role
        except Role.DoesNotExist:
            raise serializers.ValidationError("Default 'APPLICANT' role not found.")
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = CustomUser.objects.create_user(password=password, **validated_data)
        return user

# --- THIS IS THE CRITICAL FIX ---
class UserSerializer(serializers.ModelSerializer):
    """Serializer for the User model, used for GET requests."""
    # This line tells DRF to use RoleSerializer to represent the 'role' field.
    role = RoleSerializer(read_only=True)

    class Meta:
        model = CustomUser
        # Add the 'role' field to the list of fields to include in the output.
        fields = ['id', 'email', 'first_name', 'last_name', 'role']

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'role']

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['role']