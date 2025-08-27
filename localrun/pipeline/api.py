# pipeline/api.py

import os
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

from .models import ParsedResult, VerificationJob, VerificationResult # Use the simple models
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
        
class SaveResultAPIView(APIView):
    """
    Receives a single, verified result from the frontend and saves it
    to the permanent ParsedResult table.
    """
    def post(self, request, *args, **kwargs):
        # The frontend will send the 'data' part of a single result
        json_result = request.data

        if not json_result or not json_result.get('id'):
            return Response({'error': 'Invalid result data provided.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # This is your save_verification_result logic, now inside the view
            obj, created = ParsedResult.objects.update_or_create(
                id=json_result.get("id"),
                defaults={
                    "email": json_result.get("email"),
                    "phone": json_result.get("phone"),

                    "input_name": json_result.get("input_name"),
                    "extracted_name": json_result.get("extracted_name"),
                    "name_status": json_result.get("name_status"),

            "input_father_name": json_result.get("input_father_name"),
            "extracted_father_name": json_result.get("extracted_father_name"),
            "father_name_status": json_result.get("father_name_status"),

            "input_reg_id": json_result.get("input_reg_id"),
            "extracted_reg_id": json_result.get("extracted_reg_id"),
            "reg_id_status": json_result.get("reg_id_status"),

            "input_year": json_result.get("input_year"),
            "extracted_year": json_result.get("extracted_year"),
            "year_status": json_result.get("year_status"),

            "input_paper_code": json_result.get("input_paper_code"),
            "extracted_paper_code": json_result.get("extracted_paper_code"),
            "paper_code_status": json_result.get("paper_code_status"),

            "input_score": json_result.get("input_score"),
            "extracted_score": json_result.get("extracted_score"),
            "score_status": json_result.get("score_status"),

            "input_scoreof100": json_result.get("input_scoreof100"),
            "extracted_scoreof100": json_result.get("extracted_scoreof100"),
            "scoreof100_status": json_result.get("scoreof100_status"),

            "input_rank": json_result.get("input_rank"),
            "extracted_rank": json_result.get("extracted_rank"),
            "rank_status": json_result.get("rank_status"),
                }
            )
            status_text = "created" if created else "updated"
            return Response({'status': f'Result for ID {obj.id} was {status_text}.'}, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({'error': f'Failed to save result: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class BulkSaveResultsAPIView(APIView):
    def post(self, request, *args, **kwargs):
        results_list = request.data.get('results', [])
        if not isinstance(results_list, list) or not results_list:
            return Response({'error': 'A non-empty list of results is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        saved_count = 0
        errors = []
        for result_data in results_list:
            try:
                # Use the save function from tasks.py
                save_parsed_result(result_data)
                saved_count += 1
            except Exception as e:
                errors.append(f"ID {result_data.get('id', 'N/A')}: {e}")
        
        if errors:
            return Response({
                'status': f'Partial success. Saved {saved_count} of {len(results_list)} results.',
                'errors': errors
            }, status=status.HTTP_207_MULTI_STATUS)
        return Response({'status': f'Successfully saved {saved_count} results.'}, status=status.HTTP_200_OK)