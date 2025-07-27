# load_csv_worker.py
import pandas as pd

def load_and_prepare_csv(file_path: str) -> pd.DataFrame:
    """
    Loads the master user CSV, prepares it for matching, and sets the ID as the index.
    This version PRESERVES the original case of the data.
    """
    try:
        print(f"Attempting to load master data from: {file_path}")
        df = pd.read_csv(file_path, header=None, dtype=str, engine='python')

        column_names = [
            'id', 'email', 'name', 'phone', 'registration_id', 'year', 
            'score', 'scoreof100', 'rank'
        ]
        df.columns = column_names[:len(df.columns)]
        
        # --- MODIFIED LINE ---
        # Only strip whitespace, DO NOT convert to lowercase.
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