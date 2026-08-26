import cv2
import numpy as np
import yaml
import os

try:
    from PIL import Image, ImageChops, ImageEnhance
except ImportError:
    Image = None

class TamperingDetector:
    def __init__(self, config_path="config/config.yaml"):
        with open(config_path, "r") as f:
            cfg = yaml.safe_load(f)
            self.ela_quality = cfg["thresholds"]["ela"]["quality"]
            self.ela_std_mult = cfg["thresholds"]["ela"]["std_dev_multiplier"]

    def calculate_ela(self, image_path):
        """
        Error Level Analysis (ELA) to find regions with different compression levels.
        """
        if not Image:
            return 0.0, False, []

        temp_filename = 'temp_ela.jpg'
        
        try:
            im = Image.open(image_path).convert('RGB')
            im.save(temp_filename, 'JPEG', quality=self.ela_quality)
            
            im_saved = Image.open(temp_filename)
            ela_im = ImageChops.difference(im, im_saved)
            
            extrema = ela_im.getextrema()
            max_diff = max([ex[1] for ex in extrema])
            
            if max_diff == 0:
                max_diff = 1
                
            scale = 255.0 / max_diff
            ela_im = ImageEnhance.Brightness(ela_im).enhance(scale)
            
            # Calculate standard deviation as an anomaly score
            ela_array = np.array(ela_im)
            std_dev = np.std(ela_array)
            
            is_tampered = std_dev > (10 * self.ela_std_mult) # arbitrary threshold for demo
            
            tampered_regions = []
            if is_tampered:
                # Convert ELA image to grayscale via OpenCV
                gray = cv2.cvtColor(ela_array, cv2.COLOR_RGB2GRAY)
                # Apply Otsu thresholding
                _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
                
                # Find contours
                contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                
                # Filter small contours to extract bounding boxes
                min_area = 100
                for cnt in contours:
                    if cv2.contourArea(cnt) > min_area:
                        x, y, w, h = cv2.boundingRect(cnt)
                        tampered_regions.append({"x": int(x), "y": int(y), "w": int(w), "h": int(h)})
            
            return std_dev, is_tampered, tampered_regions
            
        finally:
            if os.path.exists(temp_filename):
                os.remove(temp_filename)
        return 0.0, False, []

    def check_copy_move_sift(self, image_path):
        """
        Use SIFT keypoints to detect copy-move forgery.
        """
        img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            return False
            
        sift = cv2.SIFT_create()
        keypoints, descriptors = sift.detectAndCompute(img, None)
        
        if descriptors is None or len(descriptors) < 10:
            return False
            
        # Match features against themselves
        bf = cv2.BFMatcher(cv2.NORM_L2, crossCheck=False)
        matches = bf.knnMatch(descriptors, descriptors, k=2)
        
        good_matches = []
        for m, n in matches:
            if m.distance < 0.75 * n.distance:
                # ignore self matches (distance == 0)
                if m.distance > 0:
                    good_matches.append(m)
                    
        # If there are many similar but non-identical patches, likely copy-move
        return len(good_matches) > 15 

    def process(self, image_path):
        ela_std, ela_flag, tampered_regions = self.calculate_ela(image_path)
        sift_flag = self.check_copy_move_sift(image_path)
        
        # Combine signals using reliable techniques
        is_tampered = ela_flag or sift_flag
        
        return {
            "is_tampered": is_tampered,
            "ela_std": float(ela_std),
            "sift_copy_move_detected": bool(sift_flag),
            "deep_model_prob": 0.0, # Deprecated untrained mock model
            "tampered_regions": tampered_regions
        }
