import re

# Verhoeff algorithm components
d = (
    (0,1,2,3,4,5,6,7,8,9),
    (1,2,3,4,0,6,7,8,9,5),
    (2,3,4,0,1,7,8,9,5,6),
    (3,4,0,1,2,8,9,5,6,7),
    (4,0,1,2,3,9,5,6,7,8),
    (5,9,8,7,6,0,4,3,2,1),
    (6,5,9,8,7,1,0,4,3,2),
    (7,6,5,9,8,2,1,0,4,3),
    (8,7,6,5,9,3,2,1,0,4),
    (9,8,7,6,5,4,3,2,1,0)
)
p = (
    (0,1,2,3,4,5,6,7,8,9),
    (1,5,7,6,2,8,3,0,9,4),
    (5,8,0,3,7,9,6,1,4,2),
    (8,9,1,6,0,4,3,5,2,7),
    (9,4,5,3,1,2,6,8,7,0),
    (4,2,8,6,5,7,3,9,0,1),
    (2,7,9,3,8,0,6,4,1,5),
    (7,0,4,6,9,1,3,2,5,8)
)
inv = (0,4,3,2,1,5,6,7,8,9)

def verhoeff_check(num_str: str) -> bool:
    """Validate a number string using the Verhoeff algorithm (used by Aadhaar)."""
    try:
        num_str = num_str.replace(" ", "").strip()
        if not num_str.isdigit() or len(num_str) != 12:
            return False
        
        c = 0
        reversed_num_array = [int(x) for x in reversed(num_str)]
        
        for i, n in enumerate(reversed_num_array):
            c = d[c][p[i % 8][n]]
            
        return c == 0
    except Exception:
        return False

def icao9303_check(document_number: str) -> bool:
    """Calculate and validate ICAO-9303 check digit (used for passports).
    Assuming format is 8 chars + 1 check digit.
    """
    try:
        document_number = document_number.strip().upper()
        if len(document_number) < 9:
            return False
            
        weights = [7, 3, 1]
        data = document_number[:-1]
        check_digit = document_number[-1]
        
        total = 0
        for i, char in enumerate(data):
            if char == '<':
                val = 0
            elif char.isdigit():
                val = int(char)
            else:
                val = ord(char) - 55 # A=10, B=11...
            total += val * weights[i % 3]
            
        calculated_check = str(total % 10)
        return calculated_check == check_digit
    except Exception:
        return False

class ChecksumService:
    @staticmethod
    def validate_aadhaar(document_number: str) -> bool:
        """Wrapper for Aadhaar validation"""
        if not document_number:
            return False
        return verhoeff_check(document_number)
        
    @staticmethod
    def validate_passport(document_number: str) -> bool:
        """Wrapper for Passport validation"""
        if not document_number:
            return False
        return icao9303_check(document_number)
