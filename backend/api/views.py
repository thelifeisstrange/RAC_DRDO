# backend/api/views.py
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import CustomUser
from .serializers import UserSerializer, RegisterSerializer
from django.contrib.auth import authenticate

# --- NEW: Import our custom permission class ---
from .permissions import IsAdminRole

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def custom_login_view(request):
    # ... (This login view is correct and does not need to change)
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(username=email, password=password)
    if not user:
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    user.refresh_from_db()
    refresh = RefreshToken.for_user(user)
    refresh['first_name'] = user.first_name
    refresh['email'] = user.email
    refresh['role'] = user.role
    return Response({'refresh': str(refresh), 'access': str(refresh.access_token)})

# --- UPDATED VIEW ---
class UserListView(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    # We now use our simple, reliable role check
    permission_classes = [IsAdminRole]

# --- UPDATED VIEW ---
class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    # We now use our simple, reliable role check
    permission_classes = [IsAdminRole]

# This registration view is correct
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer