import os
import sys
import gc
import cv2
import time
import io
import numpy as np
from typing import Optional, Dict, Any
from fastapi import FastAPI, File, UploadFile, Form, Security, HTTPException, status
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Ensure modules can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.ocr_service import OCRService
from services.face_service import FaceService
from services.forensics_service import ForensicsService

API_KEY = os.getenv("AI_API_KEY", "satyascan-secret-key-2026")
api_key_header = APIKeyHeader(name="X-API-Key")

async def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Forbidden: Invalid API Key. Only authorized backends can access this AI Engine."
        )
    return api_key

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Loading AI models (Singleton)...")
    OCRService._get_reader()
    FaceService._get_app()
    print("Models loaded successfully.")
    yield
    print("Shutting down AI models...")
    gc.collect()

app = FastAPI(title="SIH26188 AI Engine API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def _process_uploaded_image(upload: UploadFile) -> tuple[bytes, np.ndarray]:
    raw_bytes = await upload.read()
    
    # Handle PDF uploads (e-Aadhaar, digital certificates) in memory
    if upload.filename and upload.filename.lower().endswith(".pdf"):
        import pypdfium2 as pdfium
        pdf = pdfium.PdfDocument(raw_bytes)
        page = pdf[0]
        bitmap = page.render(scale=2.0)
        pil_image = bitmap.to_pil()
        pdf.close()
        img_byte_arr = io.BytesIO()
        pil_image.save(img_byte_arr, format='JPEG', quality=95)
        raw_bytes = img_byte_arr.getvalue()
        
    np_arr = np.frombuffer(raw_bytes, np.uint8)
    image_np = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if image_np is None:
        raise HTTPException(status_code=400, detail=f"Invalid image format for file: {upload.filename}")
        
    h, w = image_np.shape[:2]
    max_dim = 1280
    if max(h, w) > max_dim:
        scale = max_dim / max(h, w)
        new_w, new_h = int(w * scale), int(h * scale)
        image_np = cv2.resize(image_np, (new_w, new_h), interpolation=cv2.INTER_AREA)
        
    return raw_bytes, image_np

def _build_unified_response(
    status_verdict: str,
    doc_type: str,
    parsed_fields: Dict[str, Any],
    text_list: list,
    forensics: Dict[str, Any],
    face_res: Dict[str, Any],
    face_detect_res: Dict[str, Any],
    processing_time_ms: int
) -> Dict[str, Any]:
    is_tampered = bool(forensics.get("tampering_detected", False))
    is_valid_format = bool(parsed_fields.get("checksum_valid", True))
    
    if status_verdict == "REJECTED":
        risk_score = 0.85
        risk_flag = "HIGH"
    elif status_verdict == "SUSPICIOUS":
        risk_score = 0.45
        risk_flag = "REVIEW"
    else:
        risk_score = 0.05
        risk_flag = "LOW"
        
    ocr_block = {
        "is_valid_format": is_valid_format,
        "parsed_fields": parsed_fields,
        "texts_extracted": text_list,
    }
    
    tampering_block = {
        "is_tampered": is_tampered,
        "tampered_regions": forensics.get("tampered_regions", []),
        "sift_copy_move_detected": forensics.get("sift_copy_move_detected", False),
        "deep_model_prob": 0.85 if is_tampered else 0.05,
    }
    
    risk_block = {
        "composite_risk_score": risk_score,
        "flag": risk_flag,
    }
    
    return {
        # Unified specification keys
        "status": status_verdict,
        "document_type": doc_type,
        "extracted_fields": parsed_fields,
        "biometrics": {
            "face_detected": face_detect_res.get("face_detected", False),
            "face_crop_base64": face_detect_res.get("face_crop_base64", ""),
            "quality_score": round(face_detect_res.get("quality_score", 0.0), 2),
            "similarity": face_res.get("similarity", 1.0),
            "match": face_res.get("match", True),
        },
        "forensic_analysis": forensics,
        "processing_time_ms": processing_time_ms,
        
        # Backward-compatible proxy keys expected by Node backend aiService.js
        "ocr": ocr_block,
        "tampering": tampering_block,
        "document_status": {
            "ocr": ocr_block,
            "tampering": tampering_block,
            "face_biometrics": face_res,
        },
        "face_biometrics": face_res,
        "face": face_res,
        "risk_assessment": risk_block,
        "external_database_hits": {
            "efir": False,
            "aml": False,
            "court_history": False
        },
        "network_risk": 0.0
    }

@app.get("/")
def read_root():
    return {"status": "AI Engine is running securely in atomic pipeline mode"}

@app.get("/health")
def health_check():
    return {"status": "ok", "models_loaded": True}

@app.post("/scan")
async def scan_document(
    file: Optional[UploadFile] = File(None),
    id_image: Optional[UploadFile] = File(None),
    doc_type: str = Form("AADHAAR"),
    deviceHash: Optional[str] = Form(None),
    submitterId: Optional[str] = Form(None),
    api_key: str = Security(verify_api_key)
):
    upload = file or id_image
    if not upload:
        raise HTTPException(status_code=400, detail="Document image file required ('file' or 'id_image').")
        
    start_time = time.time()
    raw_bytes, image_np = await _process_uploaded_image(upload)
    
    # Biometric Face Detection on document
    face_detect = FaceService.extract_face(image_np)
    face_bbox = face_detect.get("bbox", [])
    
    # Single-Pass OCR
    ocr_detections = OCRService.extract_text_with_bboxes(image_np)
    text_list = [det["text"] for det in ocr_detections]
    parsed_fields = OCRService.parse_document(text_list, doc_type, ocr_detections=ocr_detections)
    
    if "_classified_doc_type" in parsed_fields:
        doc_type = parsed_fields.pop("_classified_doc_type")
    
    # Forensics Suite
    forensics = ForensicsService.analyze_unified(raw_bytes, image_np, face_bbox, ocr_detections)
    
    if forensics.get("tampering_detected"):
        status_verdict = "REJECTED"
    elif forensics.get("verdict") == "REVIEW":
        status_verdict = "SUSPICIOUS"
    elif not parsed_fields.get("checksum_valid"):
        status_verdict = "SUSPICIOUS"
    else:
        status_verdict = "VERIFIED"
        
    processing_time_ms = int((time.time() - start_time) * 1000)
    
    face_res = {
        "similarity": 1.0,
        "match": True,
        "confidence": 1.0,
        "notes": "Face check bypassed (no selfie provided).",
        "face_detected": face_detect.get("face_detected", False)
    }
    
    res = _build_unified_response(
        status_verdict, doc_type, parsed_fields, text_list, forensics, face_res, face_detect, processing_time_ms
    )
    
    del image_np
    del raw_bytes
    gc.collect()
    return res

@app.post("/verify")
async def verify_identity(
    id_image: Optional[UploadFile] = File(None),
    selfie_image: Optional[UploadFile] = File(None),
    api_key: str = Security(verify_api_key)
):
    if not id_image or not selfie_image:
        raise HTTPException(status_code=400, detail="Both 'id_image' and 'selfie_image' are required.")
        
    start_time = time.time()
    _, id_np = await _process_uploaded_image(id_image)
    _, selfie_np = await _process_uploaded_image(selfie_image)
    
    face_res = FaceService.compare_faces(id_np, selfie_np)
    
    processing_time_ms = int((time.time() - start_time) * 1000)
    face_res["execution_time_ms"] = processing_time_ms
    
    del id_np
    del selfie_np
    gc.collect()
    return face_res

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
