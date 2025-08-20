# pipeline/api.py

import os
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

from .models import VerificationJob, VerificationResult # Use the simple models
from .tasks import run_verification_pipeline
from .serializers import VerificationJobSerializer

class StartVerificationAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        master_csv = request.FILES.get('master_csv')
        source_files = request.FILES.getlist('source_files')

        if not master_csv or not source_files:
            return Response({'error': 'Master CSV and source files are required.'}, status=status.HTTP_400_BAD_REQUEST)

        job = VerificationJob.objects.create()
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads', str(job.id))
        os.makedirs(upload_dir, exist_ok=True)
        
        # We need to pass the full path to the task
        master_csv_path = os.path.join(upload_dir, master_csv.name)
        with open(master_csv_path, 'wb+') as f:
            for chunk in master_csv.chunks(): f.write(chunk)

        source_file_paths = []
        for f in source_files:
            path = os.path.join(upload_dir, f.name)
            with open(path, 'wb+') as destination:
                for chunk in f.chunks(): destination.write(chunk)
            source_file_paths.append(path)
        
        # Call the task with all the necessary paths
        run_verification_pipeline.delay(job.id, master_csv_path, source_file_paths)

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