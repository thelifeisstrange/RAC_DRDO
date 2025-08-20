# localrun/pipeline/serializers.py

import json
from rest_framework import serializers
from .models import VerificationJob, VerificationResult

# --- NEW: A custom serializer field for our nested JSON data ---
# This is the key to making the API robust. It ensures that any non-standard
# data types from pandas/numpy are converted to standard Python types.
class SafeJSONField(serializers.Field):
    def to_representation(self, value):
        # This double conversion (to string, then back to dict) is a
        # powerful way to guarantee JSON-compliance for all nested data.
        if value is None:
            return None
        try:
            return json.loads(json.dumps(value))
        except (TypeError, ValueError):
            # If it fails for any reason, return an error structure
            return {"error": "Could not serialize result data."}

class VerificationResultSerializer(serializers.ModelSerializer):
    # --- THE CRITICAL CHANGE ---
    # Use our new custom field to handle the 'data' dictionary.
    data = SafeJSONField(read_only=True)

    class Meta:
        model = VerificationResult
        fields = ['data']

class VerificationJobSerializer(serializers.ModelSerializer):
    # This now uses the more robust serializer above
    results = VerificationResultSerializer(many=True, read_only=True)
    
    class Meta:
        model = VerificationJob
        fields = ['id', 'status', 'details', 'created_at', 'results']