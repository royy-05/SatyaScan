import os
import random
from PIL import Image, ImageDraw, ImageFont
from faker import Faker
import argparse
import yaml

fake = Faker('en_IN')

# Configuration
with open("config/config.yaml", "r") as f:
    config = yaml.safe_load(f)

OUTPUT_DIR = config.get("paths", {}).get("synthetic_data_output", "./datasets/sample_data/")
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(os.path.join(OUTPUT_DIR, "clean"), exist_ok=True)

def generate_aadhaar_number():
    # Verhoeff algorithm should be used in real scenario, mock for now
    return f"{random.randint(1000,9999)} {random.randint(1000,9999)} {random.randint(1000,9999)}"

def generate_pan_number():
    # Format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)
    letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    digits = "0123456789"
    return "".join(random.choices(letters, k=5)) + "".join(random.choices(digits, k=4)) + random.choice(letters)

def generate_dl_number():
    # Mock Indian DL format e.g., MH0420150034567
    state_codes = ["MH", "KA", "DL", "TN", "UP", "GJ"]
    return f"{random.choice(state_codes)}{random.randint(10,99)}{random.randint(1990,2025)}{random.randint(1000000,9999999)}"

def generate_voter_id():
    # Mock Indian Voter ID (EPIC) format e.g., ABC1234567
    letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    digits = "0123456789"
    return "".join(random.choices(letters, k=3)) + "".join(random.choices(digits, k=7))

def generate_mrz(doc_type="P", country="IND", name="MOCK NAME", doc_num="Z1234567", dob="900101", sex="M", exp="300101"):
    # Mock MRZ line generator (simplified ICAO 9303)
    line1 = f"{doc_type}<{country}{name.replace(' ', '<')}<<<<<<<<<<<<<<<<"[:44]
    line2 = f"{doc_num}<0{country}{dob}0{sex}{exp}6<<<<<<<<<<<<<<<0"[:44]
    return f"{line1}\n{line2}"

def create_mock_id(id_type, index):
    # Base image
    width, height = 800, 500
    bg_color = (240, 248, 255) if id_type == "AADHAAR" else (255, 250, 240)
    img = Image.new('RGB', (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)

    # Use default font for mock setup
    try:
        font_large = ImageFont.truetype("arial.ttf", 32)
        font_medium = ImageFont.truetype("arial.ttf", 24)
        font_mrz = ImageFont.truetype("cour.ttf", 28) # Courier for MRZ
    except:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        font_mrz = ImageFont.load_default()

    name = fake.name()
    dob = fake.date_of_birth(minimum_age=18, maximum_age=65).strftime('%d/%m/%Y')
    
    # Draw mock photo box
    draw.rectangle([50, 100, 250, 350], fill=(200, 200, 200), outline=(0, 0, 0))
    draw.text((100, 200), "PHOTO", fill=(100, 100, 100), font=font_medium)

    if id_type == "AADHAAR":
        draw.text((300, 50), "GOVERNMENT OF INDIA", fill=(0, 0, 0), font=font_large)
        draw.text((300, 120), f"Name: {name}", fill=(0, 0, 0), font=font_medium)
        draw.text((300, 170), f"DOB: {dob}", fill=(0, 0, 0), font=font_medium)
        draw.text((300, 220), f"Gender: {random.choice(['Male', 'Female'])}", fill=(0, 0, 0), font=font_medium)
        draw.text((width//2 - 100, 400), generate_aadhaar_number(), fill=(0, 0, 0), font=font_large)
    
    elif id_type == "PAN":
        draw.text((300, 50), "INCOME TAX DEPARTMENT", fill=(0, 0, 0), font=font_large)
        draw.text((300, 120), f"Name: {name}", fill=(0, 0, 0), font=font_medium)
        draw.text((300, 170), f"Father's Name: {fake.name()}", fill=(0, 0, 0), font=font_medium)
        draw.text((300, 220), f"DOB: {dob}", fill=(0, 0, 0), font=font_medium)
        draw.text((50, 400), generate_pan_number(), fill=(0, 0, 0), font=font_large)
    
    elif id_type == "PASSPORT":
        draw.text((300, 50), "REPUBLIC OF INDIA", fill=(0, 0, 0), font=font_large)
        draw.text((300, 120), f"Name: {name}", fill=(0, 0, 0), font=font_medium)
        draw.text((300, 170), f"DOB: {dob}", fill=(0, 0, 0), font=font_medium)
        # Draw MRZ
        mrz = generate_mrz(name=name.upper())
        draw.text((50, 420), mrz, fill=(0, 0, 0), font=font_mrz)
    
    elif id_type == "DL":
        draw.text((300, 50), "DRIVING LICENSE - UNION OF INDIA", fill=(0, 0, 0), font=font_large)
        draw.text((300, 120), f"Name: {name}", fill=(0, 0, 0), font=font_medium)
        draw.text((300, 170), f"DOB: {dob}", fill=(0, 0, 0), font=font_medium)
        draw.text((300, 220), f"Vehicle Class: MCWG, LMV", fill=(0, 0, 0), font=font_medium)
        draw.text((50, 400), generate_dl_number(), fill=(0, 0, 0), font=font_large)

    elif id_type == "VOTER_ID":
        draw.text((300, 50), "ELECTION COMMISSION OF INDIA", fill=(0, 0, 0), font=font_large)
        draw.text((300, 120), f"Name: {name}", fill=(0, 0, 0), font=font_medium)
        draw.text((300, 170), f"DOB: {dob}", fill=(0, 0, 0), font=font_medium)
        draw.text((300, 220), f"Gender: {random.choice(['Male', 'Female'])}", fill=(0, 0, 0), font=font_medium)
        draw.text((50, 400), generate_voter_id(), fill=(0, 0, 0), font=font_large)
    
    output_path = os.path.join(OUTPUT_DIR, "clean", f"{id_type.lower()}_{index}.jpg")
    img.save(output_path, quality=95)
    return output_path

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate Synthetic Indian IDs")
    parser.add_argument("--count", type=int, default=50, help="Number of samples to generate")
    args = parser.parse_args()

    print(f"Generating {args.count} synthetic IDs...")
    id_types = ["AADHAAR", "PAN", "PASSPORT", "DL", "VOTER_ID"]
    
    for i in range(args.count):
        doc_type = random.choice(id_types)
        create_mock_id(doc_type, i)
        if (i+1) % 10 == 0:
            print(f"Generated {i+1} / {args.count}")
    
    print("Synthetic generation complete.")
