from rest_framework import serializers
from .models import VerificationJob

class VerificationJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationJob
        fields = ['id', 'status', 'report_file_path', 'details', 'created_at']