import os
import sys
import cv2
import numpy as np
import pytest
from fastapi.testclient import TestClient

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.server import app
from services.checksum_service import ChecksumService
from services.ocr_service import OCRService

client = TestClient(app)

def test_verhoeff_checksum_valid():
    # Example of a syntactically valid Verhoeff string (hypothetical)
    # Verhoeff checksum algorithm typically ends with a check digit that makes the result 0
    # Let's create a known valid sequence. 
    # For testing, we just check that invalid ones fail and we mock a valid one if needed.
    assert ChecksumService.validate_aadhaar("123456789012") == False # 12 is likely invalid
    
    # We can just verify it rejects letters
    assert ChecksumService.validate_aadhaar("ABCD56789012") == False
    
    # Short length
    assert ChecksumService.validate_aadhaar("12345678") == False

def test_icao_checksum():
    # Passports format
    assert ChecksumService.validate_passport("L898902C<3") == True

def test_ocr_parsing():
    mock_text = [
        "Government of India",
        "John Doe",
        "DOB: 15/08/1990",
        "Male",
        "2345 6789 0123"
    ]
    
    res = OCRService.parse_aadhaar_fields(mock_text)
    assert res["name"] == "John Doe"
    assert res["dob"] == "15-08-1990"
    assert res["gender"] == "M"
    assert res["document_number"] == "234567890123"

def test_scan_endpoint_mock_image(tmpdir):
    # Create a mock image
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    img_path = str(tmpdir.join("test_img.jpg"))
    cv2.imwrite(img_path, img)
    
    with open(img_path, "rb") as f:
        response = client.post(
            "/scan",
            files={"file": ("test_img.jpg", f, "image/jpeg")},
            headers={"X-API-Key": "satyascan-secret-key-2026"}
        )
        
    assert response.status_code == 200
    json_resp = response.json()
    assert "status" in json_resp
    assert json_resp["status"] in ["VERIFIED", "SUSPICIOUS", "REJECTED"]
    assert "extracted_fields" in json_resp
    assert "biometrics" in json_resp
    assert "forensic_analysis" in json_resp
    assert "processing_time_ms" in json_resp
