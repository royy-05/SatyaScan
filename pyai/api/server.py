from fastapi import FastAPI, File, UploadFile, Form, Security, HTTPException, status
from pydantic import BaseModel
import shutil
import os
import sys
from fastapi.security import APIKeyHeader
from dotenv import load_dotenv

load_dotenv()
# Ensure modules can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.ocr_engine import OCREngine
from models.tampering_detector import TamperingDetector
from models.face_biometrics import FaceBiometrics
from models.risk_scorer import RiskScorer

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SIH26188 AI Engine API")

# Security
API_KEY = os.getenv("AI_API_KEY", "satyascan-secret-key-2026")
api_key_header = APIKeyHeader(name="X-API-Key")

async def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Forbidden: Invalid API Key. Only authorized backends can access this AI Engine."
        )
    return api_key

# Allow all origins for development so frontends can connect without CORS errors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Initialize models
print("Initializing models...")
ocr_engine = OCREngine()
tamper_engine = TamperingDetector()
face_engine = FaceBiometrics()
risk_engine = RiskScorer()
print("Models loaded.")

os.makedirs("temp", exist_ok=True)

class RiskResponse(BaseModel):
    composite_risk_score: float
    flag: str
    breakdown: dict

@app.get("/")
def read_root():
    return {"status": "AI Engine is running securely"}

@app.post("/scan")
async def scan_document(
    id_image: UploadFile = File(...),
    doc_type: str = Form("AADHAAR"), # AADHAAR, PAN, PASSPORT
    api_key: str = Security(verify_api_key)
):
    temp_path = f"temp/{id_image.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(id_image.file, buffer)
        
    # Handle PDF uploads (like e-Aadhaar)
    if temp_path.lower().endswith(".pdf"):
        import pypdfium2 as pdfium
        pdf = pdfium.PdfDocument(temp_path)
        page = pdf[0]
        # render scale 2.0 to ensure good OCR resolution
        bitmap = page.render(scale=2.0)
        pil_image = bitmap.to_pil()
        temp_path_img = temp_path + ".jpg"
        pil_image.save(temp_path_img, "JPEG")
        
        # cleanup pdf and update temp_path
        try:
            pdf.close()
        except:
            pass
            
        try:
            os.remove(temp_path)
        except:
            pass
            
        temp_path = temp_path_img
        
    ocr_res = ocr_engine.process(temp_path, doc_type)
    tamp_res = tamper_engine.process(temp_path)
    
    # Try to clean up
    try:
        os.remove(temp_path)
    except:
        pass
        
    return {
        "ocr": ocr_res,
        "tampering": tamp_res
    }

@app.post("/verify", response_model=RiskResponse)
async def verify_identity(
    id_image: UploadFile = File(...),
    selfie_image: UploadFile = File(...),
    doc_type: str = Form("AADHAAR"),
    api_key: str = Security(verify_api_key)
):
    id_path = f"temp/{id_image.filename}"
    live_path = f"temp/{selfie_image.filename}"
    
    with open(id_path, "wb") as buffer:
        shutil.copyfileobj(id_image.file, buffer)
    with open(live_path, "wb") as buffer:
        shutil.copyfileobj(live_image.file, buffer)
        
    # Handle PDF uploads for the ID image (like e-Aadhaar)
    if id_path.lower().endswith(".pdf"):
        import pypdfium2 as pdfium
        pdf = pdfium.PdfDocument(id_path)
        page = pdf[0]
        bitmap = page.render(scale=2.0)
        pil_image = bitmap.to_pil()
        id_path_img = id_path + ".jpg"
        pil_image.save(id_path_img, "JPEG")
        
        try:
            pdf.close()
        except:
            pass
            
        try:
            os.remove(id_path)
        except:
            pass
            
        id_path = id_path_img
        
    ocr_res = ocr_engine.process(id_path, doc_type)
    tamp_res = tamper_engine.process(id_path)
    face_res = face_engine.process(id_path, live_path)
    
    # Mock watchlist check
    in_watchlist = False
    
    risk_res = risk_engine.calculate_risk(ocr_res, tamp_res, face_res, in_watchlist)
    
    try:
        os.remove(id_path)
        os.remove(live_path)
    except:
        pass
        
    return {
        "document_status": {
            "ocr": ocr_res,
            "tampering": tamp_res,
            "face_biometrics": face_res
        },
        "risk_assessment": risk_res
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
