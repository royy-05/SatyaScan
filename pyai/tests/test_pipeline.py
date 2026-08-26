import pytest
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.ocr_engine import OCREngine
from models.tampering_detector import TamperingDetector
from models.face_biometrics import FaceBiometrics
from models.risk_scorer import RiskScorer

@pytest.fixture
def ocr_engine():
    return OCREngine()

@pytest.fixture
def tamper_detector():
    return TamperingDetector()

@pytest.fixture
def face_biometrics():
    return FaceBiometrics()

@pytest.fixture
def risk_scorer():
    return RiskScorer()

def test_ocr_mrz_validation(ocr_engine):
    valid_mrz = ["P<INDMOCK<NAME<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<", "Z1234567<0IND9001010M3001016<<<<<<<<<<<<<<<0"]
    invalid_mrz = ["JUST SOME RANDOM TEXT", "123456789"]
    
    assert ocr_engine.validate_mrz(valid_mrz) == True
    assert ocr_engine.validate_mrz(invalid_mrz) == False

def test_ocr_aadhaar_validation(ocr_engine):
    valid_aadhaar = ["1234 5678 9012"]
    invalid_aadhaar = ["123456"]
    
    assert ocr_engine.validate_aadhaar(valid_aadhaar) == True
    assert ocr_engine.validate_aadhaar(invalid_aadhaar) == False

def test_risk_scorer(risk_scorer):
    # Test perfect document
    ocr_res = {"is_valid_format": True}
    tamp_res = {"is_tampered": False}
    face_res = {"match": True, "spoof_detected": False}
    
    risk = risk_scorer.calculate_risk(ocr_res, tamp_res, face_res, in_watchlist=False)
    assert risk["composite_risk_score"] == 0.0
    assert risk["flag"] == "LOW"
    
    # Test heavily tampered document
    ocr_res = {"is_valid_format": False} # +40
    tamp_res = {"is_tampered": True} # +25
    face_res = {"match": False, "spoof_detected": True} # +25
    
    risk = risk_scorer.calculate_risk(ocr_res, tamp_res, face_res, in_watchlist=True) # +10
    assert risk["composite_risk_score"] == 100.0
    assert risk["flag"] == "HIGH"

def test_face_similarity_thresholds(face_biometrics):
    # Mock embeddings
    import numpy as np
    emb1 = np.ones(512)
    emb2 = np.ones(512)
    emb3 = -np.ones(512)
    
    assert face_biometrics.cosine_similarity(emb1, emb2) > 0.99
    assert face_biometrics.cosine_similarity(emb1, emb3) < 0.0
