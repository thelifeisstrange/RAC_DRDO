# pipeline/serializers.py

import json
from rest_framework import serializers
from .models import VerificationJob, VerificationResult

class SafeJSONField(serializers.Field):
    def to_representation(self, value):
        if value is None:
            return None
        return json.loads(json.dumps(value))

class VerificationResultSerializer(serializers.ModelSerializer):
    # Use our safe field to handle the 'data' dictionary
    data = SafeJSONField(read_only=True)

    class Meta:
        model = VerificationResult
        fields = ['data']

class VerificationJobSerializer(serializers.ModelSerializer):
    results = VerificationResultSerializer(many=True, read_only=True)
    
    class Meta:
        model = VerificationJob
        fields = ['id', 'status', 'details', 'created_at', 'results']