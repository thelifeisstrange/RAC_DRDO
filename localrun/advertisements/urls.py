# advertisements/urls.py

from django.urls import path
from .api import AdvertisementAPIView, SaveAdvertisementResultsAPIView

urlpatterns = [
    # A single URL for both GET (list) and POST (create) requests
    path('', AdvertisementAPIView.as_view(), name='advertisement-list-create'),
    
    # The endpoint for the "Save All" button to post the final data to
    path('save-results/', SaveAdvertisementResultsAPIView.as_view(), name='advertisement-save-results'),
]