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

  /* ================= SAFE BACKEND CALL ================= */
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

  /* ================= SUBMIT HANDLER ================= */
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

  /* ================= PERSONALIZED HEALTH TIPS ================= */
  const getHealthTips = (result, data) => {
    if (!result) return [];

    const tips = [];

    const age = Number(data.age);
    const bmi = Number(data.bmi);
    const exercise = data.exercise;
    const smoking = data.smoking;
    const sleep = Number(data.sleep_hours);

    if (age >= 40) {
      tips.push(
        "Since you are above 40, regular health checkups and blood tests are strongly recommended."
      );
    }

    if (bmi >= 25) {
      tips.push(
        "Your BMI indicates overweight. Gradual weight loss through diet control and daily walking can reduce health risks."
      );
    } else if (bmi && bmi < 18.5) {
      tips.push(
        "Your BMI is below normal. Ensure sufficient calorie and protein intake."
      );
    }

    if (exercise === "No") {
      tips.push(
        "Lack of regular physical activity increases disease risk. Start with 20–30 minutes of walking daily."
      );
    }

    if (result.heart !== "N/A" && result.heart >= 60) {
      tips.push(
        "High heart disease risk detected. Reduce salt intake and monitor blood pressure regularly."
      );
    }

    if (result.diabetes !== "N/A" && result.diabetes >= 60) {
      tips.push(
        "High diabetes risk detected. Limit sugar intake and consider regular glucose monitoring."
      );
    }

    if (data.smoking === "Yes") {
      tips.push(
        "Smoking significantly increases lung and heart disease risk. Quitting smoking is the most effective preventive step."
      );
    }

    if (result.lung !== "N/A" && result.lung >= 50) {
      tips.push(
        "Elevated lung health risk detected. Avoid polluted environments and practice breathing exercises."
      );
    }

    if (sleep && sleep < 6) {
      tips.push(
        "Insufficient sleep increases chronic disease risk. Aim for 7–8 hours of sleep daily."
      );
    }

    tips.push(
      "These insights are for awareness only. Please consult a medical professional for diagnosis or treatment."
    );

    return tips.slice(0, 7);
  };

  /* ================= GOOGLE MAP LINKS ================= */
  const getMapLink = (query) =>
    `https://www.google.com/maps/search/${encodeURIComponent(query)}`;

  return (
    <div className="quiz-container">
      <Link to="/" className="back-link">← Back to Dashboard</Link>

      <h1 className="quiz-title">Chronic Disease Risk Questionnaire</h1>

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
                  <option key={op} value={op}>{op}</option>
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
          <p>❤️ Heart Disease Risk: <strong>{result.heart}%</strong></p>
          <p>🩸 Diabetes Risk: <strong>{result.diabetes}%</strong></p>
          <p>🫁 Lung Health Risk (Lifestyle): <strong>{result.lung}%</strong></p>

          <div style={{ marginTop: "16px" }}>
            <h4>🩺 Personalized Health Recommendations</h4>
            <ul style={{ paddingLeft: "18px", lineHeight: "1.6" }}>
              {getHealthTips(result, formData).map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>

          {/* ================= NEW LINKS ================= */}
          <div style={{ marginTop: "20px" }}>
            <h4>📍 Nearby Medical Services</h4>

            <p>
              🔬{" "}
              <a
                href={getMapLink("diagnostic centre near me")}
                target="_blank"
                rel="noopener noreferrer"
              >
                Find nearest diagnostic centre
              </a>
            </p>

            <p>
              🏥{" "}
              <a
                href={getMapLink("hospital near me")}
                target="_blank"
                rel="noopener noreferrer"
              >
                Find nearest hospital
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
