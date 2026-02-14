import re
import pdfplumber
import pytesseract
from pdf2image import convert_from_path
from PIL import Image
import os
import tempfile
from flask import jsonify

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


# =========================================================
# TEXT EXTRACTION
# =========================================================

def extract_text_from_file(file_path):
    text = ""

    if file_path.lower().endswith(".pdf"):
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"

            if len(text.strip()) < 100:
                print("⚠ Using OCR fallback...")
                images = convert_from_path(file_path)
                for img in images:
                    text += pytesseract.image_to_string(img)

        except Exception as e:
            print("PDF extraction error:", e)

    else:
        try:
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)
        except Exception as e:
            print("Image OCR error:", e)

    return text


def clean_text(text):
    text = re.sub(r'\s+', ' ', text)
    return text.lower()


# =========================================================
# SAFE VALUE EXTRACTION
# =========================================================

def extract_value(pattern, text, min_val=None, max_val=None):
    match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
    if match:
        try:
            # Always take the LAST captured numeric group
            value = float(match.group(match.lastindex))

            if min_val is not None and value < min_val:
                return None
            if max_val is not None and value > max_val:
                return None

            return value
        except:
            return None
    return None


# =========================================================
# CLASSIFIERS
# =========================================================

def classify_vitamin_d(value):
    if value is None:
        return "Not Found", ""
    if value < 20:
        return "Deficient", "Severe deficiency. Supplementation required."
    elif value < 30:
        return "Insufficient", "Increase sunlight exposure."
    return "Normal", "Healthy level."


def classify_b12(value):
    if value is None:
        return "Not Found", ""
    if value < 211:
        return "Low", "Consider B12 supplements."
    elif value < 300:
        return "Borderline", "Monitor levels."
    return "Normal", "Healthy."


def classify_glucose(value):
    if value is None:
        return "Not Found", ""
    if value < 70:
        return "Low", "Hypoglycemia detected."
    elif value <= 100:
        return "Normal", "Healthy fasting level."
    elif value < 126:
        return "Prediabetic", "Lifestyle changes recommended."
    return "Diabetic Range", "Consult physician."


def classify_hemoglobin(value):
    if value is None:
        return "Not Found", ""
    if value < 12:
        return "Low", "Possible anemia."
    return "Normal", "Healthy."


def classify_ldl(value):
    if value is None:
        return "Not Found", ""
    if value < 100:
        return "Optimal", "Ideal LDL level."
    elif value <= 129:
        return "Near Optimal", "Monitor diet."
    elif value <= 159:
        return "Borderline High", "Reduce saturated fats."
    return "High", "Consult physician."


def classify_hdl(value):
    if value is None:
        return "Not Found", ""
    if value < 40:
        return "Low", "Increase physical activity."
    return "Normal", "Protective level."


# =========================================================
# BLOOD REPORT ROUTE
# =========================================================

@app.route("/analyze-blood-report", methods=["POST"])
def analyze_blood_report():

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    file_extension = os.path.splitext(file.filename)[1]

    with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp:
        file.save(temp.name)
        file_path = temp.name

    full_text = extract_text_from_file(file_path)
    processed_text = clean_text(full_text)

    print("\n🔥 BLOOD EXTRACTION ACTIVE 🔥")
    print(processed_text[:500])

    # 🔥 FLEXIBLE PATTERNS

    vitamin_d = extract_value(
        r"(25[- ]?oh vitamin d).*?(\d+\.?\d*)\s*ng",
        processed_text, 2, 150
    )

    b12 = extract_value(
        r"(vitamin b[- ]?12).*?(\d+\.?\d*)\s*pg",
        processed_text, 50, 2000
    )

    glucose = extract_value(
        r"(fasting glucose|fasting blood sugar|fbs).*?(\d+\.?\d*)\s*mg",
        processed_text, 40, 400
    )

    hemoglobin = extract_value(
        r"(hemoglobin|hb|hgb).*?(\d+\.?\d*)\s*g",
        processed_text, 5, 20
    )

    ldl = extract_value(
        r"(ldl).*?(\d+\.?\d*)\s*mg",
        processed_text, 10, 400
    )

    hdl = extract_value(
        r"(hdl).*?(\d+\.?\d*)\s*mg",
        processed_text, 10, 150
    )

    results = {}

    for name, value, classifier in [
        ("Vitamin D", vitamin_d, classify_vitamin_d),
        ("Vitamin B12", b12, classify_b12),
        ("Fasting Glucose", glucose, classify_glucose),
        ("Hemoglobin", hemoglobin, classify_hemoglobin),
        ("LDL", ldl, classify_ldl),
        ("HDL", hdl, classify_hdl),
    ]:
        status, suggestion = classifier(value)
        results[name] = {
            "value": value,
            "status": status,
            "suggestion": suggestion
        }

    return jsonify(results)


# =========================================================
# RUN FLASK
# =========================================================

if __name__ == "__main__":
    app.run(debug=True)
