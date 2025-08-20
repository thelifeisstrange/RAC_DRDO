# pipeline/management/commands/run_verification.py
import os
import pandas as pd
from django.core.management.base import BaseCommand
from django.conf import settings # Use Django settings instead of os.getenv
from concurrent.futures import ThreadPoolExecutor, as_completed

# Import your workers using their new path
from pipeline.workers.load_csv_worker import load_and_prepare_csv
from pipeline.workers.compress_worker import process_and_compress
from pipeline.workers.extract_worker import extract_and_parse, initialize_client
from pipeline.workers.verify_worker import verify_and_create_row
from pipeline.models import VerificationJob # Import our new model

class Command(BaseCommand):
    help = 'Runs the full document verification pipeline from local folders.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('--- STARTING VERIFICATION PIPELINE ---'))

        # Create a new job entry in the database for this run
        job = VerificationJob.objects.create(status='PROCESSING')
        self.stdout.write(f"Created Job ID: {job.id} with status '{job.status}'")

        try:
            # --- This is your adapted run_pipeline.py logic ---
            initialize_client()

            master_df = load_and_prepare_csv(settings.MASTER_CSV_PATH)
            if master_df is None:
                raise Exception("Failed to load master data.")

            config = {
                'source_folder': settings.SOURCE_FOLDER,
                'compressed_folder': settings.COMPRESSED_FOLDER,
                'verification_excel_path': settings.VERIFICATION_EXCEL_PATH,
                'poppler_path': settings.POPPLER_PATH,
                'user_prompt': "Extract Candidate Name, Registration Number, Year of Examination, Gate score, Marks out of 100, All India ranking comma saperated in a single line. Example output format: Candidate's Name, RegNo, Year, GATE Score, Marks, All India Rank", # Your full prompt
            }
            
            final_headers = ['id', 'email', 'phone', 'input_name', 'extracted_name', 'name_status', 'input_reg_id', 'extracted_reg_id', 'reg_id_status', 'input_year', 'extracted_year', 'year_status', 'input_score', 'extracted_score', 'score_status', 'input_scoreof100', 'extracted_scoreof100', 'scoreof100_status', 'input_rank', 'extracted_rank', 'rank_status']

            all_source_files = [os.path.join(config['source_folder'], f) for f in os.listdir(config['source_folder']) if f.lower().endswith(('.pdf', '.png', '.jpg', '.jpeg', '.webp'))]
            self.stdout.write(f"Found {len(all_source_files)} files to process.")

            all_results = []
            with ThreadPoolExecutor(max_workers=5) as executor:
                future_to_file = {executor.submit(self.run_single_file, file_path, config, master_df): file_path for file_path in all_source_files}
                for future in as_completed(future_to_file):
                    result_row = future.result()
                    all_results.append(result_row)
            
            # Write to Excel
            results_df = pd.DataFrame(all_results, columns=final_headers)
            results_df.to_excel(config['verification_excel_path'], index=False)
            
            # --- Update the job status on success ---
            job.status = 'COMPLETE'
            job.report_file_path = config['verification_excel_path']
            job.details = f"Successfully processed {len(all_source_files)} files."
            job.save()
            self.stdout.write(self.style.SUCCESS(f"--- PIPELINE COMPLETE ---"))
            self.stdout.write(f"Job {job.id} finished. Report saved to {job.report_file_path}")

        except Exception as e:
            # --- Update the job status on failure ---
            job.status = 'FAILED'
            job.details = f"An error occurred: {e}"
            job.save()
            self.stderr.write(self.style.ERROR(f"--- PIPELINE FAILED ---"))
            self.stderr.write(f"Job {job.id} failed. Error: {e}")

    def run_single_file(self, source_path, config, master_df):
        # This is the helper function from your old script
        file_name = os.path.basename(source_path)
        self.stdout.write(f"  Processing: {file_name}")

        compressed_path, _ = process_and_compress(source_path, config['compressed_folder'], poppler_path=config['poppler_path'])
        if not compressed_path:
            return [file_name, 'COMPRESSION_FAILED'] + [''] * 20

        base_extract_headers = ['name', 'registration_id', 'year', 'score', 'scoreof100', 'rank']
        extracted_data = extract_and_parse(compressed_path, config['user_prompt'], len(base_extract_headers))
        
        return verify_and_create_row(master_df, source_path, extracted_data, base_extract_headers)