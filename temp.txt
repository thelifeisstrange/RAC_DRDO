# localrun/pipeline/workers/extract_worker.py

import os
import base64
import mimetypes
# Removed unused imports: requests, json
from together import Together

# --- CHANGE 1: Initialize client to None at the module level ---
client = None

def initialize_client():
    """
    Initializes the global client using the environment variable.
    This must be called by the main script AFTER load_dotenv().
    """
    global client
    # The API key is now expected to be in the environment when this is called
    client = Together()
    print("-> Extract worker client initialized successfully.")

def extract_and_parse(image_path, prompt, expected_columns):
    """
    Extracts data from an image by calling the Together AI API,
    then parses the response.
    """
    raw_response = _extract_data_from_local_model(image_path, prompt)

    if raw_response.startswith("ERROR:"):
        return [f"API_OR_FILE_ERROR: {raw_response}"] + [''] * (expected_columns - 1)

    # Clean up potential markdown or extra text from the model's response
    cleaned_response = raw_response.replace('*', '').replace('`', '').strip()

    parsed_values = [value.strip() for value in cleaned_response.split(',')]

    if len(parsed_values) == expected_columns:
        return parsed_values
    else:
        error_msg = f"PARSE_ERROR: Expected {expected_columns}, got {len(parsed_values)}. Raw: '{raw_response}'"
        return [error_msg] + [''] * (expected_columns - 1)


def _encode_image_to_base64_uri(file_path):
    """Helper function to read an image and encode it as a Data URI."""
    mime_type, _ = mimetypes.guess_type(file_path)
    if not mime_type or not mime_type.startswith('image'):
        raise ValueError(f"File is not a recognized image type: {file_path}")
    with open(file_path, "rb") as image_file:
        base64_data = base64.b64encode(image_file.read()).decode('utf-8')
    # This full Data URI format is compatible with the Together AI API
    return f"data:{mime_type};base64,{base64_data}"


def _extract_data_from_local_model(image_path, prompt):
    """
    This is the new core function. It sends a request to the Together AI API
    using the initialized client. The function name is kept for compatibility.
    """
    if client is None:
        return "ERROR: Together AI client is not initialized. Call initialize_client() first."

    try:
        # Use the existing helper to encode the image
        base64_uri = _encode_image_to_base64_uri(image_path)

        print(f"[EXTRACT WORKER] Sending request to Together API for: {os.path.basename(image_path)}")

        # --- THIS IS THE API CALL USING THE 'together' CLIENT ---
        response = client.chat.completions.create(
            model="meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": base64_uri}}
                ]
            }],
            max_tokens=256,
            temperature=0.1
        )
        # --- END OF THE API CALL ---

        content = response.choices[0].message.content
        print(f"[EXTRACT WORKER] Received response: '{content[:70].strip()}...'")
        
        return content.strip()

    except ValueError as e: # Catches file-related error from _encode_image_to_base64_uri
        return f"ERROR: File error - {e}"
    except Exception as e:
        # This will catch API errors from Together (auth, rate limits) and other issues.
        return f"ERROR: An unexpected error occurred during API extraction - {e}"

# --- ADD THIS NEW FUNCTION ---
def extract_single_field(image_path, field_name, context_hint=""):
    """
    Uses a highly focused prompt to extract only one specific field from an image.

    Args:
        image_path (str): Path to the compressed image.
        field_name (str): The name of the field to extract (e.g., "Registration Number").
        context_hint (str): Optional hint to help the model, like the candidate's name.

    Returns:
        str: The extracted value for the single field, or None if it fails.
    """
    print(f"[EXTRACT WORKER - RETRY] Attempting to re-extract '{field_name}'...")
    
    # Create a very specific and strict prompt
    prompt = (
        f"The document shows information for a candidate named '{context_hint}'. "
        f"Analyze the image and extract ONLY the {field_name}. "
        f"Do not provide any other text, labels, or explanations. "
        f"Just return the value of the {field_name}."
    )

    # This call now correctly routes to the Together AI API via the modified function
    raw_response = _extract_data_from_local_model(image_path, prompt)

    if raw_response.startswith("ERROR:"):
        print(f"[EXTRACT WORKER - RETRY] Failed: {raw_response}")
        return None
    
    # Clean the response, removing potential markdown or labels
    cleaned_response = raw_response.replace(f"{field_name}:", "").strip().replace('*', '').replace('`', '')
    
    print(f"[EXTRACT WORKER - RETRY] Success. Re-extracted value: '{cleaned_response}'")
    return cleaned_response