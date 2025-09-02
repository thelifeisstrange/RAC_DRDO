# localrun/pipeline/workers/scanner_worker.py
import os

def scan_for_gate_scorecards(root_path):
    """
    Scans a root directory for candidate sub-folders (e.g., 'can_12345')
    and finds the 'gate_scorecard' file within each.

    Returns:
        dict: A dictionary mapping applicant_id to the full file path.
    """
    found_files = {}
    print(f"[SCANNER] Starting scan in: {root_path}")
    if not os.path.isdir(root_path):
        print(f"[SCANNER] ERROR: Provided path is not a valid directory.")
        return found_files

    for dir_name in os.listdir(root_path):
        if dir_name.lower().startswith('can_'):
            try:
                applicant_id = dir_name.split('_')[1]
                candidate_folder = os.path.join(root_path, dir_name)
                
                if os.path.isdir(candidate_folder):
                    for file_name in os.listdir(candidate_folder):
                        if 'gate_scorecard' in file_name.lower():
                            found_files[applicant_id] = os.path.join(candidate_folder, file_name)
                            print(f"[SCANNER] Found gate_scorecard for ID {applicant_id}")
                            break # Move to the next candidate folder
            except IndexError:
                print(f"[SCANNER] Skipping malformed directory: {dir_name}")
                continue
    
    print(f"[SCANNER] Scan complete. Found {len(found_files)} gate scorecards.")
    return found_files