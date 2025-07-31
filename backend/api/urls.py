# backend/api/urls.py
from django.urls import path
from .views import (
    UserListView,
    UserDetailView,
    RegisterView,
    custom_login_view # Import our new login view
)

urlpatterns = [
    # THIS IS THE NEW LOGIN URL
    path('token/', custom_login_view, name='token_obtain_pair'),

    path('register/', RegisterView.as_view(), name='register'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
]