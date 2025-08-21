# localrun/pipeline/workers/verify_worker.py
import os
import string
import pandas as pd

# The function name is kept the same to avoid import errors in your existing tasks.py
def verify_and_create_row(master_df, source_file_path, extracted_data_dict):
    """
    Verifies a single file and creates a flat list for the final report.
    This version is updated to handle the new father_name and paper_code fields.
    """
    base_name = os.path.splitext(os.path.basename(source_file_path))[0]
    file_id = base_name.split('_')[0]

    if file_id not in master_df.index:
        return [file_id, 'ID NOT FOUND IN MASTER CSV'] + [''] * 25

    master_row = master_df.loc[file_id]

    if not isinstance(extracted_data_dict, dict) or not extracted_data_dict:
        error_msg = "PARSE_ERROR: Extracted data is not a valid dictionary."
        return [file_id, master_row.get('email', 'N/A'), master_row.get('phone', 'N/A'), error_msg] + [''] * 23
    
    final_row = [file_id, master_row.get('email', 'N/A'), master_row.get('phone_number', 'N/A')]
    chars_to_strip = string.whitespace + '.,'

    failed_fields = []


    fields_to_compare = {
        'name': 'name',
        'father_name': 'father_name',
        'registration_id': 'registration_id',
        'year': 'year',
        'paper_code': 'paper_code',
        'score': 'score',
        'scoreof100': 'scoreof100',
        'rank': 'rank'
    }

    for report_field, master_data_field in fields_to_compare.items():
        input_val = master_row.get(master_data_field)
        extracted_val = extracted_data_dict.get(report_field, 'N/A')
        
        compare_input = str(input_val if pd.notna(input_val) else '').lower().strip(chars_to_strip)
        compare_extracted = str(extracted_val).lower().strip(chars_to_strip)
        
        status = "True" if (compare_input == compare_extracted and compare_input != '') else "False"

        # NEW: If the status is False, add the field name to our tracking list.
        if status == "False":
            failed_fields.append(report_field) # Use the key, e.g., 'registration_id'
        
        final_row.extend([input_val if pd.notna(input_val) else 'n/a', extracted_val, status])
                
    return final_row, failed_fields