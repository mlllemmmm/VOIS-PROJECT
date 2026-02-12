from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tensorflow as tf
import numpy as np
from PIL import Image
import requests
from joblib import load
import pandas as pd

from flask import Flask, request, jsonify
from openai import OpenAI

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
    os.path.join(BASE_DIR, "models", "kidney_model.keras")
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

    image = Image.open(request.files["file"]).convert("RGB")
    img = preprocess_image(image)
    confidence = float(np.max(kidney_model.predict(img)))

    return jsonify({"confidence": confidence})

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


# ===================== RUN APP =====================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)



