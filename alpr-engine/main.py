from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import easyocr
import re

app = FastAPI(title="ALPR Computer Vision Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize EasyOCR English model
reader = easyocr.Reader(['en'], gpu=False)

VALID_STATES = {
    "AN","AP","AR","AS","BR","CH","CG","DN","DD","DL","GA","GJ","HR","HP",
    "JK","JH","KA","KL","LA","LD","MP","MH","MN","ML","MZ","NL","OD","OR",
    "PY","PB","RJ","SK","TN","TG","TS","TR","UP","UK","WB"
}

STATE_CORRECTIONS = {
    "0L": "DL", "OL": "DL", "0I": "DL", "DI": "DL", "D1": "DL",
    "NH": "MH", "MN": "MH", "M4": "MH", "WH": "MH",
    "K4": "KA", "R4": "KA", "X4": "KA",
    "6J": "GJ", "G7": "GJ",
    "0P": "UP", "U9": "UP",
    "1N": "TN", "T1": "TN", "7N": "TN"
}

CHAR_TO_NUM = {'O':'0', 'D':'0', 'Q':'0', 'I':'1', 'T':'1', 'Z':'2', 'S':'5', 'G':'6', 'B':'8', 'A':'4'}
NUM_TO_CHAR = {'0':'O', '1':'I', '2':'Z', '5':'S', '6':'G', '8':'B', '4':'A', '9':'P', '7':'T', '3':'E'}

def clean_ocr_text(text: str) -> str:
    """Removes symbols and spaces, normalizes to uppercase."""
    return re.sub(r'[^A-Z0-9]', '', str(text).upper())

def fix_indian_plate_positional(raw_text: str) -> str:
    """
    Standard Indian License Plate layout & Positional Anchor Engine:
    - Automatically drops brand badges (HONDA, MARUTI, TVS) and HSRP 'IND' prefix.
    - Anchors on the 2-letter state code followed by district code.
    - Resolves 'Q' vs 'O': CMVR Rule 50 strictly prohibits 'O' in series marks to
      prevent confusion with '0'. Any optical 'O' or '0' in series position is rectified to 'Q'.
    - Corrects number vs letter optical typos according to positional slot.
    """
    cleaned = clean_ocr_text(raw_text)
    if not cleaned:
        return ""

    # 1. Strip common branding & country prefixes
    for prefix in ["INDIA", "HONDA", "MARUTI", "BAJAJ", "HERO", "TATA", "TVS", "YAMAHA", "SUZUKI", "IND", "1ND", "LND", "TND"]:
        if cleaned.startswith(prefix):
            cleaned = cleaned[len(prefix):]
            break

    # 2. Check Bharat Series format (e.g. 22BH1234AA)
    bh_match = re.search(r'([0-9]{2}BH[0-9]{1,4}[A-Z]{1,2})', cleaned)
    if bh_match:
        return bh_match.group(1)

    start_idx = -1
    matched_state = ""

    # 3. State Code Anchor: Look for 2 letters (or optical equiv) followed by 1-2 digits
    for i in range(len(cleaned) - 3):
        st_cand = "".join([NUM_TO_CHAR.get(c, c) for c in cleaned[i:i+2]])
        corrected_st = STATE_CORRECTIONS.get(st_cand, st_cand)
        if corrected_st in VALID_STATES:
            next_char = cleaned[i+2]
            if next_char.isdigit() or next_char in CHAR_TO_NUM:
                start_idx = i
                matched_state = corrected_st
                break

    # Fallback search if no digit immediately followed
    if start_idx == -1:
        for i in range(len(cleaned) - 1):
            chunk = "".join([NUM_TO_CHAR.get(c, c) for c in cleaned[i:i+2]])
            corrected = STATE_CORRECTIONS.get(chunk, chunk)
            if corrected in VALID_STATES:
                start_idx = i
                matched_state = corrected
                break

    if start_idx != -1:
        core = cleaned[start_idx:]
    else:
        core = cleaned

    if len(core) < 7:
        return core

    # Restrict to at most 10-11 characters to strip trailing dealer text/numbers
    candidate = core[:10]

    # Parse Slot 1: State Code (2 letters)
    state = matched_state if matched_state else "".join([NUM_TO_CHAR.get(c, c) for c in candidate[:2]])
    state = STATE_CORRECTIONS.get(state, state)

    remainder = candidate[2:]

    # Parse Slot 2: District Code (1 or 2 digits)
    if len(remainder) >= 2 and (remainder[1].isdigit() or remainder[1] in CHAR_TO_NUM):
        rto = "".join([CHAR_TO_NUM.get(c, c) for c in remainder[:2]])
        rest = remainder[2:]
    else:
        rto = CHAR_TO_NUM.get(remainder[0], remainder[0])
        rest = remainder[1:]

    # Parse Slot 3: Unique Serial (1-4 digits) & Slot 4: Series Letters
    if len(rest) >= 5:
        serial_raw = rest[-4:]
        series_raw = rest[:-4]
    elif len(rest) == 4:
        if rest[0].isalpha() and rest[1:].isdigit():
            series_raw = rest[0]
            serial_raw = rest[1:]
        else:
            series_raw = ""
            serial_raw = rest
    else:
        series_raw = ""
        serial_raw = rest

    # Tail Serial (strictly digits)
    serial = "".join([CHAR_TO_NUM.get(c, c) for c in serial_raw])

    # Series Letters (strictly letters)
    # Under CMVR Rule 50, 'O' is barred from registration series marks.
    # If OCR detected 'O' or '0' here, it is an optical misread for 'Q'!
    series_chars = []
    for c in series_raw:
        if c == 'Q':
            series_chars.append('Q')
        elif c in ('O', '0'):
            series_chars.append('Q')
        else:
            series_chars.append(NUM_TO_CHAR.get(c, c))
    series = "".join(series_chars)

    return f"{state}{rto}{series}{serial}"

def stitch_and_anchor_plate(ocr_results) -> str:
    """
    Universal Fragment Stitcher:
    - Filters tiny fragments (len >= 1, prob > 0.15) to catch broken or motorcycle plates.
    - Groups fragments into horizontal rows based on Y-coordinates.
    - Sorts fragments left-to-right (X-coordinates) in each row.
    - Passes the stitched text through the Positional Anchor Engine.
    """
    if not ocr_results:
        return None

    blocks = []
    for bbox, text, prob in ocr_results:
        cleaned = clean_ocr_text(text)
        if len(cleaned) >= 1 and prob > 0.15:
            x_center = (bbox[0][0] + bbox[1][0]) / 2.0
            y_center = (bbox[0][1] + bbox[2][1]) / 2.0
            blocks.append({'text': cleaned, 'x': x_center, 'y': y_center, 'prob': float(prob)})

    if not blocks:
        return None

    # Group into horizontal rows
    blocks.sort(key=lambda b: b['y'])
    rows = []
    current_row = []

    for b in blocks:
        if not current_row:
            current_row.append(b)
        else:
            if abs(b['y'] - current_row[0]['y']) < 35:
                current_row.append(b)
            else:
                rows.append(current_row)
                current_row = [b]
    if current_row:
        rows.append(current_row)

    # Sort each row Left-to-Right by X coordinate
    raw_stitched = ""
    for row in rows:
        row.sort(key=lambda b: b['x'])
        for b in row:
            raw_stitched += b['text']

    print(f"Stitched Raw OCR: '{raw_stitched}'")

    final_plate = fix_indian_plate_positional(raw_stitched)
    if len(final_plate) >= 7:
        return final_plate
    return None

@app.post("/process-plate")
async def process_plate(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return {"error": "Invalid image frame"}

        print("\n--- INITIATING UNIVERSAL ALPR SCAN (CARS & MOTORCYCLES) ---")
        h, w = img.shape[:2]

        # Normalize resolution: max width 1200
        if w > 1200:
            scale = 1200.0 / w
            img = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
            h, w = img.shape[:2]

        # Strategy 1: Grayscale with Clue OCR parameters (mag_ratio=1.5, greedy, width_ths=0.7)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        results = reader.readtext(
            gray,
            allowlist='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
            mag_ratio=1.5,
            width_ths=0.7,
            decoder='greedy'
        )
        plate = stitch_and_anchor_plate(results)
        if plate:
            print(f"ALPR Success (Strategy 1 - Grayscale & Universal Stitcher): {plate}")
            return {"licensePlate": plate}

        # Strategy 2: CLAHE Contrast Enhanced Grayscale (for shadows, glare, low-contrast)
        clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        results_clahe = reader.readtext(
            enhanced,
            allowlist='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
            mag_ratio=1.5,
            width_ths=0.7,
            decoder='greedy'
        )
        plate_clahe = stitch_and_anchor_plate(results_clahe)
        if plate_clahe:
            print(f"ALPR Success (Strategy 2 - CLAHE Enhanced): {plate_clahe}")
            return {"licensePlate": plate_clahe}

        # Strategy 3: Direct Color (BGR) OCR
        results_color = reader.readtext(
            img,
            allowlist='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
            mag_ratio=1.5,
            width_ths=0.7,
            decoder='greedy'
        )
        plate_color = stitch_and_anchor_plate(results_color)
        if plate_color:
            print(f"ALPR Success (Strategy 3 - Direct Color): {plate_color}")
            return {"licensePlate": plate_color}

        # Strategy 4: Rectangular License Plate Contour Cropping
        blurred = cv2.bilateralFilter(gray, 11, 17, 17)
        edged = cv2.Canny(blurred, 30, 200)
        contours, _ = cv2.findContours(edged.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        contours = sorted(contours, key=cv2.contourArea, reverse=True)[:15]

        for c in contours:
            x, y, cw, ch = cv2.boundingRect(c)
            aspect_ratio = float(cw) / ch if ch > 0 else 0
            if 1.8 <= aspect_ratio <= 6.0 and cw > 60 and ch > 15:
                pad_y = int(ch * 0.1)
                pad_x = int(cw * 0.05)
                y1 = max(0, y - pad_y)
                y2 = min(h, y + ch + pad_y)
                x1 = max(0, x - pad_x)
                x2 = min(w, x + cw + pad_x)
                crop = img[y1:y2, x1:x2]
                if crop.size > 0:
                    crop_res = reader.readtext(
                        crop,
                        allowlist='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
                        mag_ratio=1.5,
                        width_ths=0.7,
                        decoder='greedy'
                    )
                    crop_plate = stitch_and_anchor_plate(crop_res)
                    if crop_plate:
                        print(f"ALPR Success (Strategy 4 - Contour Crop): {crop_plate}")
                        return {"licensePlate": crop_plate}

        print("ALPR: No clear license plate pattern detected across all 4 strategies.")
        return {"error": "Computer vision could not identify a valid license plate in this frame."}

    except Exception as e:
        print(f"ALPR Engine Crash: {e}")
        return {"error": str(e)}