# pipeline/tasks.py
import os
import shutil
import pandas as pd
from celery import shared_task
from django.conf import settings
from .models import VerificationJob, VerificationResult
from .workers.load_csv_worker import load_and_prepare_csv
from .workers.compress_worker import process_and_compress
from .workers.extract_worker import extract_and_parse, initialize_client
from .workers.verify_worker import verify_and_create_row

@shared_task
def run_verification_pipeline(job_id):
    job = VerificationJob.objects.get(id=job_id)
    job.status = 'PROCESSING'
    job.save()

    temp_compress_dir = os.path.join(settings.MEDIA_ROOT, 'temp_compress', str(job_id))
    os.makedirs(temp_compress_dir, exist_ok=True)

    try:
        # ... (logic to find master_csv_path and source_file_paths) ...
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads', str(job_id))
        master_csv_paths = [os.path.join(upload_dir, f) for f in os.listdir(upload_dir) if f.lower().endswith('.csv')]
        if not master_csv_paths: raise Exception(f"Fatal: No master CSV file found in job directory {upload_dir}")
        master_csv_path = master_csv_paths[0]
        source_file_paths = [os.path.join(upload_dir, f) for f in os.listdir(upload_dir) if f.lower().endswith(('.pdf', '.png', '.jpg', '.jpeg', '.webp'))]
        if not source_file_paths: raise Exception(f"Fatal: No source documents found in job directory {upload_dir}")

        initialize_client()
        master_df = load_and_prepare_csv(master_csv_path)
        if master_df is None:
            raise Exception("Failed to load and prepare the master CSV data.")

        final_headers = ['id', 'email', 'phone', 'input_name', 'extracted_name', 'name_status', 'input_reg_id', 'extracted_reg_id', 'reg_id_status', 'input_year', 'extracted_year', 'year_status', 'input_score', 'extracted_score', 'score_status', 'input_scoreof100', 'extracted_scoreof100', 'scoreof100_status', 'input_rank', 'extracted_rank', 'rank_status']
        base_extract_headers = ['name', 'registration_id', 'year', 'score', 'scoreof100', 'rank']

        processed_count = 0
        for file_path in source_file_paths:
            print(f"[CELERY TASK] Processing file: {os.path.basename(file_path)}")
            
            file_name = os.path.basename(file_path)
            compressed_path, _ = process_and_compress(file_path, temp_compress_dir, poppler_path=settings.POPPLER_PATH)
            
            if not compressed_path:
                result_row_list = [file_name.split('_')[0], 'N/A', 'N/A', 'N/A', 'COMPRESSION_FAILED', 'False'] + [''] * (len(final_headers) - 6)
            else:
                extracted_data = extract_and_parse(compressed_path, "Extract Candidate Name, Registration Number, Year of Examination, Gate score, Marks out of 100, All India ranking comma saperated in a single line. Example output format: Candidate's Name, RegNo, Year, GATE Score, Marks, All India Rank", len(base_extract_headers))
                result_row_list = verify_and_create_row(master_df, file_path, extracted_data, base_extract_headers)
            
            result_dict = dict(zip(final_headers, result_row_list))

            # --- START OF THE ROBUST FIX ---
            # Sanitize the dictionary to ensure all values are JSON-serializable strings.
            # This converts any potential `nan` or other non-JSON types.
            sanitized_dict = {key: str(value) for key, value in result_dict.items()}
            # --- END OF THE ROBUST FIX ---

            # Save the sanitized dictionary to the database.
            VerificationResult.objects.create(job=job, data=sanitized_dict)
            print(f"[CELERY TASK] Saved result for {file_name} to the database.")
            
            processed_count += 1
        
        job.status = 'COMPLETE'
        job.details = f"Successfully processed all {processed_count} files."
        job.save()

    except Exception as e:
        job.status = 'FAILED'
        job.details = f"An error occurred: {e}"
        job.save()
        raise e
    
    finally:
        if os.path.exists(temp_compress_dir):
            print(f"[CELERY TASK] Cleaning up temporary directory: {temp_compress_dir}")
            shutil.rmtree(temp_compress_dir)