# pipeline/workers/load_csv_worker.py
import pandas as pd

def load_and_prepare_csv(file_path: str) -> pd.DataFrame:
    """
    Loads the master user CSV, prepares it for matching, and sets the ID as the index.
    This version is robust and can handle CSVs with more columns than expected.
    """
    try:
        print(f"Attempting to load master data from: {file_path}")
        df = pd.read_csv(file_path, header=None, dtype=str, engine='python')

        # --- START OF THE ROBUST FIX ---
        
        # Define the base names for the columns we know about.
        base_column_names = [
            'id', 'email', 'name', 'father_name', 'phone', 'registration_id', 'year', 'paper_code',
            'score', 'scoreof100', 'rank'
        ]
        
        # Get the actual number of columns found in the CSV file.
        num_actual_columns = len(df.columns)
        
        final_column_names = base_column_names[:num_actual_columns]

        # If the CSV has MORE columns than our base list, generate generic names for them.
        if num_actual_columns > len(base_column_names):
            for i in range(len(base_column_names), num_actual_columns):
                final_column_names.append(f'extra_col_{i + 1 - len(base_column_names)}')
        
        # Assign the perfectly sized list of names to the DataFrame.
        df.columns = final_column_names

        print(f"-> CSV has {num_actual_columns} columns. Assigned names: {final_column_names}")
        
        # --- END OF THE ROBUST FIX ---
        
        # Now we only strip whitespace and do NOT convert to lowercase.
        df_prepared = df.apply(lambda x: x.str.strip())
        
        if 'id' in df_prepared.columns:
            df_prepared = df_prepared.set_index('id')
            print("-> Master data loaded and prepared successfully (original case preserved).")
            return df_prepared
        else:
            print("Error: 'id' column not found in the master CSV.")
            return None

    except FileNotFoundError:
        print(f"Error: The master CSV file was not found at '{file_path}'.")
        return None
    except Exception as e:
        print(f"An unexpected error occurred while loading the master CSV: {e}")
        return None