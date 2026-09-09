import cv2
import numpy as np
from typing import Dict, Any, List
import io
try:
    from PIL import Image, ExifTags
except ImportError:
    Image, ExifTags = None, None

class ForensicsService:
    @staticmethod
    def calculate_ela(image_np, quality=95) -> float:
        """Error Level Analysis to find digitally altered regions."""
        try:
            encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
            _, encoded = cv2.imencode('.jpg', image_np, encode_param)
            decoded = cv2.imdecode(encoded, 1)
            diff = cv2.absdiff(image_np, decoded)
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
            return float(max(variance, 0.001)) # non-zero bounds guards
        except Exception:
            return 100.0

    @staticmethod
    def detect_copy_move(image_np) -> bool:
        """SIFT/ORB matching for Copy-Move forgery detection."""
        try:
            gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
            orb = cv2.ORB_create(nfeatures=500)
            keypoints, descriptors = orb.detectAndCompute(gray, None)
            
            if descriptors is None or len(descriptors) < 10:
                return False
                
            bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
            matches = bf.knnMatch(descriptors, descriptors, k=2)
            
            good_matches = []
            for m, n in matches:
                if m.distance == 0 and n.distance < 50:
                    pt1 = keypoints[m.queryIdx].pt
                    pt2 = keypoints[n.trainIdx].pt
                    distance_px = np.sqrt((pt1[0] - pt2[0])**2 + (pt1[1] - pt2[1])**2)
                    if distance_px > 50:
                        good_matches.append(n)
            
            return len(good_matches) > 5
        except Exception:
            return False

    @staticmethod
    def check_exif_tampering(image_bytes: bytes) -> Dict[str, Any]:
        """Check for digital editor signatures in EXIF metadata."""
        result = {"has_exif": False, "software_detected": None, "metadata_tamper_flag": False}
        if not Image:
            return result
        try:
            img = Image.open(io.BytesIO(image_bytes))
            exif = img.getexif()
            if not exif:
                return result
                
            result["has_exif"] = True
            software_tags = [
                ExifTags.Base.Software,
                ExifTags.Base.ProcessingSoftware,
                ExifTags.Base.HostComputer
            ]
            
            known_editors = ['photoshop', 'gimp', 'canva', 'picsart', 'lightroom', 'pixlr', 'snapseed']
            
            for tag_id in software_tags:
                if tag_id in exif:
                    val = str(exif[tag_id]).lower()
                    for editor in known_editors:
                        if editor in val:
                            result["software_detected"] = val
                            result["metadata_tamper_flag"] = True
                            return result
        except Exception as e:
            print(f"EXIF check error: {e}")
            
        return result

    @staticmethod
    def check_photo_edge_splice(img: np.ndarray, bbox: list) -> Dict[str, Any]:
        """Check variance of Laplacian gradients inside vs outside the face collar."""
        result = {"splice_risk_score": 0.0, "photo_tampered": False}
        if not bbox or len(bbox) != 4:
            return result
            
        try:
            h, w = img.shape[:2]
            x1, y1, x2, y2 = bbox
            # Expand by 10px boundary collar
            cx1, cy1 = max(0, x1 - 10), max(0, y1 - 10)
            cx2, cy2 = min(w, x2 + 10), min(h, y2 + 10)
            
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Laplacian variance inside face
            face_crop = gray[y1:y2, x1:x2]
            if face_crop.size == 0: return result
            face_var = cv2.Laplacian(face_crop, cv2.CV_64F).var()
            
            # Collar crop
            collar_crop = gray[cy1:cy2, cx1:cx2]
            # Create a mask for the external background (collar minus face)
            mask = np.ones(collar_crop.shape, dtype=np.uint8)
            # Coordinates relative to collar
            rx1, ry1 = x1 - cx1, y1 - cy1
            rx2, ry2 = rx1 + (x2 - x1), ry1 + (y2 - y1)
            mask[ry1:ry2, rx1:rx2] = 0
            
            # Compute Laplacian of collar crop
            collar_lap = cv2.Laplacian(collar_crop, cv2.CV_64F)
            
            # Variance outside the face
            outside_lap = collar_lap[mask == 1]
            if outside_lap.size == 0: return result
            outside_var = outside_lap.var()
            
            # Compare
            diff = abs(face_var - outside_var)
            ratio = diff / max(face_var, outside_var, 0.001)
            
            result["splice_risk_score"] = float(ratio)
            result["photo_tampered"] = bool(ratio > 0.85) # Threshold
        except Exception as e:
            print(f"Splice check error: {e}")
            
        return result

    @staticmethod
    def check_text_manipulation(img: np.ndarray, ocr_detections: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate vertical baseline variance and bounding box height consistency."""
        result = {"text_anomaly_score": 0.0, "tampering_suspected": False}
        if not ocr_detections or len(ocr_detections) < 3:
            return result
            
        try:
            heights = []
            for det in ocr_detections:
                x1, y1, x2, y2 = det['bbox']
                heights.append(y2 - y1)
                
            h_var = np.var(heights)
            score = min(float(h_var) / 1000.0, 1.0)
            
            result["text_anomaly_score"] = score
            result["tampering_suspected"] = bool(score > 0.3)
        except Exception as e:
            print(f"Text manipulation check error: {e}")
            
        return result

    @staticmethod
    def check_stamp_authenticity(img: np.ndarray) -> Dict[str, Any]:
        """Detect and analyze official stamps/seals for forgery."""
        result = {
            "stamp_detected": False,
            "stamp_count": 0,
            "stamp_authenticity_score": 0.0,
            "stamp_tampered": False,
            "details": "No stamp detected."
        }
        if img is None or img.size == 0:
            return result
            
        try:
            hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
            
            # Blue/Purple ink
            lower_blue = np.array([100, 40, 40])
            upper_blue = np.array([145, 255, 240])
            mask_blue = cv2.inRange(hsv, lower_blue, upper_blue)
            
            # Red ink (wraps around Hue 0 and 180)
            lower_red1 = np.array([0, 50, 50])
            upper_red1 = np.array([10, 255, 255])
            mask_red1 = cv2.inRange(hsv, lower_red1, upper_red1)
            
            lower_red2 = np.array([170, 50, 50])
            upper_red2 = np.array([180, 255, 255])
            mask_red2 = cv2.inRange(hsv, lower_red2, upper_red2)
            
            mask_red = cv2.bitwise_or(mask_red1, mask_red2)
            
            # Combined ink mask
            ink_mask = cv2.bitwise_or(mask_blue, mask_red)
            
            # Morphological closing to bridge gaps
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
            closed_mask = cv2.morphologyEx(ink_mask, cv2.MORPH_CLOSE, kernel)
            
            contours, _ = cv2.findContours(closed_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            valid_stamps = []
            for cnt in contours:
                area = cv2.contourArea(cnt)
                if area < 500: # filter noise
                    continue
                perimeter = cv2.arcLength(cnt, True)
                if perimeter == 0:
                    continue
                circularity = 4 * np.pi * (area / (perimeter * perimeter))
                if circularity > 0.6: # Relaxed circularity for imperfect human stamps
                    valid_stamps.append(cnt)
                    
            if len(valid_stamps) == 0:
                return result
                
            result["stamp_detected"] = True
            result["stamp_count"] = len(valid_stamps)
            
            # Analyze ink authenticity via Laplacian variance
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            laplacian = cv2.Laplacian(gray, cv2.CV_64F)
            
            stamp_scores = []
            for cnt in valid_stamps:
                # Mask just the perimeter of the stamp
                perimeter_mask = np.zeros(gray.shape, dtype=np.uint8)
                cv2.drawContours(perimeter_mask, [cnt], -1, 255, 5) # 5px boundary
                
                perimeter_laplacian = laplacian[perimeter_mask == 255]
                if perimeter_laplacian.size > 0:
                    var = perimeter_laplacian.var()
                    # Real wet ink has variance typically bounded due to natural gradients
                    # Digital stamps are extremely sharp, high variance
                    score = min(var / 5000.0, 1.0) # Normalize
                    stamp_scores.append(score)
            
            if stamp_scores:
                avg_score = float(np.mean(stamp_scores))
                result["stamp_authenticity_score"] = avg_score
                # > 0.8 usually implies artificially sharp boundary (synthetic)
                if avg_score > 0.8:
                    result["stamp_tampered"] = True
                    result["details"] = "Unnaturally sharp edges detected. Potential digital forgery."
                else:
                    result["details"] = "Natural ink micro-variations detected."
                    
        except Exception as e:
            print(f"Stamp analysis error: {e}")
            
        return result

    @staticmethod
    def analyze_unified(image_bytes: bytes, image_np: np.ndarray, face_bbox: list, ocr_detections: list) -> Dict[str, Any]:
        if image_np is None:
            return {
                "verdict": "FAIL",
                "tampering_detected": False,
                "ela_risk_score": 0.0,
                "blur_score": 0.0,
                "photo_splice": {"tampered": False, "score": 0.0},
                "text_manipulation": {"tampered": False, "score": 0.0},
                "metadata": {"software_detected": None, "flagged": False},
                "stamp_analysis": {
                    "stamp_detected": False,
                    "stamp_count": 0,
                    "stamp_authenticity_score": 0.0,
                    "stamp_tampered": False,
                    "details": "No stamp detected."
                }
            }
            
        ela_score = ForensicsService.calculate_ela(image_np)
        blur_score = ForensicsService.calculate_blur(image_np)
        copy_move = ForensicsService.detect_copy_move(image_np)
        
        exif_res = ForensicsService.check_exif_tampering(image_bytes)
        splice_res = ForensicsService.check_photo_edge_splice(image_np, face_bbox)
        text_res = ForensicsService.check_text_manipulation(image_np, ocr_detections)
        stamp_res = ForensicsService.check_stamp_authenticity(image_np)
        
        tampering_detected = (
            copy_move or 
            ela_score > 0.15 or 
            exif_res["metadata_tamper_flag"] or 
            splice_res["photo_tampered"] or 
            text_res["tampering_suspected"] or
            stamp_res["stamp_tampered"]
        )
        
        if tampering_detected:
            verdict = "SUSPICIOUS"
        elif blur_score < 30.0:
            verdict = "REVIEW"
        else:
            verdict = "PASS"
            
        return {
            "verdict": verdict,
            "tampering_detected": tampering_detected,
            "ela_risk_score": round(ela_score, 4),
            "blur_score": round(blur_score, 2),
            "photo_splice": {
                "tampered": splice_res["photo_tampered"],
                "score": round(splice_res["splice_risk_score"], 4)
            },
            "text_manipulation": {
                "tampered": text_res["tampering_suspected"],
                "score": round(text_res["text_anomaly_score"], 4)
            },
            "metadata": {
                "software_detected": exif_res["software_detected"],
                "flagged": exif_res["metadata_tamper_flag"]
            },
            "stamp_analysis": stamp_res
        }
