# pipeline/tasks.py
import os
import pandas as pd
from celery import shared_task
from django.conf import settings

from .models import VerificationJob
from .workers.load_csv_worker import load_and_prepare_csv
from .workers.compress_worker import process_and_compress
from .workers.extract_worker import extract_and_parse, initialize_client
from .workers.verify_worker import verify_and_create_row

# This decorator turns the function into a background task
@shared_task
def run_verification_pipeline(job_id, master_csv_path, source_file_paths):
    job = VerificationJob.objects.get(id=job_id)
    job.status = 'PROCESSING'
    job.save()

    try:
        initialize_client()
        master_df = load_and_prepare_csv(master_csv_path)
        if master_df is None:
            raise Exception("Failed to load master CSV data.")

        # Your pipeline config
        config = {
            'compressed_folder': settings.COMPRESSED_FOLDER,
            'verification_excel_path': settings.VERIFICATION_EXCEL_PATH,
            'poppler_path': settings.POPPLER_PATH,
            'user_prompt': "Extract Candidate Name, Registration Number, Year of Examination, Gate score, Marks out of 100, All India ranking comma saperated in a single line. Example output format: Candidate's Name, RegNo, Year, GATE Score, Marks, All India Rank", # Your full prompt
        }
        
        all_results = []
        for file_path in source_file_paths:
            # Run the single file logic
            file_name = os.path.basename(file_path)
            compressed_path, _ = process_and_compress(file_path, config['compressed_folder'], poppler_path=config['poppler_path'])
            if not compressed_path:
                all_results.append([file_name, 'COMPRESSION_FAILED'] + [''] * 20)
                continue

            base_headers = ['name', 'registration_id', 'year', 'score', 'scoreof100', 'rank']
            extracted_data = extract_and_parse(compressed_path, config['user_prompt'], len(base_headers))
            result_row = verify_and_create_row(master_df, file_path, extracted_data, base_headers)
            all_results.append(result_row)
        
        # Write to Excel
        final_headers = ['id', 'email', 'phone', 'input_name', 'extracted_name', 'name_status', 'input_reg_id', 'extracted_reg_id', 'reg_id_status', 'input_year', 'extracted_year', 'year_status', 'input_score', 'extracted_score', 'score_status', 'input_scoreof100', 'extracted_scoreof100', 'scoreof100_status', 'input_rank', 'extracted_rank', 'rank_status']
        results_df = pd.DataFrame(all_results, columns=final_headers)
        results_df.to_excel(config['verification_excel_path'], index=False)
        
        # Update job on success
        job.status = 'COMPLETE'
        job.report_file_path = config['verification_excel_path']
        job.details = f"Successfully processed {len(source_file_paths)} files."
        job.save()

    except Exception as e:
        # Update job on failure
        job.status = 'FAILED'
        job.details = f"An error occurred: {e}"
        job.save()