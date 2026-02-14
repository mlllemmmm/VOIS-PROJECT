import { useLocation } from "react-router-dom";
import React, { useState, useRef } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Quiz from "./components/Quiz";
import "./styles/quiz.css";
import MentalHealth from "./pages/MentalHealth";
import { useLanguage } from "./LanguageContext";
import ChatPage from "./pages/ChatPage";
import DiseaseMap from "./components/heatmap_file";


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
        <Link to="/map">Outbreak Map</Link>
        <Link to="/risk">{t("navbar.risk")}</Link>
        <Link to="/mental-health">{t("navbar.mentalHealth")}</Link>
        <Link to="/blood-test">Blood Test Analysis</Link>
        <Link to="/chat">AI Assistant</Link>

        <Link to="/login" className="btn">
          Login
        </Link>

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

function HomePage() {
  const { t } = useLanguage();

  return (
    <>
      {/* ================= HERO SECTION ================= */}
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
            <h1 className="hero-title">{t("hero.title")}</h1>

            <div className="project-desc-container">
              <p className="project-desc">{t("hero.description")}</p>
            </div>

            <p className="hero-builtfor">{t("hero.builtFor")}</p>
          </div>
        </div>

        {/* ================= FEATURES ================= */}
        <div className="features info-cards">
          {[
            "xray",
            "risk",
            "chatbot",
            "bloodTest",
            "voice",
          ].map((feature) => (
            <div key={feature} className="feature-card">
              <h3>{t(`features.${feature}.title`)}</h3>
              <ul style={{ marginTop: "8px", paddingLeft: "18px" }}>
                {t(`features.${feature}.points`).map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ================= ABOUT SECTION ================= */}
      <section className="about-section">
        <div className="about-wrapper">
          <div className="about-left">
            <h2>About Aarogya AI</h2>
            <p>
              Aarogya AI is an AI-powered preventive healthcare platform built
              to make early health screening accessible, affordable, and
              intelligent.
            </p>
            <p>
              Our platform integrates X-ray analysis, blood test interpretation,
              chronic disease risk detection, and AI-based health guidance.
            </p>
            <p>
              We aim to bridge healthcare gaps in underserved communities.
            </p>
          </div>

          <div className="about-right">
            <h2>Our Mission & Vision</h2>
            <p>
              Our mission is to reduce delayed diagnosis through AI-powered
              early screening tools.
            </p>
            <p>
              We envision AI supporting doctors and democratizing health
              intelligence access.
            </p>
            <p>
              Aarogya AI supports — not replaces — medical professionals.
            </p>
          </div>
        </div>
      

      {/* ================= FOOTER ================= */}
      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h2>Aarogya AI</h2>
            <p>
              AI-powered preventive healthcare platform focused on early
              detection and intelligent screening.
            </p>
          </div>

          <div className="footer-column">
            <h4>Company</h4>
            <p>About Us</p>
            <p>Careers</p>
            <p>Contact</p>
          </div>

          <div className="footer-column">
            <h4>Resources</h4>
            <p>FAQs</p>
            <p>Privacy Policy</p>
            <p>Terms of Use</p>
          </div>

          <div className="footer-column">
            <h4>Contact</h4>
            <p>Email: support@aarogyaai.com</p>
            <p>Phone: +91-XXXXXXXXXX</p>
            <p>India</p>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 Aarogya AI. All rights reserved.
        </div>
      </footer>
      </section>
    </>
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




/* ================= RISK PAGE ================= */
function RiskPage() {
  return (
    <div className="page-container">
      <Quiz />
    </div>
  );
}
/* ================= BLOOD REPORT PAGE ================= */
function BloodTestPage() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!file) return alert("Please upload a PDF");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:5000/analyze-blood-report", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setResult(data);
    } catch {
      alert("Backend connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h2>Blood Report Analysis</h2>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button className="btn" onClick={handleAnalyze}>
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {result && (
        <div style={{ marginTop: "30px" }}>
          {Object.keys(result).map((key) => (
            <div
              key={key}
              style={{
                marginBottom: "15px",
                padding: "15px",
                border: "1px solid #334155",
                borderRadius: "10px",
              }}
            >
              <h4>{key}</h4>
              <p>Value: {result[key].value}</p>
              <p>Status: {result[key].status}</p>
              <p>Suggestion: {result[key].suggestion}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= MAP PAGE ================= */
function MapPage() {
  return (
    <div className="page-container">
      <h2 style={{ marginBottom: "20px" }}>Live Disease Outbreak Surveillance</h2>
      <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #334155" }}>
        <DiseaseMap />
      </div>
    </div>
  );
}

/* ================= APP ROOT ================= */
function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div style={{ position: "relative", width: "100%", minHeight: "100vh" }}>
      {isHomePage && (
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            objectFit: "cover",
            zIndex: -1,
            opacity: 0.85,
            pointerEvents: "none"
          }}
        >
          <source src="/home-bg.mp4" type="video/mp4" />
        </video>
      )}

      <div style={{ position: "relative", zIndex: 1, width: "100%", padding: "0 20px" }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/xray" element={<XrayPage />} />
          <Route path="/risk" element={<RiskPage />} />
          <Route path="/mental-health" element={<MentalHealth />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/blood-test" element={<BloodTestPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
