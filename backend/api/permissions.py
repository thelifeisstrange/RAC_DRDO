# backend/api/permissions.py
from rest_framework.permissions import BasePermission

class IsAdminRole(BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        # Check if the user is authenticated and if their role is 'ADMIN'
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')