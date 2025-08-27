# advertisements/table_manager.py

from django.db import connection
from .dynamic_models import PARSED_RESULT_FIELDS_BLUEPRINT

def create_results_table_for_advertisement(table_name: str):
    """
    Executes a raw SQL 'CREATE TABLE' statement to create a new results table.

    Args:
        table_name (str): The safe, unique name for the new table (e.g., 'parsed_results_3').
    """
    print(f"[TABLE MANAGER] Attempting to create table: {table_name}")

    # Start building the SQL query
    fields_sql = ",\n".join([f'"{col_name}" {col_type}' for col_name, col_type in PARSED_RESULT_FIELDS_BLUEPRINT.items()])
    create_table_query = f"""
    CREATE TABLE IF NOT EXISTS "{table_name}" (
        {fields_sql}
    );
    """
    
    try:
        with connection.cursor() as cursor:
            # The 'IF NOT EXISTS' clause makes this operation safe to run multiple times.
            cursor.execute(create_table_query)
        print(f"[TABLE MANAGER] Table '{table_name}' created successfully or already exists.")
        return True, None
    except Exception as e:
        error_message = f"Failed to create table '{table_name}': {e}"
        print(f"[TABLE MANAGER] ERROR: {error_message}")
        return False, error_message


def save_results_to_table(table_name: str, results_list: list):
    """
    Executes a raw SQL 'INSERT' statement to save a list of results
    into a dynamically specified table.

    Args:
        table_name (str): The name of the target results table.
        results_list (list): A list of dictionaries, where each dict is a result row.
    """
    if not results_list:
        return 0, ["No results provided to save."]
    
    print(f"[TABLE MANAGER] Attempting to save {len(results_list)} results to table: {table_name}")

    # The column names from our blueprint, ensuring order is consistent.
    column_names = list(PARSED_RESULT_FIELDS_BLUEPRINT.keys())
    
    # Create a list of tuples, where each tuple contains the values for one row.
    # We use .get(col, None) to handle cases where a key might be missing from a result dict.
    rows_to_insert = [
        tuple(result.get(col) for col in column_names)
        for result in results_list
    ]
    
    # Build the SQL query for bulk insertion
    columns_sql = ", ".join([f'"{col}"' for col in column_names])
    placeholders_sql = ", ".join(["%s"] * len(column_names))
    
    # Using ON CONFLICT (id) DO UPDATE makes the operation idempotent. If a result
    # with the same ID is sent again, it will update the existing row instead of failing.
    insert_query = f"""
    INSERT INTO "{table_name}" ({columns_sql})
    VALUES ({placeholders_sql})
    ON CONFLICT (id) DO UPDATE SET
        {", ".join([f'"{col}" = EXCLUDED."{col}"' for col in column_names if col != 'id'])}
    """

    try:
        with connection.cursor() as cursor:
            # The `executemany` method is highly efficient for bulk inserts.
            cursor.executemany(insert_query, rows_to_insert)
        print(f"[TABLE MANAGER] Successfully saved {len(rows_to_insert)} rows.")
        return len(rows_to_insert), None
    except Exception as e:
        error_message = f"Failed to insert data into '{table_name}': {e}"
        print(f"[TABLE MANAGER] ERROR: {error_message}")
        return 0, [error_message]