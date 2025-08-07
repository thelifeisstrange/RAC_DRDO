# backend/api/permissions.py
from rest_framework.permissions import BasePermission
from users.models import CustomUser # Import your user model

class IsAdminRole(BasePermission):
    """
    Custom permission to only allow users with the 'ADMIN' role.
    This performs a live database lookup to avoid any stale token issues.
    """
    def has_permission(self, request, view):
        # The request.user is the user object that DRF's JWT auth has found.
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            # We do NOT trust the 'role' in the token. We perform a live DB query.
            user_from_db = CustomUser.objects.get(pk=request.user.pk)
            # We check the role from the database, the ultimate source of truth.
            return user_from_db.role and user_from_db.role.name == 'ADMIN'
        except CustomUser.DoesNotExist:
            return False