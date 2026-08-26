import re
import yaml
import easyocr
import sys

# Fix Windows console charmap error for easyocr progress bar
if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

class OCREngine:
    def __init__(self, config_path="config/config.yaml"):
        with open(config_path, "r") as f:
            self.config = yaml.safe_load(f)["models"]["ocr"]
            
        try:
            # EasyOCR expects a list of languages, default 'en'
            self.ocr = easyocr.Reader([self.config.get("lang", "en")], gpu=False)
            self.ocr_available = True
        except Exception as e:
            self.ocr = None
            self.ocr_available = False
            print(f"EasyOCR not installed correctly. Error: {e}")

    def extract_text(self, img_path):
        if not self.ocr_available:
            return ["MOCK", "TEXT", "EXTRACTED"]
            
        # EasyOCR returns a list of tuples: (bbox, text, prob)
        result = self.ocr.readtext(img_path)
        texts = []
        if result:
            for item in result:
                texts.append(item[1])
        return texts

    def validate_aadhaar(self, texts):
        # Verhoeff algorithm tables for Aadhaar Checksum
        verhoeff_d = [
            [0,1,2,3,4,5,6,7,8,9], [1,2,3,4,0,6,7,8,9,5], [2,3,4,0,1,7,8,9,5,6],
            [3,4,0,1,2,8,9,5,6,7], [4,0,1,2,3,9,5,6,7,8], [5,9,8,7,6,0,4,3,2,1],
            [6,5,9,8,7,1,0,4,3,2], [7,6,5,9,8,2,1,0,4,3], [8,7,6,5,9,3,2,1,0,4],
            [9,8,7,6,5,4,3,2,1,0]
        ]
        verhoeff_p = [
            [0,1,2,3,4,5,6,7,8,9], [1,5,7,6,2,8,3,0,9,4], [5,8,0,3,7,9,6,1,4,2],
            [8,9,1,6,0,4,3,5,2,7], [9,4,5,3,1,2,6,8,7,0], [4,2,8,6,5,7,3,9,0,1],
            [2,7,9,3,8,0,6,4,1,5], [7,0,4,6,9,1,3,2,5,8]
        ]

        # Basic regex for 12 digit number
        aadhaar_pattern = r'\b\d{4}\s?\d{4}\s?\d{4}\b'
        for text in texts:
            match = re.search(aadhaar_pattern, text)
            if match:
                aadhaar_num = match.group().replace(" ", "")
                # Run Verhoeff validation
                c = 0
                for i, n in enumerate(reversed(aadhaar_num)):
                    c = verhoeff_d[c][verhoeff_p[i % 8][int(n)]]
                if c == 0:
                    return True
        return False

    def validate_pan(self, texts):
        # Format: 5 letters, 4 digits, 1 letter
        pan_pattern = r'\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b'
        for text in texts:
            if re.search(pan_pattern, text):
                return True
        return False

    def validate_mrz(self, texts):
        def mrz_checksum(data_str):
            weights = [7, 3, 1]
            total = 0
            for i, char in enumerate(data_str):
                if '0' <= char <= '9':
                    val = int(char)
                elif 'A' <= char <= 'Z':
                    val = ord(char) - 55
                elif char == '<':
                    val = 0
                else:
                    return -1
                total += val * weights[i % 3]
            return total % 10

        for text in texts:
            # Clean up OCR output
            clean_text = text.replace(" ", "").upper()
            
            # Look for MRZ Line 2 (TD3 format: 44 chars)
            if len(clean_text) == 44 and re.match(r'^[A-Z0-9<]{44}$', clean_text):
                try:
                    passport_no = clean_text[0:9]
                    pass_check = int(clean_text[9]) if clean_text[9] != '<' else 0
                    
                    dob = clean_text[13:19]
                    dob_check = int(clean_text[19]) if clean_text[19] != '<' else 0
                    
                    exp = clean_text[21:27]
                    exp_check = int(clean_text[27]) if clean_text[27] != '<' else 0
                    
                    # Validate all three ICAO checksums mathematically
                    if (mrz_checksum(passport_no) == pass_check and
                        mrz_checksum(dob) == dob_check and
                        mrz_checksum(exp) == exp_check):
                        return True
                except ValueError:
                    continue
                    
        return False

    def validate_dl(self, texts):
        # Format: 2 letters, 2 digits, 4 digits year, 7 digits number (e.g. MH0420150034567)
        # Note: formatting can sometimes have spaces, but we use a basic regex
        dl_pattern = r'\b[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}\b'
        for text in texts:
            if re.search(dl_pattern, text.replace(" ", "")):
                return True
        return False

    def validate_voter_id(self, texts):
        # Format: 3 letters, 7 digits (e.g. ABC1234567)
        voter_pattern = r'\b[A-Z]{3}[0-9]{7}\b'
        for text in texts:
            if re.search(voter_pattern, text.replace(" ", "")):
                return True
        return False

    def process(self, img_path, doc_type):
        texts = self.extract_text(img_path)
        print(f"\n[DEBUG] Extracted texts from {img_path}:")
        for i, t in enumerate(texts):
            print(f"  {i}: '{t}'")
            
        is_valid = False
        
        if doc_type == "AADHAAR":
            is_valid = self.validate_aadhaar(texts)
            print(f"[DEBUG] validate_aadhaar returned {is_valid}")
        elif doc_type == "PAN":
            is_valid = self.validate_pan(texts)
        elif doc_type == "PASSPORT":
            is_valid = self.validate_mrz(texts)
        elif doc_type == "DL":
            is_valid = self.validate_dl(texts)
        elif doc_type == "VOTER_ID":
            is_valid = self.validate_voter_id(texts)
            
        return {
            "texts_extracted": texts,
            "is_valid_format": is_valid
        }
