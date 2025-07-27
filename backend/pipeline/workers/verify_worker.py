# verify_worker.py

import os
import string

def verify_and_create_row(master_df, source_file_path, extracted_data_list, base_headers):
    """
    Verifies extracted data against the master DataFrame and creates a final CSV row.
    The report shows original-cased data, but the comparison is case-insensitive.
    """
    base_name = os.path.splitext(os.path.basename(source_file_path))[0]
    file_id = base_name.split('_')[0]

    if file_id not in master_df.index:
        return [file_id, 'ID NOT FOUND IN MASTER CSV'] + [''] * 19

    # Master row now contains original-cased data
    master_row = master_df.loc[file_id]
    
    if not isinstance(extracted_data_list, list) or len(extracted_data_list) != len(base_headers):
        error_msg = f"PARSE_ERROR: {extracted_data_list[0] if extracted_data_list else 'Empty/Error Response'}"
        return [file_id, master_row.get('email', 'N/A'), master_row.get('phone', 'N/A'), error_msg] + [''] * 18
    
    # This dictionary will contain the original-cased extracted data for reporting
    original_extracted_dict = {header: value.strip() for header, value in zip(base_headers, extracted_data_list)}
        
    final_row = []
    final_row.extend([file_id, master_row.get('email', 'N/A'), master_row.get('phone', 'N/A')])
    
    # Define characters to strip for comparison (whitespace, period, comma)
    chars_to_strip = string.whitespace + '.,'

    for field in ['name', 'registration_id', 'year', 'score', 'scoreof100', 'rank']:
        # Get the original-cased value from the master data for the report
        input_val_for_report = master_row.get(field, 'N/A')
        
        # Get the original-cased value from the AI for the report
        extracted_val_for_report = original_extracted_dict.get(field, 'N/A')
        
        # --- MODIFIED COMPARISON LOGIC ---
        # Convert BOTH sides to lowercase and clean them just for this comparison.
        # Use str() as a safeguard against non-string/None values.
        compare_input = str(input_val_for_report).lower()
        compare_extracted = str(extracted_val_for_report).lower().strip(chars_to_strip)
        
        # Perform the case-insensitive comparison
        status = "True" if (compare_input == compare_extracted) else "False"
        
        # Add the original, unaltered values to the final report row
        final_row.extend([input_val_for_report, extracted_val_for_report, status])
        
    return final_row