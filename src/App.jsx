import React, { useState, useRef } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Quiz from "./components/Quiz";
import "./styles/quiz.css";
import cutuImg from "./assets/cutu.png";
import MentalHealth from "./pages/MentalHealth";
import { useLanguage } from "./LanguageContext";
import ChatPage from "./pages/ChatPage";   // ✅ keep this

/* ================= NAVBAR ================= */
function Navbar() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        Aarogya AI
      </Link>

      <div className="nav-links">
        <Link to="/">{t("navbar.home")}</Link>
        <Link to="/xray">{t("navbar.xray")}</Link>
        <Link to="/risk">{t("navbar.risk")}</Link>
        <Link to="/mental-health">{t("navbar.mentalHealth")}</Link>

        {/* ✅ NEW CHAT PAGE LINK */}
        <Link to="/chat">AI Assistant</Link>

        {/* LOGIN BUTTON */}
        <Link to="/login" className="btn">
          Login
        </Link>

        {/* LANGUAGE DROPDOWN */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            marginLeft: "12px",
            padding: "6px 8px",
            borderRadius: "6px",
            background: "#f0fdf4",
            color: "#065f46",
            border: "1px solid #bbf7d0",
            cursor: "pointer",
          }}
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="mr">Marathi</option>
          <option value="bn">Bengali</option>
          <option value="te">Telugu</option>
          <option value="ta">Tamil</option>
        </select>
      </div>
    </nav>
  );
}

/* ================= HOME PAGE ================= */
function HomePage() {
  const { t } = useLanguage();

  return (
    <section className="hero">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: "250px" }}>
          <h1>{t("hero.title")}</h1>

          <div className="project-desc-container">
            <p className="project-desc">{t("hero.description")}</p>
            <div className="hackathon-badge">{t("hero.badge")}</div>
          </div>

          <p
            style={{
              color: "#059669",
              marginTop: "10px",
              fontWeight: "500",
            }}
          >
            {t("hero.builtFor")}
          </p>
        </div>

        <div style={{ flex: 1, minWidth: "200px", textAlign: "center" }}>
          <img
            src={cutuImg}
            alt="Health Illustration"
            style={{
              width: "70%",
              maxWidth: "280px",
              borderRadius: "12px",
            }}
          />
        </div>
      </div>

      <div className="features info-cards">
        <div className="feature-card">
          <span className="feature-icon">🩻</span>
          <h3>{t("features.xray.title")}</h3>
          <p>{t("features.xray.description")}</p>
        </div>

        <div className="feature-card">
          <span className="feature-icon">📊</span>
          <h3>{t("features.risk.title")}</h3>
          <p>{t("features.risk.description")}</p>
        </div>

        <div className="feature-card">
          <span className="feature-icon">💬</span>
          <h3>{t("features.chatbot.title")}</h3>
          <p>{t("features.chatbot.description")}</p>
        </div>

        <div className="feature-card">
          <span className="feature-icon">🎧</span>
          <h3>AI Voice Companion</h3>
          <ul style={{ marginTop: "8px", paddingLeft: "18px" }}>
            <li>24/7 emotional support</li>
            <li>Judgment-free conversations</li>
            <li>Voice-based AI companion</li>
            <li>Available in Mental Health section</li>
          </ul>
        </div>
      </div>

      {/* ❌ HealthChat removed from HomePage */}
    </section>
  );
}

/* ================= XRAY PAGE ================= */
function XrayPage() {
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  const getEndpoint = () => {
    if (selectedArea === "Lungs") return "/predict/xray/lung";
    if (selectedArea === "Bones") return "/predict/xray/bones";
    if (selectedArea === "Kidney") return "/predict/xray/kidney";
    return null;
  };

  const handlePredict = async () => {
    if (!selectedFile || !selectedArea) return;

    const endpoint = getEndpoint();
    if (!endpoint) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);
      setResult(null);

      const response = await fetch(`http://127.0.0.1:5000${endpoint}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      let assessment, color;
      if (data.confidence >= 0.75) {
        assessment = "High likelihood of abnormality detected";
        color = "#dc2626";
      } else if (data.confidence >= 0.4) {
        assessment = "Inconclusive — further evaluation recommended";
        color = "#ca8a04";
      } else {
        assessment = "No significant abnormality detected";
        color = "#059669";
      }

      setResult({ confidence: data.confidence, assessment, color });
    } catch {
      alert("Backend connection failed. Is Flask running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="xray-container">
      <h2>X-Ray Upload</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {["Kidney", "Lungs", "Bones"].map((area) => (
          <button
            key={area}
            className={`btn ${selectedArea === area ? "btn-active" : ""}`}
            onClick={() => {
              setSelectedArea(area);
              setSelectedFile(null);
              setResult(null);
            }}
          >
            {area}
          </button>
        ))}
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        hidden
        onChange={(e) => setSelectedFile(e.target.files[0])}
      />

      <button className="btn" onClick={() => fileInputRef.current.click()}>
        Select X-Ray Image
      </button>

      {selectedFile && <p>{selectedFile.name}</p>}

      <button
        className="btn"
        disabled={!selectedFile || !selectedArea || loading}
        onClick={handlePredict}
      >
        {loading ? "Scanning..." : "Scan X-Ray"}
      </button>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <p style={{ color: result.color }}>
            <b>Assessment:</b> {result.assessment}
          </p>
          <p>
            <b>Confidence:</b> {(result.confidence * 100).toFixed(2)}%
          </p>
        </div>
      )}
    </div>
  );
}

/* ================= LOGIN PAGE ================= */
function LoginPage() {
  return (
    <div className="quiz-container">
      <h2>Login</h2>
      <p>Login functionality coming soon.</p>
    </div>
  );
}

/* ================= RISK PAGE ================= */
function RiskPage() {
  return (
    <div className="page-container">
      <Quiz />
    </div>
  );
}

/* ================= APP ROOT ================= */
export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/xray" element={<XrayPage />} />
        <Route path="/risk" element={<RiskPage />} />
        <Route path="/mental-health" element={<MentalHealth />} />
        <Route path="/chat" element={<ChatPage />} />  {/* ✅ NEW ROUTE */}
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
