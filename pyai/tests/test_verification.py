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

def test_parse_permit_ilp():
    mock_text = [
        "Government of Arunachal Pradesh",
        "Inner Line Permit",
        "No. 12345/AP",
        "Valid From: 01-01-2026",
        "Valid To: 15-01-2026",
        "Destinations: Tawang",
        "Issued by: District Magistrate"
    ]
    res = OCRService.parse_document(mock_text, "PERMIT")
    assert res["permit_type"] == "ILP"
    assert res["document_number"] == "12345/AP"
    assert res["valid_from"] == "01-01-2026"
    assert res["valid_to"] == "15-01-2026"
    assert "Tawang" in res["permitted_places"]
    assert res["issuing_authority"] == "District Magistrate"

def test_parse_permit_pap():
    mock_text = [
        "Protected Area Permit",
        "Ref: PAP-9988",
        "Ministry of Home Affairs",
        "Valid 10/10/2026 to 20/10/2026",
        "To visit Bomdila"
    ]
    res = OCRService.parse_document(mock_text, "PERMIT")
    assert res["permit_type"] == "PAP"
    assert res["document_number"] == "PAP-9988"
    assert res["valid_from"] == "10-10-2026"
    assert res["valid_to"] == "20-10-2026"
    assert "Bomdila" in res["permitted_places"]

def test_parse_permit_rap():
    mock_text = [
        "Restricted Area Permit",
        "Permit No: RAP-777",
        "15/11/2026",
        "25/11/2026"
    ]
    res = OCRService.parse_document(mock_text, "PERMIT")
    assert res["permit_type"] == "RAP"
    assert res["document_number"] == "RAP-777"
    assert res["valid_from"] == "15-11-2026"
    assert res["valid_to"] == "25-11-2026"

def test_parse_permit_border_area():
    mock_text = [
        "Border Area Entry Pass",
        "No. BORDER-001",
        "Leh/Ladakh Region",
        "Officer: SDM Pass"
    ]
    res = OCRService.parse_document(mock_text, "PERMIT")
    assert res["permit_type"] == "BORDER_AREA"
    assert res["document_number"] == "BORDER-001"
    assert "Leh" in res["permitted_places"]

def test_parse_permit_lakshadweep():
    mock_text = [
        "Lakshadweep Administration",
        "e-Permit",
        "Permit No: LKD-2233",
        "Agatti Island"
    ]
    res = OCRService.parse_document(mock_text, "PERMIT")
    assert res["permit_type"] == "LAKSHADWEEP"
    assert res["document_number"] == "LKD-2233"
    assert "Agatti" in res["permitted_places"]

def test_parse_permit_spatial_nagaland():
    mock_dets = [
        {"bbox": [212, 78, 314, 106], "text": "SL. No.-", "confidence": 0.99},
        {"bbox": [333, 81, 479, 117], "text": "0109438", "confidence": 0.90},
        {"bbox": [582, 78, 900, 102], "text": "GOVERNMENT OF NAGALAND", "confidence": 0.95},
        {"bbox": [522, 102, 960, 126], "text": "OFFICE OF THE DEPUTY COMMISSIONER", "confidence": 0.95},
        {"bbox": [484, 125, 995, 145], "text": "PERMIT GRANTED UNDER SECTION 2-4 OF THE BENGAL EASTERN", "confidence": 0.90},
        {"bbox": [627, 147, 857, 163], "text": "FRONTIER REGULATION 1873", "confidence": 0.90},
        {"bbox": [229, 287, 275, 303], "text": "Name", "confidence": 0.98},
        {"bbox": [454, 278, 746, 304], "text": "niRanjAN Rata Gopal", "confidence": 0.85},
        {"bbox": [227, 315, 257, 331], "text": "Age", "confidence": 0.98},
        {"bbox": [548, 310, 628, 338], "text": "36 yrs M", "confidence": 0.90},
        {"bbox": [224, 338, 423, 360], "text": "Father's Name", "confidence": 0.95},
        {"bbox": [430, 340, 750, 369], "text": "Rajagopal Valiya Veetil", "confidence": 0.85},
        {"bbox": [239, 447, 341, 467], "text": "Village/Town", "confidence": 0.95},
        {"bbox": [354, 442, 428, 472], "text": "C-55", "confidence": 0.90},
        {"bbox": [438, 434, 755, 473], "text": "Vanamali Indira Nagar", "confidence": 0.88},
        {"bbox": [217, 471, 291, 491], "text": "PO/PS", "confidence": 0.95},
        {"bbox": [360, 466, 576, 503], "text": "Kadavanthara", "confidence": 0.90},
        {"bbox": [233, 503, 293, 519], "text": "District", "confidence": 0.95},
        {"bbox": [363, 496, 548, 529], "text": "Ernakulam", "confidence": 0.90},
        {"bbox": [233, 531, 275, 547], "text": "State", "confidence": 0.95},
        {"bbox": [372, 526, 488, 554], "text": "Kerala", "confidence": 0.90},
        {"bbox": [229, 557, 301, 575], "text": "Pin Code", "confidence": 0.95},
        {"bbox": [378, 549, 504, 578], "text": "682020", "confidence": 0.90},
        {"bbox": [771, 447, 837, 463], "text": "a. Name", "confidence": 0.90},
    ]
    text_list = [d["text"] for d in mock_dets]
    res = OCRService.parse_document(text_list, "PERMIT", ocr_detections=mock_dets)
    
    assert res["name"] == "Niranjan Rajagopal"
    assert res["age"] == 36
    assert res["gender"] == "M"
    assert res["document_number"] == "0109438"
    assert "Deputy Commissioner" in res["issuing_authority"]
    assert "Vanamali Indira Nagar" in res["address"]
    assert "682020" in res["address"]
    assert "FRONTIER" not in (res["name"] or "")

