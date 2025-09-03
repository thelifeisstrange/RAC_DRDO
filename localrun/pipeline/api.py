# pipeline/api.py

import os
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

from .models import VerificationJob, VerificationResult 
from .tasks import run_verification_pipeline
from .serializers import VerificationJobSerializer

class StartVerificationAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        master_csv = request.FILES.get('master_csv')
        source_folder_path = request.data.get('source_folder_path')

        if not master_csv or not source_folder_path:
            return Response({'error': 'Master CSV and source folder path are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        allowed_base_path = os.path.abspath('/data') 
        user_path = os.path.abspath(source_folder_path)

        if not user_path.startswith(allowed_base_path):
            print(f"SECURITY ALERT: User tried to access forbidden path: {user_path}")
            return Response({'error': 'The provided path is not within the shared data volume.'}, status=status.HTTP_403_FORBIDDEN)
        
        if not os.path.isdir(user_path):
            return Response({'error': f'The provided path does not exist or is not a directory inside the container: {user_path}'}, status=status.HTTP_400_BAD_REQUEST)

        job = VerificationJob.objects.create()
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads', str(job.id))
        os.makedirs(upload_dir, exist_ok=True)
        
        master_csv_path = os.path.join(upload_dir, master_csv.name)
        with open(master_csv_path, 'wb+') as f:
            for chunk in master_csv.chunks(): f.write(chunk)


        run_verification_pipeline.delay(job.id, master_csv_path, source_folder_path)

        serializer = VerificationJobSerializer(job)
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

class JobStatusAPIView(APIView):
    def get(self, request, job_id, *args, **kwargs):
        try:
            job = VerificationJob.objects.get(id=job_id)
            serializer = VerificationJobSerializer(job)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except VerificationJob.DoesNotExist:
            return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)