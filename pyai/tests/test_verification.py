import os
import sys
import cv2
import numpy as np
from fastapi.testclient import TestClient

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.server import app
from services.checksum_service import ChecksumService
from services.ocr_service import OCRService

def test_parse_pan():
    mock_text = [
        "INCOME TAX DEPARTMENT",
        "GOVT. OF INDIA",
        "ABCDE1234F",
        "John Doe",
        "15/08/1990"
    ]
    res = OCRService.parse_document(mock_text, "PAN")
    assert res["document_number"] == "ABCDE1234F"
    assert res["name"] == "John Doe"
    assert res["dob"] == "15-08-1990"

def test_parse_voter():
    mock_text = [
        "ELECTION COMMISSION",
        "ABC1234567",
        "John Doe",
        "15/08/1990"
    ]
    res = OCRService.parse_document(mock_text, "VOTER_ID")
    assert res["document_number"] == "ABC1234567"
    assert res["name"] == "John Doe"
    assert res["dob"] == "15-08-1990"

def test_scan_endpoint_mock_image(tmpdir):
    # Create a mock image
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    img_path = str(tmpdir.join("test_img.jpg"))
    cv2.imwrite(img_path, img)
    
    # Use TestClient as context manager to trigger lifespan events
    with TestClient(app) as test_client:
        with open(img_path, "rb") as f:
            response = test_client.post(
                "/scan",
                files={"file": ("test_img.jpg", f, "image/jpeg")},
                data={"doc_type": "AADHAAR"},
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
