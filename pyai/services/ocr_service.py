import re
import datetime
from typing import Dict, Any, List

class OCRService:
    _reader = None

    @classmethod
    def _get_reader(cls):
        if cls._reader is None:
            # Lazy load EasyOCR
            import easyocr
            cls._reader = easyocr.Reader(['en', 'hi'], gpu=False)
        return cls._reader

    @staticmethod
    def extract_text(image_np) -> List[str]:
        """Extracts text lines from an image using EasyOCR."""
        try:
            reader = OCRService._get_reader()
            results = reader.readtext(image_np)
            # returns list of (bbox, text, prob)
            return [res[1] for res in results]
        except Exception as e:
            print(f"OCR Exception: {e}")
            return []

    @staticmethod
    def parse_aadhaar_fields(text_list: List[str]) -> Dict[str, Any]:
        """
        Extracts Name, DOB, Age, Gender, and Aadhaar Number from raw OCR text.
        Returns a dictionary with extracted fields.
        """
        extracted = {
            "name": None,
            "dob": None,
            "age": None,
            "gender": None,
            "document_number": None,
            "checksum_valid": False
        }

        # Import ChecksumService inside to avoid circular deps if they arise
        from services.checksum_service import ChecksumService

        dob_pattern = re.compile(r'\b\d{2}[/-]\d{2}[/-]\d{4}\b')
        gender_pattern = re.compile(r'\b(Male|Female|Transgender|M|F)\b', re.IGNORECASE)
        # Aadhaar: 12 digits, space separated optionally, not starting with 0 or 1
        aadhaar_pattern = re.compile(r'\b[2-9]{1}\d{3}\s?\d{4}\s?\d{4}\b')
        
        dob_idx = -1
        uid_idx = -1
        
        for i, text in enumerate(text_list):
            text_clean = text.strip()
            
            # Extract DOB
            if not extracted["dob"]:
                dob_match = dob_pattern.search(text_clean)
                if dob_match:
                    dob_str = dob_match.group(0)
                    extracted["dob"] = dob_str.replace('/', '-')
                    dob_idx = i
                    # Compute age dynamically
                    try:
                        dob_date = datetime.datetime.strptime(extracted["dob"], "%d-%m-%Y")
                        today = datetime.datetime.today()
                        age = today.year - dob_date.year - ((today.month, today.day) < (dob_date.month, dob_date.day))
                        extracted["age"] = age
                    except Exception:
                        pass
            
            # Extract Gender
            if not extracted["gender"]:
                gender_match = gender_pattern.search(text_clean)
                if gender_match:
                    g = gender_match.group(1).lower()
                    if g in ['m', 'male']:
                        extracted["gender"] = 'M'
                    elif g in ['f', 'female']:
                        extracted["gender"] = 'F'
                    else:
                        extracted["gender"] = 'T'
                        
            # Extract Aadhaar Number
            if not extracted["document_number"]:
                uid_match = aadhaar_pattern.search(text_clean)
                if uid_match:
                    extracted["document_number"] = uid_match.group(0).replace(" ", "")
                    uid_idx = i
                    extracted["checksum_valid"] = ChecksumService.validate_aadhaar(extracted["document_number"])

        # Name extraction heuristic: Look at lines before DOB
        # Aadhaar typical format:
        # Hindi Name
        # English Name
        # DOB: ...
        # Gender
        # Aadhaar number
        if dob_idx > 0:
            # We assume the line immediately preceding DOB that is purely alphabetical could be the english name
            # Or up to 2 lines before. Let's just pick the line immediately before DOB as a good guess
            # if it has enough alphabetic characters.
            for j in range(dob_idx - 1, max(-1, dob_idx - 3), -1):
                candidate = text_list[j].strip()
                # filter out noisy symbols, keep english letters
                candidate_letters = re.sub(r'[^a-zA-Z\s]', '', candidate)
                if len(candidate_letters.strip()) > 3:
                    extracted["name"] = candidate_letters.strip()
                    break

        return extracted
