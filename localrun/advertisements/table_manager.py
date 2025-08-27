# advertisements/table_manager.py

from django.db import connection
from django.utils import timezone
from .dynamic_models import PARSED_RESULT_FIELDS_BLUEPRINT # We will create this next

def create_results_table_for_advertisement(table_name: str):
    """
    Executes a raw SQL 'CREATE TABLE' statement to create a new results table.
    """
    print(f"[TABLE MANAGER] Attempting to create table: {table_name}")

    fields_sql = ",\n".join([f'`{col_name}` {col_type}' for col_name, col_type in PARSED_RESULT_FIELDS_BLUEPRINT.items()])
    
    # Use 'IF NOT EXISTS' for safety
    create_table_query = f"CREATE TABLE IF NOT EXISTS `{table_name}` ({fields_sql});"
    
    try:
        with connection.cursor() as cursor:
            cursor.execute(create_table_query)
        print(f"[TABLE MANAGER] Table '{table_name}' created successfully or already exists.")
        return True, None
    except Exception as e:
        error_message = f"Failed to create table '{table_name}': {e}"
        print(f"[TABLE MANAGER] ERROR: {error_message}")
        return False, error_message

def save_results_to_table(table_name: str, results_list: list):
    """
    Executes a raw SQL bulk INSERT statement to save results to the dynamic table.
    """
    if not results_list:
        return 0, ["No results provided."]

    column_names = list(PARSED_RESULT_FIELDS_BLUEPRINT.keys())

    now = timezone.now()

    for result in results_list:
        result['created_at'] = now
    
    # Prepare data rows as tuples, ensuring the order matches column_names
    rows_to_insert = [
        tuple(result.get(col) for col in column_names)
        for result in results_list
    ]

    columns_sql = ", ".join([f'`{col}`' for col in column_names])
    placeholders_sql = ", ".join(["%s"] * len(column_names))

    # Using ON DUPLICATE KEY UPDATE for MySQL (UPSERT)
    update_sql = ", ".join([f'`{col}`=VALUES(`{col}`)' for col in column_names if col != 'id'])
    insert_query = f"""
        INSERT INTO `{table_name}` ({columns_sql}) VALUES ({placeholders_sql})
        ON DUPLICATE KEY UPDATE {update_sql}
    """

    try:
        with connection.cursor() as cursor:
            cursor.executemany(insert_query, rows_to_insert)
        return len(rows_to_insert), None
    except Exception as e:
        error_message = f"Failed to insert data into '{table_name}': {e}"
        return 0, [error_message]