# localrun/pipeline/workers/verify_worker.py
import os
import string
import pandas as pd

# --- THE CRITICAL CHANGE: The function now accepts applicant_id directly ---
def verify_and_create_row(master_df, applicant_id, extracted_data_dict):
    """
    Verifies a single file's data and creates a flat list for the final report.
    It now receives the applicant_id directly instead of parsing it from a filename.
    """
    
    # We no longer need to parse the ID. We use the one passed in.
    file_id = str(applicant_id)

    if file_id not in master_df.index:
        error_row = [file_id, 'ID NOT FOUND IN MASTER CSV'] + [''] * 24
        return error_row, []

    master_row = master_df.loc[file_id]

    if not isinstance(extracted_data_dict, dict) or not extracted_data_dict:
        error_msg = "PARSE_ERROR: Extracted data is not a valid dictionary."
        error_row = [file_id, error_msg] + [''] * 24
        return error_row, [] 
    
    final_row = [file_id]
    chars_to_strip = string.whitespace + '.,'
    failed_fields = []

    fields_to_compare = {
        'name': 'name',
        'father_name': 'father_name',
        'registration_id': 'registration_number',
        'year': 'gate_year',
        'paper_code': 'gate_paper_code',
        'score': 'gate_valid_score',
        'scoreof100': 'gate_mark',
        'rank': 'gate_rank'
    }

    for report_field, master_data_field in fields_to_compare.items():
        input_val = master_row.get(master_data_field)
        extracted_val = extracted_data_dict.get(report_field, 'N/A')
        
        compare_input = str(input_val if pd.notna(input_val) else '').lower().strip(chars_to_strip)
        compare_extracted = str(extracted_val).lower().strip(chars_to_strip)
        
        status = "True" if (compare_input == compare_extracted and compare_input != '') else "False"

        if status == "False":
            failed_fields.append(report_field)
        
        final_row.extend([input_val if pd.notna(input_val) else 'n/a', extracted_val, status])
                
    return final_row, failed_fields