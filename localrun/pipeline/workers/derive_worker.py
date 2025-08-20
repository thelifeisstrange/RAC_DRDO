def derive_paper_code(extracted_data_dict):
    """
    Derives the paper code from the extracted GATE registration number.
    """
    reg_no = extracted_data_dict.get('registration_id')

    if reg_no and isinstance(reg_no, str) and len(reg_no) >= 2:
        paper_code = reg_no[:2].upper()
        extracted_data_dict['paper_code'] = paper_code
        print(f"[DERIVE WORKER] Derived paper code '{paper_code}' from registration number '{reg_no}'.")
    else:
        extracted_data_dict['paper_code'] = 'N/A'
        print(f"[DERIVE WORKER] Could not derive paper code from registration number: {reg_no}")

    return extracted_data_dict