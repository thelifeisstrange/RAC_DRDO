# localrun/pipeline/tasks.py
import os
import shutil
from celery import shared_task
from django.conf import settings

# from localrun.pipeline.workers.scanner_worker import scan_for_gate_scorecards

from .models import VerificationJob, VerificationResult, ParsedResult # Use the simple Result model
from .workers.load_csv_worker import load_and_prepare_csv
from .workers.compress_worker import process_and_compress
from .workers.local_extract_worker import extract_and_parse, extract_single_field
# from .workers.extract_worker import extract_and_parse, extract_single_field, initialize_client
from .workers.verify_worker import verify_and_create_row # Use the simple verify function
from .workers.derive_worker import derive_paper_code
from .workers.scanner_worker import scan_for_gate_scorecards
from .workers.orientation_worker import correct_orientation_in_place

@shared_task
def run_verification_pipeline(job_id, master_csv_path, source_folder_path):
    job = VerificationJob.objects.get(id=job_id)
    job.status = 'PROCESSING'
    job.save()

    temp_compress_dir = os.path.join(settings.MEDIA_ROOT, 'temp_compress', str(job_id))
    os.makedirs(temp_compress_dir, exist_ok=True)

    try:
        # initialize_client()

        files_to_process = scan_for_gate_scorecards(source_folder_path)

        for applicant_id, file_path in files_to_process.items():
            file_name = os.path.basename(file_path)

        if not files_to_process:
            raise Exception("Scanner did not find any valid gate_scorecard files.")
        
        
        master_df = load_and_prepare_csv(master_csv_path)
        if master_df is None: raise Exception("Failed to load master data.")

        final_headers = [
            'id',
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
        prompt = """From the provided image of a GATE scorecard, extract the specified fields. The output MUST be a single line of comma-separated values without any headers or labels.
        Fields to Extract:
            1.Candidate's Name
            2.Father's Name
            3.Registration Number: This is a critical 13-character alphanumeric code. It follows a strict pattern: XXYYSA####### where:
                                    XX is the 2-letter paper code (e.g., CS, ME, EC).
                                    YY is the 2-digit examination year (e.g., 22 for 2022).
                                    SA is the session identifier, like S1, S2, S3, etc.
                                    ####### is the 7-digit unique applicant ID - Numbers Only.
                                    The entire string (e.g., CS22S12093082) MUST be extracted as one piece.
            4.Year of Examination: Extract the 4-digit year.
            5.GATE Score: The normalized score, typically out of 1000.
            6.Marks out of 100: The actual marks obtained by the candidate.
            7.All India Rank: The candidate's rank, often labeled as AIR.
            Output Format Example:
            John Doe,Robert Doe,CS24S21098765,2024,850,85.50,123"""

        for applicant_id, file_path in files_to_process.items():
            file_name = os.path.basename(file_path)
            # --- START OF THE FIX ---
            # We now capture the second return value into a variable named 'compress_msg'
            compressed_path, compress_msg = process_and_compress(file_path, temp_compress_dir, poppler_path=settings.POPPLER_PATH)
            
            # And we print it to the log!
            print(f"[COMPRESS WORKER] Compress status for {file_name}: {compress_msg}")
            # --- END OF THE FIX ---
            
            if not compressed_path:
                result_row_list = [file_name.split('_')[0], 'COMPRESSION_FAILED', 'False'] + [''] * (len(final_headers) - 3)
            else:

                orientation_success = correct_orientation_in_place(compressed_path)
                if not orientation_success:
                    print(f"[PIPELINE] WARNING: Orientation correction failed for {file_name}. Proceeding with original compressed image.")
                    
                # Step 1: Initial broad extraction
                extracted_data_list = extract_and_parse(compressed_path, prompt, len(base_extract_headers))
                extracted_dict = dict(zip(base_extract_headers, extracted_data_list)) if isinstance(extracted_data_list, list) and len(extracted_data_list) == len(base_extract_headers) else {}
                
                # Step 2: Initial verification
                # We will re-run this later if a retry happens.
                _, failed_fields = verify_and_create_row(master_df, applicant_id, extracted_dict)

                # Step 3: Check for registration_id failure and trigger retry
                if 'registration_id' in failed_fields:
                    print(f"[RETRY LOGIC] Registration ID failed for {file_name}. Triggering focused extraction.")
                
                    master_row = master_df.loc[applicant_id]
                    candidate_name_hint = master_row.get('name', '')
                    
                    # The new_reg_id is created and used ONLY inside this block
                    new_reg_id = extract_single_field(compressed_path, "Registration Number", candidate_name_hint)
                    
                    if new_reg_id:
                        print(f"[RETRY LOGIC] Success. Old: '{extracted_dict.get('registration_id')}', New: '{new_reg_id}'")
                        extracted_dict['registration_id'] = new_reg_id
                
                # Step 4: Always run derivation on the (potentially corrected) dictionary
                final_extracted_dict = derive_paper_code(extracted_dict)

                # Step 5: Run the final verification on the fully populated dictionary to get the final report row
                result_row_list, _ = verify_and_create_row(master_df, applicant_id, final_extracted_dict)

            
            result_dict = dict(zip(final_headers, result_row_list))
            # --- sanitize for JSON safety ---
            result_dict = {k: ("" if v is None or str(v) == "nan" else str(v)) for k, v in result_dict.items()}

            VerificationResult.objects.create(job=job, data=result_dict)
            save_verification_result(result_dict)
            # save_verification_result(result_dict)
            print(f"[CELERY TASK] Saved result for {file_name} to database.")

        job.status = 'COMPLETE'
        job.details = f"Successfully processed the documents."
        job.save()

    except Exception as e:
        job.status = 'FAILED'
        job.details = f"An error occurred: {e}"
        job.save()
        raise e
    finally:
        if os.path.exists(temp_compress_dir):
            shutil.rmtree(temp_compress_dir)

def save_verification_result(json_result):
    """
    Takes the JSON result (dict) and saves into VerificationResult table.
    """
    obj, created = ParsedResult.objects.update_or_create(
        id=json_result.get("id"),
        defaults={

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
    return obj