from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tensorflow as tf
import numpy as np
from PIL import Image
import requests
from joblib import load
import pandas as pd
import tempfile
import re
import pdfplumber
import pytesseract
from pdf2image import convert_from_path

from tensorflow.keras.applications.efficientnet import preprocess_input
from flask import Flask, request, jsonify

from dotenv import load_dotenv
load_dotenv()
import requests
import os
from flask import jsonify



print("🔥 Aarogya AI Backend Started Successfully 🔥")

# ===================== APP SETUP =====================
app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "covid_dataset", "covid_19_data.csv")
@app.route("/")
def home():
    return jsonify({
        "status": "Aarogya AI Backend Running 🚀"
    })

# ====================================================
# =============== IMAGE MODELS (X-RAY) ================
# ====================================================
lung_xray_model = tf.keras.models.load_model(
    os.path.join(BASE_DIR, "models", "best_lung_model.h5")
)
bones_model = tf.keras.models.load_model(
    os.path.join(BASE_DIR, "models", "best_custom_cnn.h5")
)
kidney_model = tf.keras.models.load_model(
  os.path.join(BASE_DIR, "models", "kidney_stone_ct_model.h5")
)

def preprocess_image(image):
    image = image.resize((224, 224))
    image = np.array(image) / 255.0
    return np.expand_dims(image, axis=0)

@app.route("/predict/xray/lung", methods=["POST"])
def predict_lung_xray():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    image = Image.open(request.files["file"]).convert("RGB")
    img = preprocess_image(image)
    prob = float(lung_xray_model.predict(img)[0][0])

    return jsonify({
        "confidence": prob
    })

@app.route("/predict/xray/bones", methods=["POST"])
def predict_bones_xray():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    image = Image.open(request.files["file"]).convert("RGB")
    img = preprocess_image(image)
    confidence = float(np.max(bones_model.predict(img)))

    return jsonify({"confidence": confidence})

@app.route("/predict/xray/kidney", methods=["POST"])
def predict_kidney_xray():

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp:
        file.save(temp.name)

        img = Image.open(temp.name).convert("RGB")
        img = img.resize((224, 224))
        img = np.array(img)
        img = preprocess_input(img)
        img = np.expand_dims(img, axis=0)

    prediction = kidney_xray_model.predict(img)[0][0]

    if prediction > 0.7:
        result = "Likely Kidney Stone"
    elif prediction > 0.4:
        result = "Inconclusive"
    else:
        result = "Normal"

    return jsonify({
        "confidence": float(prediction),
        "result": result
    })

# Map variables
# Essential mapping for your Global COVID dataset
COUNTRY_COORDS = {
    "US": [37.0902, -95.7129],
    "India": [20.5937, 78.9629],
    "Brazil": [-14.2350, -51.9253],
    "Russia": [61.5240, 105.3188],
    "France": [46.2276, 2.2137],
    "UK": [55.3781, -3.4360],
    "Italy": [41.8719, 12.5674],
    "Spain": [40.4637, -3.7492],
    "Germany": [51.1657, 10.4515],
    "Turkey": [38.9637, 35.2433],
    "China": [35.8617, 104.1954],
    "Mainland China": [35.8617, 104.1954] # Matches your Kaggle cleaning logic
}




# --- HEATMAP ROUTE ---
import numpy as np

