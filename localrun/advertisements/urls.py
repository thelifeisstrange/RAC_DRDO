# advertisements/urls.py
from django.urls import path
from .api import AdvertisementAPIView, BulkSaveResultsAPIView

urlpatterns = [
    path('', AdvertisementAPIView.as_view(), name='advertisement-list-create'),
    path('save-results/', BulkSaveResultsAPIView.as_view(), name='advertisement-save-results'),
]