# backend/api/views.py
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import CustomUser, Role
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    RoleSerializer,
    UserUpdateSerializer
)
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
    refresh['role'] = user.role.name if user.role else None
    return Response({'refresh': str(refresh), 'access': str(refresh.access_token)})

# --- UPDATED VIEW ---
class UserListView(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminRole]

    def get(self, request, *args, **kwargs):
        # This will print to your Django server terminal every time this is called
        print("\n--- DEBUG: Inside UserListView (GET Request) ---")
        print(f"Authenticated User: {request.user}")
        print(f"User Role from DB: {getattr(request.user, 'role', 'N/A')}")
        print("-------------------------------------------------\n")
        return super().get(request, *args, **kwargs)


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomUser.objects.all()
    # This view will use UserSerializer for GET and UserUpdateSerializer for PATCH/PUT
    # based on the fields defined in each. DRF is smart enough to handle this.
    serializer_class = UserSerializer
    permission_classes = [IsAdminRole]

    def get_serializer_class(self):
        # If the request is a PATCH or PUT, use the update serializer
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        # Otherwise, use the default serializer_class
        return super().get_serializer_class()

# This registration view is correct
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

# ADD THESE TWO NEW CLASSES AT THE END OF THE FILE
class RoleListView(generics.ListCreateAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAdminRole]

    def post(self, request, *args, **kwargs):
        # This will print when you try to create a new role
        print("\n--- DEBUG: Inside RoleListView (POST Request) ---")
        print(f"Authenticated User: {request.user}")
        print(f"User Role from DB: {getattr(request.user, 'role', 'N/A')}")
        print(f"Data received from frontend: {request.data}")
        print("-------------------------------------------\n")
        return super().post(request, *args, **kwargs)

class RoleDetailView(generics.DestroyAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAdminRole]