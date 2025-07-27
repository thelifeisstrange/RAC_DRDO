# extract_worker.py

import os
import base64
import mimetypes
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
    Extracts data from an image, parses it, and returns a list of values.
    """
    # --- CHANGE 2: Add a check to ensure the client was initialized ---
    if client is None:
        raise Exception("Client not initialized. Please call initialize_client() first.")

    raw_response = _extract_data_from_image(image_path, prompt)

    if raw_response.startswith("ERROR:"):
        return [f"API_OR_FILE_ERROR: {raw_response}"] + [''] * (expected_columns - 1)

    parsed_values = [value.strip() for value in raw_response.split(',')]

    if len(parsed_values) == expected_columns:
        return parsed_values
    else:
        error_msg = f"PARSE_ERROR: Expected {expected_columns} fields, got {len(parsed_values)}. Raw: '{raw_response}'"
        return [error_msg] + [''] * (expected_columns - 1)


def _extract_data_from_image(image_path, prompt):
    """Helper function to call the Together AI API."""
    try:
        mime_type, _ = mimetypes.guess_type(image_path)
        if not mime_type or not mime_type.startswith('image'):
            return f"ERROR: Not a recognized image type: {image_path}"
        with open(image_path, "rb") as image_file:
            base64_uri = f"data:{mime_type};base64,{base64.b64encode(image_file.read()).decode('utf-8')}"

        response = client.chat.completions.create(
            model="meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": base64_uri}}
                ]
            }]
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"ERROR: API or other error - {e}"