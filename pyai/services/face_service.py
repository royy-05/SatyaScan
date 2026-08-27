import cv2
import base64
import numpy as np
from typing import Dict, Any, Tuple

class FaceService:
    _app = None

    @classmethod
    def _get_app(cls):
        if cls._app is None:
            try:
                import insightface
                from insightface.app import FaceAnalysis
                # Use CPU context (ctx_id=-1) and buffalo_s model for lightweight extraction
                cls._app = FaceAnalysis(name='buffalo_s', providers=['CPUExecutionProvider'])
                cls._app.prepare(ctx_id=-1, det_size=(640, 640))
            except Exception as e:
                print(f"Failed to load insightface: {e}")
                cls._app = "FAILED"
        return cls._app

    @staticmethod
    def _numpy_to_base64(img_np) -> str:
        if img_np is None:
            return ""
        try:
            _, buffer = cv2.imencode('.jpg', img_np)
            b64_str = base64.b64encode(buffer).decode('utf-8')
            return f"data:image/jpeg;base64,{b64_str}"
        except Exception:
            return ""

    @staticmethod
    def extract_face(image_np) -> Dict[str, Any]:
        """
        Detects face and extracts a biometric crop.
        Falls back to cv2.CascadeClassifier if insightface fails.
        """
        result = {
            "face_detected": False,
            "face_crop_base64": "",
            "quality_score": 0.0
        }
        
        if image_np is None:
            return result
            
        app = FaceService._get_app()
        
        try:
            if app != "FAILED":
                # Try insightface
                faces = app.get(image_np)
                if faces and len(faces) > 0:
                    # Pick largest face
                    face = max(faces, key=lambda f: (f.bbox[2]-f.bbox[0])*(f.bbox[3]-f.bbox[1]))
                    bbox = face.bbox.astype(int)
                    x1, y1, x2, y2 = max(0, bbox[0]), max(0, bbox[1]), min(image_np.shape[1], bbox[2]), min(image_np.shape[0], bbox[3])
                    
                    crop = image_np[y1:y2, x1:x2]
                    result["face_detected"] = True
                    result["face_crop_base64"] = FaceService._numpy_to_base64(crop)
                    result["quality_score"] = float(face.det_score) if hasattr(face, 'det_score') else 0.90
                    return result
        except Exception as e:
            print(f"Insightface extraction failed: {e}. Falling back to Haar Cascade.")
            
        # Fallback to Haar Cascade
        try:
            gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
            
            if len(faces) > 0:
                # Pick largest face
                x, y, w, h = max(faces, key=lambda f: f[2]*f[3])
                crop = image_np[y:y+h, x:x+w]
                
                result["face_detected"] = True
                result["face_crop_base64"] = FaceService._numpy_to_base64(crop)
                result["quality_score"] = 0.50 # Lower confidence for Haar
        except Exception as e:
            print(f"Haar Cascade fallback failed: {e}")
            
        return result
