# backend/api/urls.py
from django.urls import path
from .views import (
    UserListView,
    UserDetailView,
    RegisterView,
    custom_login_view,
    RoleListView,     # Add this import
    RoleDetailView    # Add this import
)

urlpatterns = [
    # THIS IS THE NEW LOGIN URL
    path('token/', custom_login_view, name='token_obtain_pair'),

    path('register/', RegisterView.as_view(), name='register'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('roles/', RoleListView.as_view(), name='role-list-create'),
    path('roles/<int:pk>/', RoleDetailView.as_view(), name='role-delete'),
]