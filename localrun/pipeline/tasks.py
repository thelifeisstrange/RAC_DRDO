# localrun/pipeline/tasks.py
import os
import shutil
from celery import shared_task
from django.conf import settings

from .models import VerificationJob, VerificationResult # Use the simple Result model
from .workers.load_csv_worker import load_and_prepare_csv
from .workers.compress_worker import process_and_compress
from .workers.extract_worker import extract_and_parse
from .workers.verify_worker import verify_and_create_row # Use the simple verify function
from .workers.derive_worker import derive_paper_code

@shared_task
def run_verification_pipeline(job_id, master_csv_path, source_file_paths):
    job = VerificationJob.objects.get(id=job_id)
    job.status = 'PROCESSING'
    job.save()

    temp_compress_dir = os.path.join(settings.MEDIA_ROOT, 'temp_compress', str(job_id))
    os.makedirs(temp_compress_dir, exist_ok=True)

    try:
        master_df = load_and_prepare_csv(master_csv_path)
        if master_df is None: raise Exception("Failed to load master data.")

        final_headers = [
            'id', 'email', 'phone', 
            'input_name', 'extracted_name', 'name_status',
            'input_father_name', 'extracted_father_name', 'father_name_status',
            'input_reg_id', 'extracted_reg_id', 'reg_id_status', 
            'input_year', 'extracted_year', 'year_status',
            'input_paper_code', 'extracted_paper_code', 'paper_code_status',
            'input_score', 'extracted_score', 'score_status', 
            'input_scoreof100', 'extracted_scoreof100', 'scoreof100_status', 
            'input_rank', 'extracted_rank', 'rank_status'
        ]
        # The AI needs to extract 7 fields now (including father_name)
        base_extract_headers = ['name', 'father_name', 'registration_id', 'year', 'score', 'scoreof100', 'rank']
        prompt = "Extract Candidate Name, Father's Name, Registration Number - 13 Character, Year of Examination, Gate score, Marks out of 100, All India ranking comma saperated in a single line. Example output format: Candidate's Name, Father's Name, RegNo, Year, GATE Score, Marks, All India Rank"

        for file_path in source_file_paths:
            file_name = os.path.basename(file_path)
            # --- START OF THE FIX ---
            # We now capture the second return value into a variable named 'compress_msg'
            compressed_path, compress_msg = process_and_compress(file_path, temp_compress_dir, poppler_path=settings.POPPLER_PATH)
            
            # And we print it to the log!
            print(f"[COMPRESS WORKER] Compress status for {file_name}: {compress_msg}")
            # --- END OF THE FIX ---
            
            if not compressed_path:
                result_row_list = [file_name.split('_')[0], 'N/A', 'N/A', 'N/A', 'COMPRESSION_FAILED', 'False'] + [''] * (len(final_headers) - 6)
            else:
                extracted_data_list = extract_and_parse(compressed_path, prompt, len(base_extract_headers))
                extracted_dict = dict(zip(base_extract_headers, extracted_data_list)) if isinstance(extracted_data_list, list) and len(extracted_data_list) == len(base_extract_headers) else {}
                # Call the new derive worker to add the paper_code
                extracted_dict_with_code = derive_paper_code(extracted_dict)

                # Pass the dictionary to the verify worker
                result_row_list = verify_and_create_row(master_df, file_path, extracted_dict_with_code)
            
            result_dict = dict(zip(final_headers, result_row_list))
            VerificationResult.objects.create(job=job, data=result_dict)
            print(f"[CELERY TASK] Saved result for {file_name} to database.")

        job.status = 'COMPLETE'
        job.details = f"Successfully processed {len(source_file_paths)} documents."
        job.save()

    except Exception as e:
        job.status = 'FAILED'
        job.details = f"An error occurred: {e}"
        job.save()
        raise e
    finally:
        if os.path.exists(temp_compress_dir):
            shutil.rmtree(temp_compress_dir)