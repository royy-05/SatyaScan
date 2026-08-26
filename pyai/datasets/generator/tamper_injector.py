import os
import cv2
import numpy as np
import random
import glob
import argparse
import yaml

with open("config/config.yaml", "r") as f:
    config = yaml.safe_load(f)

BASE_DIR = config.get("paths", {}).get("synthetic_data_output", "./datasets/sample_data/")
CLEAN_DIR = os.path.join(BASE_DIR, "clean")
TAMPERED_DIR = os.path.join(BASE_DIR, "tampered")
MASKS_DIR = os.path.join(BASE_DIR, "masks")

os.makedirs(TAMPERED_DIR, exist_ok=True)
os.makedirs(MASKS_DIR, exist_ok=True)

def copy_move_forgery(image):
    """
    Simulates a copy-move forgery (e.g., duplicating a stamp or text).
    """
    h, w, c = image.shape
    mask = np.zeros((h, w), dtype=np.uint8)
    
    # Select a random patch
    patch_w, patch_h = random.randint(50, 100), random.randint(50, 100)
    src_x, src_y = random.randint(0, w - patch_w), random.randint(0, h - patch_h)
    
    patch = image[src_y:src_y+patch_h, src_x:src_x+patch_w].copy()
    
    # Paste it somewhere else
    dst_x, dst_y = random.randint(0, w - patch_w), random.randint(0, h - patch_h)
    
    tampered_img = image.copy()
    tampered_img[dst_y:dst_y+patch_h, dst_x:dst_x+patch_w] = patch
    
    # Update mask
    mask[dst_y:dst_y+patch_h, dst_x:dst_x+patch_w] = 255
    
    return tampered_img, mask

def splicing_forgery(image):
    """
    Simulates splicing (e.g. replacing the photo).
    """
    h, w, c = image.shape
    mask = np.zeros((h, w), dtype=np.uint8)
    
    # Define face box roughly where the photo is drawn in synthetic_ids.py
    box_x, box_y, box_w, box_h = 50, 100, 200, 250
    
    # Generate random noise or another color to simulate a different photo
    fake_photo = np.random.randint(0, 255, (box_h, box_w, 3), dtype=np.uint8)
    
    tampered_img = image.copy()
    tampered_img[box_y:box_y+box_h, box_x:box_x+box_w] = fake_photo
    
    mask[box_y:box_y+box_h, box_x:box_x+box_w] = 255
    
    return tampered_img, mask

def inject_tampering(img_path):
    img = cv2.imread(img_path)
    if img is None:
        return
    
    filename = os.path.basename(img_path)
    
    # Randomly choose forgery type
    if random.choice([True, False]):
        tamp_img, mask = copy_move_forgery(img)
    else:
        tamp_img, mask = splicing_forgery(img)
    
    cv2.imwrite(os.path.join(TAMPERED_DIR, filename), tamp_img)
    cv2.imwrite(os.path.join(MASKS_DIR, filename), mask)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Inject Tampering into Clean IDs")
    args = parser.parse_args()

    clean_images = glob.glob(os.path.join(CLEAN_DIR, "*.jpg"))
    print(f"Found {len(clean_images)} clean images. Injecting tampering...")
    
    for i, img_path in enumerate(clean_images):
        inject_tampering(img_path)
        if (i+1) % 10 == 0:
            print(f"Processed {i+1} / {len(clean_images)}")
    
    print("Tampering injection complete.")
