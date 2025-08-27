# pipeline/urls.py
from django.urls import path
from .api import BulkSaveResultsAPIView, StartVerificationAPIView, JobStatusAPIView

urlpatterns = [
    path('start/', StartVerificationAPIView.as_view(), name='start-verification'),
    path('status/<int:job_id>/', JobStatusAPIView.as_view(), name='job-status'),
    path('save-results/', BulkSaveResultsAPIView.as_view(), name='save-results'),
]