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
        # Format: 5 letters, 4 digits (or OCR typos), 1 letter
        pan_pattern = r'\b[A-Z]{5}[0-9OISZB]{4}[A-Z]{1}\b'
        for text in texts:
            if re.search(pan_pattern, text, re.IGNORECASE):
                return True
            if "INCOME TAX" in text.upper():
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
            if 42 <= len(clean_text) <= 46 and re.match(r'^[A-Z0-9<]{42,46}$', clean_text):
                clean_text = clean_text[:44].ljust(44, '<')
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
                    
        # Fallback for noisy OCR (cropped MRZ lines)
        all_text = "".join(texts).upper().replace(" ", "")
        if re.search(r'([A-Z]{3})(\d{6})[\d<]([MF<0-9])(\d{6})[\d<]', all_text):
            return True
            
        return False

    def validate_dl(self, texts):
        # Format: 2 letters, 2 digits, optional space/hyphen/slash, 10-14 digits (e.g. MH0420150034567 or KA-01/2020/0012345)
        dl_pattern = r'\b[A-Z]{2}[-\s/]?\d{2}[-\s/]?[\d\s/]{8,14}\b'
        for text in texts:
            if re.search(dl_pattern, text, re.IGNORECASE):
                return True
        return False

    def validate_voter_id(self, texts):
        # Format: 3 letters, optional space/hyphen, 7 digits (e.g. ABC1234567)
        voter_pattern = r'\b[A-Z]{3}[-\s]?[0-9]{7}\b'
        for text in texts:
            if re.search(voter_pattern, text, re.IGNORECASE):
                return True
        return False

    def parse_aadhaar(self, texts_extracted):
        all_text = " ".join(texts_extracted)
        
        # 12-digit Aadhaar, avoiding VID and enrolment numbers
        aadhaar_match = None
        for line in texts_extracted:
            m = re.search(r'\b(\d{4}\s?\d{4}\s?\d{4})\b', line)
            if m:
                line_lower = line.lower()
                if "vid" not in line_lower and "enrol" not in line_lower and "enrollment" not in line_lower:
                    aadhaar_match = m
                    break
                    
        if not aadhaar_match:
            aadhaar_match = re.search(r'\b(\d{4}\s?\d{4}\s?\d{4})\b', all_text)

        NON_NAME_WORDS = {
            "government", "india", "authority", "identification", "unique",
            "aadhaar", "uidai", "address", "enrolment", "enrollment", "male",
            "female", "date", "birth", "mobile", "vid", "signature", "verified",
            "venfed", "your", "keep", "download", "help", "www", "gov", "state",
            "district", "code", "flat", "floor", "road", "east", "west",
            "north", "south", "bengal", "delhi", "mumbai", "kolkata", "father",
            "husband", "wife", "son", "daughter", "post", "office", "village",
            "town", "city", "pin", "no", "number", "issued", "print", "information",
            "apartment", "road", "alambazar"
        }
        
        dob_idx = -1
        for i, line in enumerate(texts_extracted):
            if re.search(r'(?:DOB|D[OGB]B|Date of Birth|Birth).*?\d{2}', line, re.IGNORECASE):
                dob_idx = i
                break

        name = None
        name_candidates = []
        for i, line in enumerate(texts_extracted):
            cleaned = line.strip()
            if re.match(r'^[A-Z][A-Za-z]+(?:\s[A-Z][A-Za-z]+){1,3}$', cleaned):
                words_lower = [w.lower() for w in cleaned.split()]
                if not any(bad in words_lower for bad in NON_NAME_WORDS):
                    if 3 <= len(cleaned) <= 40:
                        name_candidates.append((i, cleaned))
                        
        if name_candidates:
            if dob_idx != -1:
                before_dob = [c for c in name_candidates if c[0] < dob_idx]
                if before_dob:
                    before_dob.sort(key=lambda c: dob_idx - c[0])
                    name = before_dob[0][1]
            if not name:
                name = name_candidates[0][1]

        # Support DOB slashes /, hyphens -, dots .
        dob_match = re.search(r'(?:DOB|D[OGB]B|Date of Birth)[:\s/]*(\d{2}[-/\.]\d{2}[-/\.]\d{4})', all_text, re.IGNORECASE)
        if not dob_match:
            dob_match = re.search(r'\b(\d{2}[-/\.]\d{2}[-/\.]\d{4})\b', all_text)
            
        gender_match = re.search(r'\b(MALE|FEMALE)\b', all_text, re.IGNORECASE)
        
        return {
            "doc_number": aadhaar_match.group(1).replace(" ", "") if aadhaar_match else None,
            "name": name,
            "dob": dob_match.group(1).replace('.', '/').replace('-', '/') if dob_match else None,
            "gender": gender_match.group(1).upper() if gender_match else None,
        }

    def parse_pan(self, texts_extracted):
        all_text = " ".join(texts_extracted)
        
        # PAN format: 5 letters + 4 digits + 1 letter (with OCR typos allowed)
        pan_match = re.search(r'\b([A-Z]{5}[0-9OISZB]{4}[A-Z])\b', all_text, re.IGNORECASE)
        pan_number = pan_match.group(1).upper() if pan_match else None
        
        if pan_number:
            # Fix common OCR typos in the 4-digit section
            digit_section = pan_number[5:9]
            digit_section = digit_section.translate(str.maketrans('OISZB', '01528'))
            pan_number = pan_number[:5] + digit_section + pan_number[9:]
            
        # Name extraction: look for candidates near DOB line that aren't header text
        name = None
        dob_idx = -1
        for i, line in enumerate(texts_extracted):
            if re.search(r'\b\d{2}[-/\.]\d{2}[-/\.]\d{4}\b', line):
                dob_idx = i
                break
                
        if dob_idx >= 1:
            for i in range(max(0, dob_idx - 3), dob_idx):
                line = texts_extracted[i].strip()
                if re.match(r'^[A-Z\s\.]{3,35}$', line):
                    line_upper = line.upper()
                    if not any(header in line_upper for header in ["INCOME", "TAX", "GOVT", "INDIA", "DEPARTMENT"]):
                        name = line
                        break
                        
        if not name:
            # Fallback for older PAN cards that explicitly print "Name:"
            name_match = re.search(r'(?:Name|Holder Name)[:\s]+([A-Z\s\.]+?)(?:\n|Father|DOB|$)', all_text, re.IGNORECASE)
            name = name_match.group(1).strip() if name_match else None
        
        # DOB: support slashes, hyphens, dots
        dob_match = re.search(r'\b(\d{2}[-/\.]\d{2}[-/\.]\d{4})\b', all_text)
        
        return {
            "doc_number": pan_number,
            "name": name,
            "dob": dob_match.group(1).replace('.', '/').replace('-', '/') if dob_match else None,
        }

    def parse_dl(self, texts_extracted):
        all_text = " ".join(texts_extracted)
        
        # DL format: XX0020150034567 or XX-04/2015/0034567
        dl_match = re.search(r'\b([A-Z]{2}[-\s/]?\d{2}[-\s/]?[\d\s/]{8,14})\b', all_text, re.IGNORECASE)
        
        # Name extraction
        name_match = re.search(r'(?:Name|Holder Name|Licencee Name)[\s:]*([A-Z\s]+?)(?=\s*(?:Date|D\.?O\.?B|S/O|D/O|W/O|Son|Daughter|Wife|Blood|$))', all_text, re.IGNORECASE)
        name = name_match.group(1).strip() if name_match else None
        
        if not name or len(name) < 3:
            name_before = re.search(r'([A-Z\s]+?)\s+(?:Name|Holder Name)[\s:]', all_text, re.IGNORECASE)
            if name_before:
                name = name_before.group(1).strip()
                
        # Dates extraction
        date_strs = re.findall(r'\b\d{2}[-/]\d{2}[-/]\d{4}\b', all_text)
        dob = None
        expiry = None
        
        if date_strs:
            from datetime import datetime
            parsed_dates = []
            for d in date_strs:
                try:
                    clean_d = d.replace('/', '-')
                    dt = datetime.strptime(clean_d, "%d-%m-%Y")
                    parsed_dates.append((dt, d))
                except ValueError:
                    continue
                    
            if parsed_dates:
                parsed_dates.sort(key=lambda x: x[0])
                dob = parsed_dates[0][1]
                if len(parsed_dates) >= 2:
                    expiry = parsed_dates[-1][1]
        
        return {
            "doc_number": dl_match.group(1).upper().strip() if dl_match else None,
            "name": name,
            "dob": dob,
            "expiry": expiry,
        }

    def parse_voter_id(self, texts_extracted):
        all_text = " ".join(texts_extracted)
        
        # EPIC format: 3 letters + 7 digits (e.g. ABC1234567)
        epic_match = re.search(r'\b([A-Z]{3}[-\s]?\d{7})\b', all_text, re.IGNORECASE)
        
        name_match = re.search(r'(?:Elector\'s\s+Name|Name|Elector Name)[:\s]+([A-Z\s\.]+?)(?:\n|Father|Husband|Mother|Age|$)', all_text, re.IGNORECASE)
        dob_match = re.search(r'(?:DOB|Date of Birth|Age)[:\s]+(\d{2}[-/]\d{2}[-/]\d{4})', all_text, re.IGNORECASE)
        
        # Age integer fallback if full DOB date string is missing
        if not dob_match:
            age_match = re.search(r'\bAge[:\s]+(\d{2})\b', all_text, re.IGNORECASE)
            if age_match:
                approx_year = 2026 - int(age_match.group(1))
                dob_val = f"01/01/{approx_year}"
            else:
                dob_val = None
        else:
            dob_val = dob_match.group(1)

        gender_match = re.search(r'\b(MALE|FEMALE|M|F)\b', all_text, re.IGNORECASE)
        gender_val = None
        if gender_match:
            g = gender_match.group(1).upper()
            gender_val = "MALE" if g in ("M", "MALE") else "FEMALE" if g in ("F", "FEMALE") else g

        return {
            "doc_number": epic_match.group(1).upper().replace(" ", "").replace("-", "") if epic_match else None,
            "name": name_match.group(1).strip() if name_match else None,
            "dob": dob_val,
            "gender": gender_val,
        }

    def parse_passport_mrz(self, texts_extracted):
        parsed = {}
        mrz_lines = []
        for text in texts_extracted:
            clean_text = text.replace(" ", "").upper()
            if 42 <= len(clean_text) <= 46 and re.match(r'^[A-Z0-9<]{42,46}$', clean_text):
                if len(clean_text) < 44:
                    clean_text = clean_text.ljust(44, '<')
                elif len(clean_text) > 44:
                    clean_text = clean_text[:44]
                mrz_lines.append(clean_text)
                
        if len(mrz_lines) >= 2:
            is_line1 = lambda l: l.startswith('P<') or l.startswith('P ') or l.startswith('V<') or l.startswith('V ')
            if is_line1(mrz_lines[1]) and not is_line1(mrz_lines[0]):
                mrz_lines[0], mrz_lines[1] = mrz_lines[1], mrz_lines[0]
                
            line1 = mrz_lines[0]
            line2 = mrz_lines[1]
            
            name_raw = line1[5:].strip('<')
            parsed['name'] = name_raw.replace('<<', ' ').replace('<', ' ').strip()
            parsed['doc_number'] = line2[0:9].replace('<', '')
            
            dob_raw = line2[13:19]
            if len(dob_raw) == 6 and dob_raw.isdigit():
                prefix = "19" if int(dob_raw[0:2]) > 30 else "20"
                parsed['dob'] = f"{dob_raw[4:6]}/{dob_raw[2:4]}/{prefix}{dob_raw[0:2]}"
                
            exp_raw = line2[21:27]
            if len(exp_raw) == 6 and exp_raw.isdigit():
                prefix = "19" if int(exp_raw[0:2]) > 50 else "20"
                parsed['expiry'] = f"{exp_raw[4:6]}/{exp_raw[2:4]}/{prefix}{exp_raw[0:2]}"
                
            gender = line2[20]
            if gender in ('M', 'F'):
                parsed['gender'] = 'MALE' if gender == 'M' else 'FEMALE'
                
        if not parsed.get('name') or not parsed.get('dob'):
            all_text = "".join(texts_extracted).upper().replace(" ", "")
            
            if not parsed.get('name'):
                for text in texts_extracted:
                    clean = text.upper().replace(" ", "")
                    if re.match(r'^[PV][A-Z<]{1,2}[A-Z]{3}[A-Z<]+', clean):
                        name_match = re.search(r'^[PV][A-Z<]{1,2}[A-Z]{3}([A-Z]+(?:<+[A-Z]+)*)', clean)
                        if name_match:
                            parsed['name'] = name_match.group(1).replace('<<', ' ').replace('<', ' ').strip()
                        break
                        
            if not parsed.get('name'):
                name_match = re.search(r'[PV][A-Z<]{1,2}([A-Z]{3})([A-Z]+(?:<+[A-Z]+)+)', all_text)
                if name_match:
                    raw_name = name_match.group(2)
                    if parsed.get('doc_number') and parsed['doc_number'] in raw_name:
                        raw_name = raw_name.split(parsed['doc_number'])[0]
                    parsed['name'] = raw_name.replace('<<', ' ').replace('<', ' ').strip()
                
            data_match = re.search(r'([A-Z]{3})(\d{6})[\d<]([MF<0-9])(\d{6})[\d<]', all_text)
            if data_match:
                dob_raw = data_match.group(2)
                prefix = "19" if int(dob_raw[0:2]) > 30 else "20"
                parsed['dob'] = f"{dob_raw[4:6]}/{dob_raw[2:4]}/{prefix}{dob_raw[0:2]}"
                
                sex_char = data_match.group(3)
                if sex_char in ('M', '0'):
                    parsed['gender'] = 'MALE'
                elif sex_char in ('F', '8'):
                    parsed['gender'] = 'FEMALE'
                    
                exp_raw = data_match.group(4)
                prefix = "19" if int(exp_raw[0:2]) > 50 else "20"
                parsed['expiry'] = f"{exp_raw[4:6]}/{exp_raw[2:4]}/{prefix}{exp_raw[0:2]}"
                
                if not parsed.get('doc_number'):
                    idx = data_match.start()
                    chunk = all_text[max(0, idx-15):idx].strip('<')
                    doc_match = re.search(r'([A-Z0-9<]{2,9})[\d<]?$', chunk)
                    if doc_match:
                        parsed['doc_number'] = doc_match.group(1).replace('<', '')

        return parsed

    def extract_parsed_fields(self, texts_extracted, doc_type):
        doc_type = doc_type.upper()
        
        if doc_type in ("PASSPORT", "VISA"):
            return self.parse_passport_mrz(texts_extracted)
        elif doc_type in ("AADHAAR", "NATIONAL_ID"):
            return self.parse_aadhaar(texts_extracted)
        elif doc_type == "PAN":
            return self.parse_pan(texts_extracted)
        elif doc_type in ("DRIVING_LICENSE", "DL"):
            return self.parse_dl(texts_extracted)
        elif doc_type in ("VOTER_ID", "VOTER", "EPIC"):
            return self.parse_voter_id(texts_extracted)
        else:
            return {}

    def process(self, img_path, doc_type):
        texts = self.extract_text(img_path)
        print(f"\n[DEBUG] Extracted texts from {img_path}:")
        for i, t in enumerate(texts):
            print(f"  {i}: '{t}'")
            
        is_valid = False
        doc_type_upper = doc_type.upper()
        
        if doc_type_upper in ("AADHAAR", "NATIONAL_ID"):
            is_valid = self.validate_aadhaar(texts)
            print(f"[DEBUG] validate_aadhaar returned {is_valid}")
        elif doc_type_upper == "PAN":
            is_valid = self.validate_pan(texts)
        elif doc_type_upper in ("PASSPORT", "VISA"):
            is_valid = self.validate_mrz(texts)
        elif doc_type_upper in ("DRIVING_LICENSE", "DL"):
            is_valid = self.validate_dl(texts)
        elif doc_type_upper in ("VOTER_ID", "VOTER", "EPIC"):
            is_valid = self.validate_voter_id(texts)
            
        parsed_fields = self.extract_parsed_fields(texts, doc_type_upper)
        mrz_parsed = parsed_fields if doc_type_upper in ("PASSPORT", "VISA") else {}

        return {
            "texts_extracted": texts,
            "is_valid_format": is_valid,
            "mrz_parsed": mrz_parsed,
            "parsed_fields": parsed_fields
        }
