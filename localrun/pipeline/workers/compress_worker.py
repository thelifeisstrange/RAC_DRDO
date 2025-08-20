# localrun/pipeline/workers/compress_worker.py

import os
import io
from PIL import Image
from pdf2image import convert_from_path

def process_and_compress(source_path, destination_folder, target_size_kb=100, poppler_path=None):
    """
    Processes a single source file (PDF or image), aggressively compresses it
    to be under the target file size, and saves it as a JPEG.
    """
    base_name = os.path.splitext(os.path.basename(source_path))[0]
    
    try:
        if source_path.lower().endswith('.pdf'):
            if not poppler_path:
                print(f"  -> COMPRESS_ERROR: POPPLER_PATH not configured for PDF: {base_name}")
                return None, f"SKIPPED: Poppler not configured."
            
            # Convert the first page of the PDF to a PIL Image object
            page_image = convert_from_path(pdf_path=source_path, poppler_path=poppler_path, first_page=1, last_page=1)[0]
            return _compress_image_object(page_image, base_name, destination_folder, target_size_kb)

        elif source_path.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
            with Image.open(source_path) as img_obj:
                return _compress_image_object(img_obj, base_name, destination_folder, target_size_kb)
        else:
            return None, "Unsupported file type."
            
    except Exception as e:
        return None, f"General error processing {base_name}: {e}"

def _compress_image_object(image_obj, base_name, destination_folder, target_size_kb):
    """
    Helper function that performs an aggressive, multi-stage compression to JPEG.
    """
    target_bytes = target_size_kb * 1024
    # The final output will now be a JPEG for maximum compression
    final_path = os.path.join(destination_folder, f"{base_name}.jpg")
    
    best_effort_buffer = None
    best_effort_size_kb = float('inf')

    # --- CRITICAL: JPEG does not support transparency (RGBA). Convert to RGB. ---
    if image_obj.mode == 'RGBA':
        image_obj = image_obj.convert('RGB')

    # --- The Waterfall Compression Strategy ---
    
    # Attempt 1: High-Quality Full-Size JPEG
    buffer = io.BytesIO()
    image_obj.save(buffer, format='JPEG', quality=85, optimize=True)
    current_size_kb = buffer.tell() / 1024
    if current_size_kb < best_effort_size_kb:
        best_effort_size_kb = current_size_kb
        best_effort_buffer = io.BytesIO(buffer.getvalue())
    if buffer.tell() <= target_bytes:
        with open(final_path, 'wb') as f: f.write(buffer.getvalue())
        return final_path, f"Success with JPEG (Q=85) at {current_size_kb:.1f} KB"

    # Attempt 2: Medium-Quality Full-Size JPEG
    buffer.seek(0); buffer.truncate(0) # Reset buffer
    image_obj.save(buffer, format='JPEG', quality=75, optimize=True)
    current_size_kb = buffer.tell() / 1024
    if current_size_kb < best_effort_size_kb:
        best_effort_size_kb = current_size_kb
        best_effort_buffer = io.BytesIO(buffer.getvalue())
    if buffer.tell() <= target_bytes:
        with open(final_path, 'wb') as f: f.write(buffer.getvalue())
        return final_path, f"Success with JPEG (Q=75) at {current_size_kb:.1f} KB"
        
    # Attempt 3: Iterative Resizing + Medium-Quality JPEG
    for scale_percent in [90, 75, 60, 50, 40, 30, 20]:
        new_width = int(image_obj.width * scale_percent / 100)
        new_height = int(image_obj.height * scale_percent / 100)
        resized_img = image_obj.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        buffer.seek(0); buffer.truncate(0)
        resized_img.save(buffer, format='JPEG', quality=75, optimize=True)
        
        current_size_kb = buffer.tell() / 1024
        if current_size_kb < best_effort_size_kb:
            best_effort_size_kb = current_size_kb
            best_effort_buffer = io.BytesIO(buffer.getvalue())
        if buffer.tell() <= target_bytes:
            with open(final_path, 'wb') as f: f.write(buffer.getvalue())
            return final_path, f"Success with {scale_percent}% Resize (Q=75) at {current_size_kb:.1f} KB"

    # If all attempts failed, save the smallest version we found.
    if best_effort_buffer:
        with open(final_path, 'wb') as f:
            f.write(best_effort_buffer.getvalue())
        return final_path, f"FAILED target, but saved best effort at {best_effort_size_kb:.1f} KB"
    
    return None, "All compression attempts failed."