# backend/api/urls.py
from django.urls import path
from .views import UserListView, MyTokenObtainPairView, UserDetailView # Import the new view
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # URL to list all users
    path('users/', UserListView.as_view(), name='user-list'),
    
    # NEW: URL to get or update a specific user by their ID (pk = primary key)
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    
    # URL for logging in to get tokens
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # URL to refresh an access token
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
