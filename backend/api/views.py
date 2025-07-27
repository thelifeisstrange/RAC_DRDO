# backend/api/views.py
from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from users.models import CustomUser
from .serializers import UserSerializer, MyTokenObtainPairSerializer

# This view is for listing all users (GET)
class UserListView(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

# This is the login view
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# --- NEW VIEW ADDED HERE ---
# This view handles retrieving and updating a single user by their ID (GET, PUT, PATCH)
class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