@app.route('/api/heatmap-data')
def get_covid_heatmap():
    try:
        df = pd.read_csv(DATA_PATH)
        
        # Ensure date format is correct and get latest data
        df['ObservationDate'] = pd.to_datetime(df['ObservationDate'])
        latest_date = df['ObservationDate'].max()
        latest_df = df[df['ObservationDate'] == latest_date]
        
        # Group by country
        cty = latest_df.groupby('Country/Region')['Confirmed'].sum().reset_index()
        
        heatmap_points = []
        if not cty.empty:
            # We use the 90th percentile instead of the absolute MAX 
            # This prevents one massive outlier from making everything else look tiny
            v_max = cty['Confirmed'].quantile(0.9) 
            
            for _, row in cty.iterrows():
                country = row['Country/Region']
                count = row['Confirmed']
                
                if country in COUNTRY_COORDS:
                    lat, lng = COUNTRY_COORDS[country]
                    
                    # Logarithmic normalization: count / (count + v_max)
                    # This ensures values stay between 0.1 and 1.0 nicely
                    intensity = float(count / (count + v_max))
                    
                    # Floor the intensity at 0.2 so even small spots are visible
                    intensity = max(intensity, 0.2)
                    
                    heatmap_points.append([lat, lng, intensity])
        
        return jsonify(heatmap_points)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify([])


# ====================================================
# =============== RISK MODELS =========================
# ====================================================
heart_model = load(os.path.join(BASE_DIR, "models", "heart_model.pkl"))
diabetes_model = load(os.path.join(BASE_DIR, "models", "diabetes_model.pkl"))

gender_map = {"Male": 0, "Female": 1}
yes_no_map = {"Yes": 1, "No": 0}

def calculate_bmi(weight, height):
    if weight > 0 and height > 0:
        return round(weight / ((height / 100) ** 2), 2)
    return 0

