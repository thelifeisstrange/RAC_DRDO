# localrun/pipeline/workers/extract_worker.py

import os
import base64
import mimetypes
import requests
import json
import time

def extract_and_parse(image_path, prompt, expected_columns):
    """
    Extracts data from an image by calling the local llama-server.
    If a PARSE_ERROR occurs, it will automatically retry up to 2 more times (3 total attempts).
    """
    # --- START OF NEW RETRY LOGIC ---
    max_attempts = 3
    for attempt in range(max_attempts):
        print(f"[EXTRACT WORKER] Attempt {attempt + 1}/{max_attempts} for: {os.path.basename(image_path)}")
        
        # Call the underlying extraction function
        raw_response = _extract_data_from_local_model(image_path, prompt)

        # Check for network or catastrophic API errors first. These should not be retried.
        if raw_response.startswith("ERROR:"):
            return [f"API_OR_FILE_ERROR: {raw_response}"] + [''] * (expected_columns - 1)

        # Clean up potential markdown, backticks, and other common LLM artifacts
        cleaned_response = raw_response.replace('*', '').replace('`', '').strip()
        
        # Parse the cleaned response
        parsed_values = [value.strip() for value in cleaned_response.split(',')]

        # Check if parsing was successful
        if len(parsed_values) == expected_columns:
            print(f"[EXTRACT WORKER] Success on attempt {attempt + 1}.")
            return parsed_values # If successful, exit the loop and return the data
        
        # If parsing failed, log it and prepare for the next attempt
        print(f"[EXTRACT WORKER] WARNING: Parse error on attempt {attempt + 1}. Expected {expected_columns}, got {len(parsed_values)}. Raw: '{raw_response}'")
        
        # If this wasn't the last attempt, wait a moment before retrying
        if attempt < max_attempts - 1:
            print("[EXTRACT WORKER] Waiting 1 second before retrying...")
            time.sleep(1)

    # --- END OF NEW RETRY LOGIC ---

    # If the loop finishes without a successful return, it means all attempts failed.
    # We construct the final error message from the last attempt's data.
    print(f"[EXTRACT WORKER] All {max_attempts} attempts failed. Returning final parse error.")
    final_error_msg = f"PARSE_ERROR: After {max_attempts} attempts, still failed. Expected {expected_columns}, got {len(parsed_values)}. Last Raw Response: '{raw_response}'"
    return [final_error_msg] + [''] * (expected_columns - 1)


def _encode_image_to_base64_uri(file_path):
    """Helper function to read an image and encode it as a Data URI."""
    mime_type, _ = mimetypes.guess_type(file_path)
    if not mime_type or not mime_type.startswith('image'):
        raise ValueError(f"File is not a recognized image type: {file_path}")
    with open(file_path, "rb") as image_file:
        base64_data = base64.b64encode(image_file.read()).decode('utf-8')
    # The llama.cpp server's OpenAI-compatible endpoint expects this full Data URI format
    return f"data:{mime_type};base64,{base64_data}"


def _extract_data_from_local_model(image_path, prompt):
    """
    This is the new core function. It sends a request to your local
    llama-server with the correct OpenAI-compatible payload for vision models.
    """
    try:
        # The URL for the local llama-server's CHAT completions endpoint
        url = "http://host.docker.internal:8080/v1/chat/completions"
        # url = "http://127.0.0.1:8080/v1/chat/completions" # <-- Using the standard chat endpoint
        
        image_data_uri = _encode_image_to_base64_uri(image_path)
        
        # --- START OF THE CRITICAL FIX ---
        # This is the correct, modern, OpenAI-compatible format for multi-modal input.
        # It's a list of message objects, where the user's message content is a list of parts.
        payload = {
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "image_url", "image_url": {"url": image_data_uri}},
                        {"type": "text", "text": prompt}
                    ]
                }
            ],
            "max_tokens": 256,
            "temperature": 0.1
        }
        # --- END OF THE CRITICAL FIX ---

        headers = {"Content-Type": "application/json"}

        print(f"[EXTRACT WORKER] Sending request to local model for: {os.path.basename(image_path)}")
        response = requests.post(url, headers=headers, data=json.dumps(payload), timeout=300)
        response.raise_for_status()
        
        response_data = response.json()
        content = response_data['choices'][0]['message']['content']
        print(f"[EXTRACT WORKER] Received response: '{content[:70].strip()}...'")
        
        return content.strip()

    except requests.exceptions.RequestException as e:
        return f"ERROR: Network error connecting to local model - {e}"
    except Exception as e:
        return f"ERROR: An unexpected error occurred in local extraction - {e}"
    
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

    # We can reuse the main extraction logic, which now returns an error string on failure
    raw_response = _extract_data_from_local_model(image_path, prompt)

    if raw_response.startswith("ERROR:"):
        print(f"[EXTRACT WORKER - RETRY] Failed: {raw_response}")
        return None
    
    # Clean the response, removing potential markdown or labels
    cleaned_response = raw_response.replace(f"{field_name}:", "").strip().replace('*', '').replace('`', '')
    
    print(f"[EXTRACT WORKER - RETRY] Success. Re-extracted value: '{cleaned_response}'")
    return cleaned_response
