from fastapi import FastAPI, UploadFile, File
import cv2
import numpy as np
import easyocr
import re

app = FastAPI()
reader = easyocr.Reader(['en'], gpu=False)

def fix_indian_plate_typos(plate_text):
    """
    Forces the plate into the Indian HSRP format (XX NN XX NNNN)
    by fixing common EasyOCR letter/number confusions based on index position.
    """
    # Common OCR visual illusions
    letter_to_num = {'O': '0', 'I': '1', 'L': '4', 'Z': '2', 'S': '5', 'G': '6', 'B': '8', 'Q': '0', 'T': '7'}
    num_to_letter = {'0': 'O', '1': 'I', '2': 'Z', '5': 'S', '6': 'G', '8': 'B', '4': 'A', '7': 'T'}
    
    # Standard Indian Plate is 10 characters (e.g., RJ14CV0002)
    if len(plate_text) == 10:
        fixed_plate = ""
        for i, char in enumerate(plate_text):
            # Positions 0, 1, 4, 5 MUST be letters (State & Middle Series)
            if i in [0, 1, 4, 5]:
                fixed_plate += num_to_letter.get(char, char)
            # Positions 2, 3, 6, 7, 8, 9 MUST be numbers (RTO & Last 4)
            elif i in [2, 3, 6, 7, 8, 9]:
                fixed_plate += letter_to_num.get(char, char)
            else:
                fixed_plate += char
        return fixed_plate
        
    return plate_text

@app.post("/process-plate")
async def process_plate(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return {"error": "Invalid image frame"}

        print("\n--- NEW SCAN RECEIVED ---")
        
        # Upscale to make pixel edges sharper
        img = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        results = reader.readtext(gray)
        
        detected_plates = []
        for (bbox, text, prob) in results:
            cleaned = re.sub(r'[^A-Z0-9]', '', text.upper())
            
            # Ignore random small logos and artifacts
            if len(cleaned) >= 7 and prob > 0.10: 
                print(f"AI Raw Read: '{cleaned}'")
                
                # Apply the Domain Knowledge Corrector
                corrected = fix_indian_plate_typos(cleaned)
                print(f"Algorithmic Correction: '{corrected}'")
                
                detected_plates.append((corrected, prob))

        if not detected_plates:
            return {"error": "No plate detected with sufficient length"}

        # Select the highest confidence plate
        best_plate = max(detected_plates, key=lambda x: x[1])[0]
        print(f"SUCCESS: Sending '{best_plate}' back to Java!")
        return {"licensePlate": best_plate}

    except Exception as e:
        print(f"PYTHON CRASH: {e}")
        return {"error": str(e)}