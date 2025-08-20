# localrun/pipeline/workers/extract_worker.py

import os
import base64
import mimetypes
import requests
import json

def extract_and_parse(image_path, prompt, expected_columns):
    """
    Extracts data from an image by calling the local llama-server,
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
    # The llama.cpp server's OpenAI-compatible endpoint expects this full Data URI format
    return f"data:{mime_type};base64,{base64_data}"


def _extract_data_from_local_model(image_path, prompt):
    """
    This is the new core function. It sends a request to your local
    llama-server with the correct OpenAI-compatible payload for vision models.
    """
    try:
        # The URL for the local llama-server's CHAT completions endpoint
        url = "http://host.docker.internal:8080/v1/chat/completions" # <-- Using the standard chat endpoint
        
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