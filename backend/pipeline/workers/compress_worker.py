import os
import io
from PIL import Image
from pdf2image import convert_from_path

def process_and_compress(source_path, destination_folder, target_size_kb=200, poppler_path=None):
    """
    Processes a single source file (PDF or image), compresses it, and saves it.
    Returns the path to the compressed file on success, otherwise None.
    """
    base_name = os.path.splitext(os.path.basename(source_path))[0]
    
    try:
        if source_path.lower().endswith('.pdf'):
            if not poppler_path:
                print(f"  -> COMPRESS_ERROR: POPPLER_PATH not configured for PDF: {base_name}")
                return None, f"SKIPPED: Poppler not configured."
            
            # For simplicity, we'll process only the first page of a PDF in the pipeline.
            # If you need multi-page, the logic would need to be more complex.
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
    """Helper function to perform the actual compression logic."""
    target_bytes = target_size_kb * 1024
    final_path = os.path.join(destination_folder, f"{base_name}.png")
    best_effort_buffer = None
    best_effort_size_kb = float('inf')

    # Ensure image is in a compatible mode
    if image_obj.mode not in ['RGB', 'RGBA']:
        image_obj = image_obj.convert('RGBA')

    # Attempt 1: Full-size Quantized
    buffer = io.BytesIO()
    quantized_img = image_obj.convert('P', palette=Image.Palette.ADAPTIVE, colors=256)
    quantized_img.save(buffer, format='PNG', optimize=True, compress_level=9)
    current_size_kb = buffer.tell() / 1024
    if current_size_kb < best_effort_size_kb:
        best_effort_size_kb = current_size_kb
        best_effort_buffer = io.BytesIO(buffer.getvalue())
    if buffer.tell() <= target_bytes:
        with open(final_path, 'wb') as f: f.write(buffer.getvalue())
        return final_path, f"Success ({current_size_kb:.1f} KB)"

    # Attempt 2: Iterative Resizing
    for scale_percent in [90, 75, 60, 50, 40, 30]:
        new_width = int(image_obj.width * scale_percent / 100)
        new_height = int(image_obj.height * scale_percent / 100)
        resized_img = image_obj.resize((new_width, new_height), Image.Resampling.LANCZOS)
        buffer.seek(0); buffer.truncate(0)
        quantized_resized_img = resized_img.convert('P', palette=Image.Palette.ADAPTIVE, colors=256)
        quantized_resized_img.save(buffer, format='PNG', optimize=True, compress_level=9)
        current_size_kb = buffer.tell() / 1024
        if current_size_kb < best_effort_size_kb:
            best_effort_size_kb = current_size_kb
            best_effort_buffer = io.BytesIO(buffer.getvalue())
        if buffer.tell() <= target_bytes:
            with open(final_path, 'wb') as f: f.write(buffer.getvalue())
            return final_path, f"Success with {scale_percent}% Resize ({current_size_kb:.1f} KB)"

    # Save best effort if target not met
    if best_effort_buffer:
        with open(final_path, 'wb') as f: f.write(best_effort_buffer.getvalue())
        return final_path, f"Saved best effort ({best_effort_size_kb:.1f} KB)"
    
    return None, "All compression attempts failed."