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
            return [res[1] for res in results]
        except Exception as e:
            print(f"OCR Exception: {e}")
            return []

    @staticmethod
    def extract_text_with_bboxes(image_np) -> List[Dict[str, Any]]:
        """Extracts text, bounding boxes, and confidences from an image."""
        try:
            reader = OCRService._get_reader()
            results = reader.readtext(image_np)
            
            output = []
            for res in results:
                bbox, text, prob = res
                # bbox is [[x1, y1], [x2, y1], [x2, y2], [x1, y2]]
                x_coords = [int(pt[0]) for pt in bbox]
                y_coords = [int(pt[1]) for pt in bbox]
                x1, y1 = min(x_coords), min(y_coords)
                x2, y2 = max(x_coords), max(y_coords)
                output.append({
                    "bbox": [x1, y1, x2, y2],
                    "text": text,
                    "confidence": float(prob)
                })
            return output
        except Exception as e:
            print(f"OCR BBox Exception: {e}")
            return []

    @staticmethod
    def parse_document(text_list: List[str], doc_type: str) -> Dict[str, Any]:
        """Routes to the correct parser based on doc_type."""
        doc_type = doc_type.upper()
        if doc_type in ["AADHAAR", "NATIONAL_ID"]:
            return OCRService.parse_aadhaar_fields(text_list)
        elif doc_type == "PAN":
            return OCRService.parse_pan_fields(text_list)
        elif doc_type in ["VOTER_ID", "EPIC"]:
            return OCRService.parse_voter_id_fields(text_list)
        elif doc_type in ["DL", "DRIVING_LICENSE"]:
            return OCRService.parse_dl_fields(text_list)
        elif doc_type in ["PASSPORT", "VISA"]:
            return OCRService.parse_passport_fields(text_list)
        else:
            # Fallback
            return {
                "name": None, "dob": None, "age": None, "gender": None,
                "document_number": None, "checksum_valid": False
            }

    @staticmethod
    def _extract_common(text_list: List[str]):
        """Helper to extract DOB, Age, Gender."""
        dob_pattern = re.compile(r'\b\d{2}[/-]\d{2}[/-]\d{4}\b')
        gender_pattern = re.compile(r'\b(Male|Female|Transgender|M|F)\b', re.IGNORECASE)
        
        dob = None
        age = None
        gender = None
        dob_idx = -1
        
        for i, text in enumerate(text_list):
            text_clean = text.strip()
            if not dob:
                dob_match = dob_pattern.search(text_clean)
                if dob_match:
                    dob = dob_match.group(0).replace('/', '-')
                    dob_idx = i
                    try:
                        dob_date = datetime.datetime.strptime(dob, "%d-%m-%Y")
                        today = datetime.datetime.today()
                        age = today.year - dob_date.year - ((today.month, today.day) < (dob_date.month, dob_date.day))
                    except Exception:
                        pass
            if not gender:
                gender_match = gender_pattern.search(text_clean)
                if gender_match:
                    g = gender_match.group(1).lower()
                    if g in ['m', 'male']:
                        gender = 'M'
                    elif g in ['f', 'female']:
                        gender = 'F'
                    else:
                        gender = 'T'
        
        return dob, age, gender, dob_idx

    @staticmethod
    def _extract_name_heuristic(text_list: List[str], dob_idx: int) -> str:
        NON_NAME_WORDS = {
            "government", "india", "authority", "identification", "unique",
            "aadhaar", "uidai", "address", "enrolment", "enrollment", "male",
            "female", "date", "birth", "mobile", "vid", "signature", "verified",
            "venfed", "your", "keep", "download", "help", "www", "gov", "state",
            "district", "code", "flat", "floor", "road", "east", "west",
            "north", "south", "bengal", "delhi", "mumbai", "kolkata", "father",
            "husband", "wife", "son", "daughter", "post", "office", "village",
            "town", "city", "pin", "no", "number", "issued", "print", "information",
            "income", "tax", "department", "licencee", "holder", "name", "dob"
        }
        name_candidates = []
        for i, line in enumerate(text_list):
            cleaned = line.strip()
            if re.match(r'^[A-Z][A-Za-z]+(?:\s[A-Z][A-Za-z]+){1,3}$', cleaned) or re.match(r'^[A-Z\s\.]{3,35}$', cleaned):
                words_lower = [w.lower() for w in cleaned.split()]
                if not any(bad in words_lower for bad in NON_NAME_WORDS):
                    if not re.search(r'\d', cleaned) and 3 <= len(cleaned) <= 40:
                        name_candidates.append((i, cleaned))
                        
        if not name_candidates:
            # Fallback to older simplistic heuristic
            if dob_idx > 0:
                for j in range(dob_idx - 1, max(-1, dob_idx - 4), -1):
                    candidate = text_list[j].strip()
                    candidate_letters = re.sub(r'[^a-zA-Z\s]', '', candidate)
                    if len(candidate_letters.strip()) > 3:
                        return candidate_letters.strip()
            return None
            
        if dob_idx > 0:
            before_dob = [c for c in name_candidates if c[0] < dob_idx]
            if before_dob:
                before_dob.sort(key=lambda c: dob_idx - c[0])
                return before_dob[0][1].strip()
                
        return name_candidates[0][1].strip()

    @staticmethod
    def parse_aadhaar_fields(text_list: List[str]) -> Dict[str, Any]:
        from services.checksum_service import ChecksumService
        dob, age, gender, dob_idx = OCRService._extract_common(text_list)
        
        document_number = None
        checksum_valid = False
        aadhaar_pattern = re.compile(r'\b([2-9]{1}\d{3}\s?\d{4}\s?\d{4})\b')
        for text in text_list:
            uid_match = aadhaar_pattern.search(text)
            if uid_match:
                text_lower = text.lower()
                if "vid" not in text_lower and "enrol" not in text_lower:
                    document_number = uid_match.group(1).replace(" ", "")
                    checksum_valid = ChecksumService.validate_aadhaar(document_number)
                    if checksum_valid:
                        break
                        
        if not document_number:
            all_text = " ".join(text_list)
            uid_match = aadhaar_pattern.search(all_text)
            if uid_match:
                document_number = uid_match.group(1).replace(" ", "")
                checksum_valid = ChecksumService.validate_aadhaar(document_number)

        name = OCRService._extract_name_heuristic(text_list, dob_idx)
        
        return {
            "name": name, "dob": dob, "age": age, "gender": gender,
            "document_number": document_number, "checksum_valid": checksum_valid
        }

    @staticmethod
    def parse_pan_fields(text_list: List[str]) -> Dict[str, Any]:
        from services.checksum_service import ChecksumService
        dob, age, gender, dob_idx = OCRService._extract_common(text_list)
        
        document_number = None
        checksum_valid = False
        pan_pattern = re.compile(r'\b([A-Z]{5}[0-9OISZB\?]{4}[A-Z])\b', re.IGNORECASE)
        all_text = " ".join(text_list)
        match = pan_pattern.search(all_text)
        
        if match:
            raw_pan = match.group(1).upper()
            digit_section = raw_pan[5:9]
            digit_section = digit_section.translate(str.maketrans('OISZB?', '015282'))
            document_number = raw_pan[:5] + digit_section + raw_pan[9:]
            checksum_valid = ChecksumService.validate_pan(document_number)
                
        name = OCRService._extract_name_heuristic(text_list, dob_idx)
        
        return {
            "name": name, "dob": dob, "age": age, "gender": gender,
            "document_number": document_number, "checksum_valid": checksum_valid
        }

    @staticmethod
    def parse_voter_id_fields(text_list: List[str]) -> Dict[str, Any]:
        from services.checksum_service import ChecksumService
        dob, age, gender, dob_idx = OCRService._extract_common(text_list)
        
        document_number = None
        checksum_valid = False
        epic_pattern = re.compile(r'\b([A-Z]{3}[-\s]?[0-9]{7})\b', re.IGNORECASE)
        all_text = " ".join(text_list)
        match = epic_pattern.search(all_text)
        if match:
            document_number = match.group(1).upper().replace(" ", "").replace("-", "")
            checksum_valid = ChecksumService.validate_voter_id(document_number)
                
        name = OCRService._extract_name_heuristic(text_list, dob_idx)
        
        return {
            "name": name, "dob": dob, "age": age, "gender": gender,
            "document_number": document_number, "checksum_valid": checksum_valid
        }

    @staticmethod
    def parse_dl_fields(text_list: List[str]) -> Dict[str, Any]:
        from services.checksum_service import ChecksumService
        dob, age, gender, dob_idx = OCRService._extract_common(text_list)
        
        document_number = None
        checksum_valid = False
        dl_pattern = re.compile(r'\b([A-Z]{2}[-\s/]?\d{2}[-\s/]?[\d\s/]{8,14})\b', re.IGNORECASE)
        all_text = " ".join(text_list)
        match = dl_pattern.search(all_text)
        if match:
            document_number = match.group(1).upper().replace(" ", "").replace("-", "").replace("/", "")
            checksum_valid = ChecksumService.validate_dl(document_number)
                
        name = OCRService._extract_name_heuristic(text_list, dob_idx)
        
        return {
            "name": name, "dob": dob, "age": age, "gender": gender,
            "document_number": document_number, "checksum_valid": checksum_valid
        }

    @staticmethod
    def parse_passport_fields(text_list: List[str]) -> Dict[str, Any]:
        from services.checksum_service import ChecksumService
        dob, age, gender, dob_idx = OCRService._extract_common(text_list)
        
        document_number = None
        checksum_valid = False
        parsed_name = None
        
        mrz_lines = []
        for text in text_list:
            clean_text = text.replace(" ", "").upper()
            if 42 <= len(clean_text) <= 46 and re.match(r'^[A-Z0-9<]{42,46}$', clean_text):
                mrz_lines.append(clean_text[:44].ljust(44, '<'))
                
        if len(mrz_lines) >= 2:
            is_line1 = lambda l: l.startswith('P<') or l.startswith('P ') or l.startswith('V<') or l.startswith('V ')
            if is_line1(mrz_lines[1]) and not is_line1(mrz_lines[0]):
                mrz_lines[0], mrz_lines[1] = mrz_lines[1], mrz_lines[0]
                
            line1 = mrz_lines[0]
            line2 = mrz_lines[1]
            
            name_raw = line1[5:].strip('<')
            parsed_name = name_raw.replace('<<', ' ').replace('<', ' ').strip()
            document_number = line2[0:9].replace('<', '')
            checksum_valid = ChecksumService.validate_passport(line2[0:10])

        if not document_number:
            for text in text_list:
                clean_text = text.replace(" ", "")
                if len(clean_text) >= 44 and not clean_text.startswith(('P<', 'V<')):
                    doc_part = clean_text[0:9].replace('<', '')
                    if doc_part:
                        document_number = doc_part
                        checksum_valid = ChecksumService.validate_passport(clean_text[0:10])
                        break
                        
        if not parsed_name:
            parsed_name = OCRService._extract_name_heuristic(text_list, dob_idx)

        return {
            "name": parsed_name, "dob": dob, "age": age, "gender": gender,
            "document_number": document_number, "checksum_valid": checksum_valid
        }
