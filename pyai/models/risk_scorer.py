import yaml

class RiskScorer:
    def __init__(self, config_path="config/config.yaml"):
        with open(config_path, "r") as f:
            cfg = yaml.safe_load(f)
            self.weights = cfg["risk_weights"]
            self.thresholds = cfg["thresholds"]["risk"]

    def calculate_risk(self, ocr_results, tampering_results, face_results, in_watchlist=False, network_risk_score=0.0):
        """
        Calculates a composite risk score from 0-100 based on weighted module outputs.
        Higher score means higher risk of forgery/impersonation.
        """
        score = 0.0
        
        # 1. OCR / MRZ Checksum (40%)
        # If valid, 0 risk. If invalid, full weight risk.
        if not ocr_results.get("is_valid_format", False):
            score += self.weights["mrz_checksum"] * 100
            
        # 2. Tampering / ELA (25%)
        # If tampered, full weight risk.
        if tampering_results.get("is_tampered", False):
            score += self.weights["ela_tampering"] * 100
            
        # 3. Face Biometrics (25%)
        # If not matched or spoofed, full weight risk.
        if not face_results.get("match", False) or face_results.get("spoof_detected", False):
            score += self.weights["face_match"] * 100
            
        # 4. Watchlist (10%)
        if in_watchlist:
            score += self.weights["watchlist"] * 100
            
        # 5. Network Risk Score (0-100 scale, but usually we add it)
        # Assuming network_risk_score is passed in as points.
        score += network_risk_score
            
        score = min(max(score, 0.0), 100.0)
        
        # Determine category
        if score <= self.thresholds["low_upper_bound"]:
            flag = "LOW"
        elif score <= self.thresholds["review_upper_bound"]:
            flag = "REVIEW"
        else:
            flag = "HIGH"
            
        return {
            "composite_risk_score": float(score),
            "flag": flag,
            "breakdown": {
                "ocr_risk": (0 if ocr_results.get("is_valid_format") else self.weights["mrz_checksum"]*100),
                "tampering_risk": (self.weights["ela_tampering"]*100 if tampering_results.get("is_tampered") else 0),
                "face_risk": (self.weights["face_match"]*100 if not face_results.get("match") or face_results.get("spoof_detected") else 0),
                "watchlist_risk": (self.weights["watchlist"]*100 if in_watchlist else 0)
            }
        }
