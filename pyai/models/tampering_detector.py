import cv2
import numpy as np
import yaml
import os

try:
    import torch
    import torchvision.transforms as T
    from PIL import Image, ImageChops, ImageEnhance
    import timm
except ImportError:
    torch = None

class TamperingDetector:
    def __init__(self, config_path="config/config.yaml"):
        with open(config_path, "r") as f:
            cfg = yaml.safe_load(f)
            self.ela_quality = cfg["thresholds"]["ela"]["quality"]
            self.ela_std_mult = cfg["thresholds"]["ela"]["std_dev_multiplier"]
            self.model_name = cfg["models"]["tampering"]["model_name"]
            
        self.device = torch.device('cuda' if torch and torch.cuda.is_available() else 'cpu')
        self.model = self._load_model()
        
    def _load_model(self):
        if not torch:
            print("PyTorch not available. Model inference disabled.")
            return None
            
        try:
            model = timm.create_model(self.model_name, pretrained=False, num_classes=2)
            # In a real scenario, we'd load weights here:
            # model.load_state_dict(torch.load("path/to/weights.pth", map_location=self.device))
            model = model.to(self.device)
            model.eval()
            return model
        except Exception as e:
            print(f"Error loading model: {e}")
            return None

    def calculate_ela(self, image_path):
        """
        Error Level Analysis (ELA) to find regions with different compression levels.
        """
        if not Image:
            return 0.0, None

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
            
            return std_dev, is_tampered
            
        finally:
            if os.path.exists(temp_filename):
                os.remove(temp_filename)
        return 0.0, False

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

    def run_deep_model(self, image_path):
        """
        Run the EfficientNet classification.
        """
        if not self.model:
            return 0.5 # Default uncertainty
            
        try:
            im = Image.open(image_path).convert('RGB')
            transform = T.Compose([
                T.Resize((380, 380)),
                T.ToTensor(),
                T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])
            x = transform(im).unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                out = self.model(x)
                probs = torch.nn.functional.softmax(out, dim=1)
                
            # Assume class 1 is tampered
            tamper_prob = probs[0][1].item()
            return tamper_prob
        except Exception as e:
            print(f"Deep model inference error: {e}")
            return 0.5

    def process(self, image_path):
        ela_std, ela_flag = self.calculate_ela(image_path)
        sift_flag = self.check_copy_move_sift(image_path)
        deep_prob = self.run_deep_model(image_path)
        
        # Combine signals
        is_tampered = ela_flag or sift_flag or (deep_prob > 0.7)
        
        return {
            "is_tampered": is_tampered,
            "ela_std": float(ela_std),
            "sift_copy_move_detected": bool(sift_flag),
            "deep_model_prob": float(deep_prob)
        }
