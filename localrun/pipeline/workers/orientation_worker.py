import os
import cv2
import pytesseract
import re

def correct_orientation_in_place(image_path):
    """
    Analyzes an image, iteratively corrects its text orientation until it is upright,
    and then overwrites the original file. This is more robust for tricky rotations.

    Args:
        image_path (str): The path to the image file to be corrected.

    Returns:
        bool: True if the process was successful (or no correction was needed),
              False if a critical error occurred.
    """
    filename = os.path.basename(image_path)
    print(f"[ORIENTATION WORKER] Starting iterative orientation check for: {filename}")

    # A safeguard to prevent potential infinite loops with very ambiguous images.
    # 4 rotations (4 * 90 = 360 degrees) is the max needed.
    MAX_ATTEMPTS = 4

    try:
        # Load the image using OpenCV. We do this once at the start.
        img = cv2.imread(image_path)
        if img is None:
            print(f"[ORIENTATION WORKER] ERROR: Could not read image at path: {image_path}")
            return False

        for attempt in range(MAX_ATTEMPTS):
            # Run OSD on the current state of the image in memory
            try:
                osd = pytesseract.image_to_osd(img)
            except pytesseract.TesseractError as e:
                print(f"[ORIENTATION WORKER] Tesseract failed on attempt {attempt + 1}: {e}. Assuming upright.")
                osd = "Rotate: 0" # Assume it's okay if Tesseract fails mid-process

            angle_match = re.search(r'Rotate: (\d+)', osd)
            
            if not angle_match:
                print(f"[ORIENTATION WORKER] WARN: Could not determine angle on attempt {attempt + 1}. Aborting correction.")
                # We break here and save the image in its current state, as we can't improve it.
                break

            angle = int(angle_match.group(1))

            print(f"--- Attempt {attempt + 1}/{MAX_ATTEMPTS}: Detected rotation of {angle} degrees.")

            # If the angle is 0, the image is upright. We're done.
            if angle == 0:
                print(f"[ORIENTATION WORKER] Image is now upright. Correction complete.")
                break
            
            # If not upright, apply the necessary rotation to the image in memory
            print(f"--- Correcting by {angle} degrees...")
            if angle == 90:
                img = cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE)
            elif angle == 180:
                img = cv2.rotate(img, cv2.ROTATE_180)
            elif angle == 270:
                img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)

        # After the loop (either by breaking or finishing), overwrite the original file
        # with the final state of the 'img' object.
        success = cv2.imwrite(image_path, img)

        if success:
            print(f"[ORIENTATION WORKER] Successfully overwrote {filename} with final corrected version.")
            return True
        else:
            print(f"[ORIENTATION WORKER] ERROR: Failed to save final corrected image to {image_path}")
            return False

    except pytesseract.TesseractNotFoundError:
        print("[ORIENTATION WORKER] ERROR: Tesseract is not installed or not in your PATH. Skipping correction.")
        return False # This is a system-level error
    except Exception as e:
        print(f"[ORIENTATION WORKER] An unexpected error occurred: {e}")
        return False