# ---------- HEART RISK ----------
@app.route("/predict/heart", methods=["POST"])
def predict_heart_risk():
    try:
        data = request.get_json()

        row = {}
        for f in heart_model.feature_names_in_:
            row[f] = 0

        row["Sex"] = gender_map.get(data.get("gender"), 0)
        row["Age_Category"] = min(int(data.get("age", 0)) // 10, 9)
        row["BMI"] = calculate_bmi(
            float(data.get("weight_kg", 0)),
            float(data.get("height_cm", 0))
        )
        row["Exercise"] = yes_no_map.get(data.get("exercise"), 0)

        X = pd.DataFrame([row])
        prob = heart_model.predict_proba(X)[0][1]

        return jsonify({"risk_percentage": round(prob * 100, 2)})

    except Exception as e:
        print("Heart error:", e)
        return jsonify({"risk_percentage": 0})

# ---------- DIABETES RISK ----------
@app.route("/predict/diabetes", methods=["POST"])
def predict_diabetes_risk():
    try:
        data = request.get_json()

        features = [
            gender_map.get(data.get("gender"), 0),
            int(data.get("age", 0)),
            calculate_bmi(
                float(data.get("weight_kg", 0)),
                float(data.get("height_cm", 0))
            ),
            yes_no_map.get(data.get("exercise"), 0),
            float(data.get("hba1c_level", 0)),
            float(data.get("blood_glucose_level", 0)),
        ]

        prob = diabetes_model.predict_proba([features])[0][1]
        return jsonify({"risk_percentage": round(prob * 100, 2)})

    except Exception as e:
        print("Diabetes error:", e)
        return jsonify({"risk_percentage": 0})

# ---------- LUNG RISK (QUESTIONNAIRE) ----------
@app.route("/predict/lung-risk", methods=["POST"])
def predict_lung_risk():
    # Hackathon-safe placeholder
    return jsonify({"risk_percentage": 45})




import requests
import os

@app.route("/chat", methods=["POST"])
def health_chat():
    try:
        data = request.get_json()
        user_message = data.get("message")

        if not user_message:
            return jsonify({"reply": "Please enter a message."})

        groq_api_key = os.environ.get("GROQ_API_KEY")
        if not groq_api_key:
            return jsonify({"reply": "Groq API key not set."})

        headers = {
            "Authorization": f"Bearer {groq_api_key.strip()}",
            "Content-Type": "application/json"
        }

        json_data = {
            "model": "llama-3.1-8b-instant", #Free + good model
            "messages": [
                {
                    "role": "system",
                    "content": """
                You are Aarogya AI, a responsible health assistant and blood report analyzer.

                Guidelines:
                - Keep answers short (5–8 lines max).
                - Use simple language.
                - Avoid too many bullet points.
                - Only give detailed explanation if user asks.
                - For mild symptoms, give 2–3 possible causes and simple advice.
                - Avoid overwhelming the user.

                Your responsibilities:

                1. If the user describes symptoms (headache, fever, stomach ache, etc.):
                - Give simple possible causes.
                - Suggest safe home remedies.
                - Do NOT immediately ask for lab reports.
                - Only suggest doctor if symptoms are severe or persistent.

                2. If the user asks about a medical term (HbA1c, LDL, CBC, etc.):
                - Explain what it means.
                - Give normal range.
                - Explain risks if high or low.
                - Suggest lifestyle improvements.

                3. If the user provides blood test values:
                - Compare against normal ranges.
                - Identify what is out of range.
                - Suggest diet and lifestyle improvements.
                - Advise seeing a doctor if values are dangerously abnormal.

                Rules:
                - Do NOT give prescriptions.
                - Do NOT give exact medicine dosages.
                - Keep responses clear, calm, and supportive.
                - Avoid unnecessary medical panic.
                """
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            "temperature": 0.4
        }

        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=json_data,
            timeout=30
        )

        result = response.json()

        if "choices" in result:
            reply = result["choices"][0]["message"]["content"]
        else:
            print("Groq API raw response:", result)
            reply = "Groq did not return a valid reply."

        return jsonify({"reply": reply})

    except Exception as e:
        print("Groq error:", e)
        return jsonify({"reply": "Connection failed."})

def preprocess_image(image):
    image = image.resize((224, 224))
    image = np.array(image) / 255.0
    return np.expand_dims(image, axis=0)

def calculate_bmi(weight, height):
    if weight > 0 and height > 0:
        return round(weight / ((height / 100) ** 2), 2)
    return 0

gender_map = {"Male": 0, "Female": 1}
yes_no_map = {"Yes": 1, "No": 0}

# =========================================================
# ================= TEXT EXTRACTION =======================
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

            # OCR fallback
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
# ================= SAFE VALUE EXTRACTION =================
# =========================================================

def extract_value(pattern, text, min_val=None, max_val=None):
    match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
    if match:
        try:
            value = float(match.group(1))

            # Sanity check layer
            if min_val is not None and value < min_val:
                return None
            if max_val is not None and value > max_val:
                return None

            return value
        except:
            return None
    return None


# =========================================================
# ================= CLASSIFIERS ===========================
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
        return "Low", "Possible anemia. Iron-rich diet recommended."
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
    else:
        return "High", "Consult physician."


def classify_hdl(value):
    if value is None:
        return "Not Found", ""
    if value < 40:
        return "Low", "Increase physical activity."
    return "Normal", "Protective level."


# =========================================================
# ================= BLOOD REPORT ROUTE ====================
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

    print("\n🔥 SAFE BLOOD EXTRACTION ACTIVE 🔥")
    print(processed_text[:500])

    # STRICT UNIT-BASED EXTRACTION

    vitamin_d = extract_value(
        r"25[- ]?oh vitamin d.*?(\d+\.?\d*)\s*ng",
        processed_text,
        2, 150
    )

    b12 = extract_value(
        r"vitamin b[- ]?12.*?(\d+\.?\d*)\s*pg",
        processed_text,
        50, 2000
    )

    glucose = extract_value(
        r"fasting blood sugar.*?(\d+\.?\d*)\s*mg",
        processed_text,
        40, 400
    )

    hemoglobin = extract_value(
        r"hemoglobin.*?(\d+\.?\d*)\s*g",
        processed_text,
        5, 20
    )

    ldl = extract_value(
        r"ldl cholesterol.*?(\d+\.?\d*)\s*mg",
        processed_text,
        10, 400
    )

    hdl = extract_value(
        r"hdl cholesterol.*?(\d+\.?\d*)\s*mg",
        processed_text,
        10, 150
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



# ===================== RUN APP =====================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)



