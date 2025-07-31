# backend/api/views.py
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import CustomUser
from .serializers import UserSerializer, RegisterSerializer
from django.contrib.auth import authenticate

# --- THE NEW, CUSTOM LOGIN VIEW ---
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def custom_login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if email is None or password is None:
        return Response({'error': 'Please provide both email and password'}, status=status.HTTP_400_BAD_REQUEST)

    # We still use 'username=email' because our CustomUserBackend expects the email
    # to be passed in the 'username' parameter of the authenticate function.
    user = authenticate(username=email, password=password)

    if not user:
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    # Manually generate tokens if the user is valid
    refresh = RefreshToken.for_user(user)

    # Add our custom claims to the token
    refresh['first_name'] = user.first_name
    refresh['email'] = user.email
    refresh['role'] = user.role

    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    })

# --- THE OTHER VIEWS ---
class UserListView(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer