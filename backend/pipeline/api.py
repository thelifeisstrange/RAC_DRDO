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
    # This tells DRF to accept multipart form data, which is essential for file uploads.
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        print("[API VIEW] Request received. Content-Type:", request.content_type)

        master_csv = request.FILES.get('master_csv')
        source_files = request.FILES.getlist('source_files')

        print(f"[API VIEW] Master CSV found: {'Yes' if master_csv else 'No'}")
        print(f"[API VIEW] Found {len(source_files)} source files in the request.")

        if not master_csv or not source_files:
            return Response(
                {'error': 'Master CSV and at least one source file are required.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create a job entry in the database to track this process.
        job = VerificationJob.objects.create()
        
        # Create a unique directory for this job's uploads inside the 'media' folder.
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads', str(job.id))
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save the master CSV file to the job's directory.
        master_csv_path = os.path.join(upload_dir, master_csv.name)
        with open(master_csv_path, 'wb+') as f:
            for chunk in master_csv.chunks():
                f.write(chunk)

        # Save all the source document files to the job's directory.
        for f in source_files:
            path = os.path.join(upload_dir, f.name)
            with open(path, 'wb+') as destination:
                for chunk in f.chunks():
                    destination.write(chunk)
        
        # --- THE CRITICAL CHANGE ---
        # We only pass the simple job ID to Celery. This is robust and avoids serialization issues.
        print(f"[API VIEW] Launching Celery task for Job ID: {job.id}")
        run_verification_pipeline.delay(job.id)

        # Immediately respond to the frontend so it doesn't have to wait.
        serializer = VerificationJobSerializer(job)
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

class JobStatusAPIView(APIView):
    # This view allows the frontend to poll for the job status and its results.
    def get(self, request, job_id, *args, **kwargs):
        try:
            job = VerificationJob.objects.get(id=job_id)
            job_serializer = VerificationJobSerializer(job)
            
            # Get all results for this job that have been saved to the database so far.
            results = VerificationResult.objects.filter(job=job).order_by('created_at')
            # Extract the raw 'data' dictionary from each result object.
            results_data = [res.data for res in results]
            
            return Response({
                'job': job_serializer.data,
                'results': results_data,
            }, status=status.HTTP_200_OK)
        except VerificationJob.DoesNotExist:
            return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)