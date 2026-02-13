import { Link } from "react-router-dom";
import { useState } from "react";
import "./../styles/quiz.css";
import questions from "./questions";

const API_BASE = "http://127.0.0.1:5000";

export default function Quiz() {
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const safeFetch = async (url) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      throw new Error("API failed");
    }

    return res.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const responses = await Promise.allSettled([
        safeFetch(`${API_BASE}/predict/heart`),
        safeFetch(`${API_BASE}/predict/diabetes`),
        safeFetch(`${API_BASE}/predict/lung-risk`),
      ]);

      const [heartRes, diabetesRes, lungRes] = responses;

      setResult({
        heart:
          heartRes.status === "fulfilled"
            ? heartRes.value.risk_percentage
            : "N/A",

        diabetes:
          diabetesRes.status === "fulfilled"
            ? diabetesRes.value.risk_percentage
            : "N/A",

        lung:
          lungRes.status === "fulfilled"
            ? lungRes.value.risk_percentage
            : "N/A",
      });
    } catch (err) {
      console.error(err);
      setError("Unable to process your data right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

const calculateBMI = (data) => {
  const height = Number(data.height_cm);
  const weight = Number(data.weight_kg);

  if (!height || !weight) return null;

  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  return bmi.toFixed(1);
};



const getHealthTips = (result, data) => {
  if (!result) return [];

  const tips = [];

  const age = Number(data.age);

  let bmi = Number(data.bmi);
  if (!bmi) {
    const calculated = calculateBMI(data);
    bmi = calculated ? Number(calculated) : null;
  }

  const exercise = data.Exercise;
  const smoking = data.Smoking_History;
  const alcohol = data.Alcohol_Consumption;

  const heartRisk = Number(result.heart);
  const diabetesRisk = Number(result.diabetes);
  const lungRisk = Number(result.lung);

  /* ================= AGE + HIGH RISK ================= */

  if (age >= 60 && (heartRisk >= 60 || diabetesRisk >= 60)) {
    tips.push(
      "Considering your age and elevated risk levels, a comprehensive health evaluation is strongly recommended."
    );
  }

  /* ================= BMI PERSONALIZATION ================= */

  if (bmi >= 30) {
    tips.push(
      "Your BMI indicates obesity. A structured weight management program with medical supervision is advised."
    );
  } else if (bmi >= 25) {
    tips.push(
      "You are overweight. Even modest weight loss can significantly reduce cardiovascular and diabetes risk."
    );
  } else if (bmi && bmi < 18.5) {
    tips.push(
      "Your BMI is below normal. Consider nutritional optimization and professional dietary guidance."
    );
  }

  /* ================= HEART ================= */

  if (heartRisk >= 75) {
    tips.push(
      "High heart disease risk detected. Schedule cardiac screening and monitor blood pressure regularly."
    );
  } else if (heartRisk >= 60) {
    tips.push(
      "Moderate heart risk. Reduce salt intake and incorporate regular aerobic activity."
    );
  }

  /* ================= DIABETES ================= */

  if (diabetesRisk >= 75) {
    tips.push(
      "High diabetes risk detected. Immediate blood glucose testing and dietary intervention are advised."
    );
  } else if (diabetesRisk >= 60) {
    tips.push(
      "Elevated diabetes risk. Reduce refined carbohydrates and increase physical activity."
    );
  }

  /* ================= LUNG ================= */

  if (lungRisk >= 70) {
    tips.push(
      "Elevated lung health risk. Avoid pollutants and consider respiratory evaluation."
    );
  }

  if (smoking === "Current") {
    tips.push(
      "Active smoking significantly increases lung and heart risk. Smoking cessation is strongly recommended."
    );
  }

  /* ================= LIFESTYLE ================= */

  if (exercise === "No") {
    tips.push(
      "Regular physical activity (30 minutes daily) can significantly reduce chronic disease risk."
    );
  }

  if (alcohol === "Frequently") {
    tips.push(
      "Frequent alcohol consumption increases cardiovascular and metabolic risk. Consider moderation."
    );
  }

  /* ================= MULTI-RISK ESCALATION ================= */

  if (heartRisk >= 70 && diabetesRisk >= 70) {
    tips.push(
      "Multiple elevated risk indicators detected. A full preventive health consultation is recommended."
    );
  }

  /* ================= LOW RISK POSITIVE ================= */

  if (heartRisk < 40 && diabetesRisk < 40 && lungRisk < 40) {
    tips.push(
      "Your current risk levels appear low. Maintain your healthy habits to sustain long-term wellbeing."
    );
  }

  tips.push(
    "These insights are for educational purposes only and do not replace professional medical diagnosis."
  );

  return tips.slice(0, 8);
};



  const getMapLink = (query) =>
    `https://www.google.com/maps/search/${encodeURIComponent(query)}`;

  return (
    <div className="quiz-wrapper">
      <div className="quiz-container">
        <Link to="/" className="back-link">
          ← Back to Dashboard
        </Link>

        <h1 className="quiz-title">
          Chronic Disease Risk Questionnaire
        </h1>

        <form className="quiz-form" onSubmit={handleSubmit}>
          {questions.map((q) => (
            <div key={q.id} className="quiz-field">
              <label>{q.label}</label>

              {q.type === "select" ? (
                <select
                  value={formData[q.id] || ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                >
                  <option value="">Select</option>
                  {q.options.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData[q.id] || ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  onWheel={(e) => e.target.blur()}
                />
              )}
            </div>
          ))}

          <button className="submit-btn" disabled={loading}>
            {loading ? "Analyzing..." : "Submit Questionnaire"}
          </button>
        </form>

        {error && (
          <div className="result-box error">
            <p>⚠️ {error}</p>
          </div>
        )}

        {result && (
          <div className="result-box">
            <div className="risk-results">
              <div className="risk-card">
                ❤️
                <span>Heart Disease Risk</span>
                <strong>{result.heart}%</strong>
              </div>

              <div className="risk-card">
                🩸
                <span>Diabetes Risk</span>
                <strong>{result.diabetes}%</strong>
              </div>

              <div className="risk-card">
                🫁
                <span>Lung Health Risk</span>
                <strong>{result.lung}%</strong>
              </div>
            </div>

            <div className="tips-section">
              <h4>🩺 Personalized Health Recommendations</h4>
              <ul>
                {getHealthTips(result, formData).map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>

            <div className="nearby-section">
              <h4>📍 Nearby Medical Services</h4>

              <a
                href={getMapLink("diagnostic centre near me")}
                target="_blank"
                rel="noopener noreferrer"
                className="map-link"
              >
                🔬 Find nearest diagnostic centre
              </a>

              <a
                href={getMapLink("hospital near me")}
                target="_blank"
                rel="noopener noreferrer"
                className="map-link"
              >
                🏥 Find nearest hospital
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
