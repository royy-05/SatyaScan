import cv2
import numpy as np
from typing import Dict, Any

class ForensicsService:
    @staticmethod
    def calculate_ela(image_np, quality=90) -> float:
        """Error Level Analysis to find digitally altered regions."""
        try:
            # Compress image
            encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
            _, encoded = cv2.imencode('.jpg', image_np, encode_param)
            decoded = cv2.imdecode(encoded, 1)
            
            # Find difference
            diff = cv2.absdiff(image_np, decoded)
            
            # Calculate mean difference
            ela_score = np.mean(diff) / 255.0
            return float(ela_score)
        except Exception:
            return 0.0

    @staticmethod
    def calculate_blur(image_np) -> float:
        """Laplacian variance to detect blur."""
        try:
            gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
            variance = cv2.Laplacian(gray, cv2.CV_64F).var()
            return float(variance)
        except Exception:
            return 100.0 # Default safe value

    @staticmethod
    def detect_copy_move(image_np) -> bool:
        """SIFT/ORB matching for Copy-Move forgery detection."""
        try:
            gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
            # ORB is faster and unencumbered compared to SIFT
            orb = cv2.ORB_create(nfeatures=500)
            keypoints, descriptors = orb.detectAndCompute(gray, None)
            
            if descriptors is None or len(descriptors) < 10:
                return False
                
            # Use Brute Force matcher
            bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
            # Match descriptors to themselves to find duplicates
            matches = bf.knnMatch(descriptors, descriptors, k=2)
            
            # Apply ratio test to find good copy-move matches (excluding self-match)
            good_matches = []
            for m, n in matches:
                # m is the best match (self), n is the second best
                if m.distance == 0 and n.distance < 50: # distance threshold for similar patches
                    # Ensure they are physically distant in the image
                    pt1 = keypoints[m.queryIdx].pt
                    pt2 = keypoints[n.trainIdx].pt
                    distance_px = np.sqrt((pt1[0] - pt2[0])**2 + (pt1[1] - pt2[1])**2)
                    if distance_px > 50: # Must be >50 pixels apart to be a clone
                        good_matches.append(n)
            
            # If we find a significant number of strong identical regions, it's copy-move
            return len(good_matches) > 5
        except Exception as e:
            print(f"Copy-Move detection failed: {e}")
            return False

    @staticmethod
    def analyze_image(image_np) -> Dict[str, Any]:
        """Runs the full forensics suite on the image."""
        if image_np is None:
            return {
                "tampering_detected": False,
                "ela_risk_score": 0.0,
                "blur_score": 0.0,
                "verdict": "FAIL"
            }
            
        ela_score = ForensicsService.calculate_ela(image_np)
        blur_score = ForensicsService.calculate_blur(image_np)
        copy_move = ForensicsService.detect_copy_move(image_np)
        
        # High ELA diff implies manipulation. Very low blur variance means too blurry.
        tampering_detected = copy_move or (ela_score > 0.15)
        
        if tampering_detected:
            verdict = "SUSPICIOUS"
        elif blur_score < 30.0:
            verdict = "REVIEW" # Too blurry
        else:
            verdict = "PASS"
            
        return {
            "tampering_detected": tampering_detected,
            "ela_risk_score": round(ela_score, 4),
            "blur_score": round(blur_score, 2),
            "verdict": verdict
        }
