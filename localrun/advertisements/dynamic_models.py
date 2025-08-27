# advertisements/dynamic_models.py

# This dictionary is the blueprint for our dynamically created result tables.
# The keys are the column names, and the values are their SQL data types.
# This structure is based on the ParsedResult model you defined.
PARSED_RESULT_FIELDS_BLUEPRINT = {
    "id": "VARCHAR(50) PRIMARY KEY",
    "email": "VARCHAR(255)",
    "phone": "VARCHAR(50)",
    "input_name": "TEXT",
    "extracted_name": "TEXT",
    "name_status": "VARCHAR(10)",
    "input_father_name": "TEXT",
    "extracted_father_name": "TEXT",
    "father_name_status": "VARCHAR(10)",
    "input_reg_id": "VARCHAR(100)",
    "extracted_reg_id": "VARCHAR(100)",
    "reg_id_status": "VARCHAR(10)",
    "input_year": "VARCHAR(10)",
    "extracted_year": "VARCHAR(10)",
    "year_status": "VARCHAR(10)",
    "input_paper_code": "VARCHAR(50)",
    "extracted_paper_code": "VARCHAR(50)",
    "paper_code_status": "VARCHAR(10)",
    "input_score": "VARCHAR(50)",
    "extracted_score": "VARCHAR(50)",
    "score_status": "VARCHAR(10)",
    "input_scoreof100": "VARCHAR(50)",
    "extracted_scoreof100": "VARCHAR(50)",
    "scoreof100_status": "VARCHAR(10)",
    "input_rank": "VARCHAR(50)",
    "extracted_rank": "VARCHAR(50)",
    "rank_status": "VARCHAR(10)",
    "created_at": "DATETIME",
}