def test_frontier_regulation_not_name():
    mock_text = [
        "OFFICE OF THE DEPUTY COMMISSIONER",
        "BENGAL EASTERN FRONTIER REGULATION 1873",
        "PERMIT NO 12345",
        "1. Name",
        "VIKRAM SINGH",
        "Age 40"
    ]
    res = OCRService.parse_document(mock_text, "PERMIT")
    assert res["name"] == "Vikram Singh"
    assert "FRONTIER" not in res["name"]

def test_stamp_detection_forgery(tmpdir):
    from services.forensics_service import ForensicsService
    
    # Create a synthetic image (white background)
    img = np.ones((400, 400, 3), dtype=np.uint8) * 255
    
    # Draw a synthetic circular stamp in blue
    # BGR format: Blue is (255, 0, 0), but we want a valid blue ink range HSV: [100-145, 40-255, 40-240]
    # Pure OpenCV Blue (255,0,0) is Hue 120, Sat 255, Val 255 (which is out of Val range 240)
    # Let's use BGR(200, 50, 50) which is slightly dark blue -> Hue 120, Sat 191, Val 200
    cv2.circle(img, (200, 200), 100, (200, 50, 50), 5)
    
    # Perform stamp authenticity check
    res = ForensicsService.check_stamp_authenticity(img)
    
    assert res["stamp_detected"] == True
    assert res["stamp_count"] == 1
    # Because it is a perfect synthetic shape with no blurring, variance is high
    assert res["stamp_tampered"] == True
    assert res["stamp_authenticity_score"] > 0.8

def test_verify_endpoint_mock_image(tmpdir):
    # Create two mock blank images
    img1 = np.zeros((100, 100, 3), dtype=np.uint8)
    img2 = np.zeros((100, 100, 3), dtype=np.uint8)
    
    img1_path = str(tmpdir.join("id_img.jpg"))
    img2_path = str(tmpdir.join("selfie_img.jpg"))
    
    cv2.imwrite(img1_path, img1)
    cv2.imwrite(img2_path, img2)
    
    with TestClient(app) as test_client:
        with open(img1_path, "rb") as f1, open(img2_path, "rb") as f2:
            response = test_client.post(
                "/verify",
                files={
                    "id_image": ("id_img.jpg", f1, "image/jpeg"),
                    "selfie_image": ("selfie_img.jpg", f2, "image/jpeg")
                },
                headers={"X-API-Key": "satyascan-secret-key-2026"}
            )
            
        assert response.status_code == 200
        json_resp = response.json()
        
        # Assert the response includes only biometric flags
        assert "face_match" in json_resp
        assert "similarity_score" in json_resp
        assert "confidence" in json_resp
        assert "id_face_detected" in json_resp
        assert "selfie_face_detected" in json_resp
        assert "execution_time_ms" in json_resp
        
        # Assert no OCR/Forensic keys
        assert "extracted_fields" not in json_resp
        assert "forensic_analysis" not in json_resp
        assert "status" not in json_resp
        
        # Assert execution is extremely fast (blank images)
        assert json_resp["execution_time_ms"] < 2000
        
        # Since images are blank, no faces should be detected
        assert json_resp["id_face_detected"] is False
        assert json_resp["selfie_face_detected"] is False
