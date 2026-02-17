import { useState, useEffect, useRef } from "react";

/* ================= HELPERS (Moved to top to prevent ReferenceErrors) ================= */
function injectWidget(mountNode) {
  const widget = document.createElement("elevenlabs-convai");
  widget.setAttribute("agent-id", "agent_7301kdmxfwzefevvktxhmjjfst9b");
  widget.style.position = "static";
  widget.style.width = "100%";
  mountNode.appendChild(widget);
}

function acknowledgeElevenLabs(mountNode) {
  if (document.getElementById("elevenlabs-script")) {
    injectWidget(mountNode);
    return;
  }

  const script = document.createElement("script");
  script.id = "elevenlabs-script";
  script.src = "https://elevenlabs.io/convai-widget/index.js";
  script.async = true;
  script.onload = () => injectWidget(mountNode);
  document.body.appendChild(script);
}

/* ================= DATA ================= */
const therapists = [
  {
    name: "Dr. A. Sharma",
    specialty: "Anxiety & Stress",
    price: 400,
    availability: "Today 6–9 PM",
  },
  {
    name: "Dr. R. Mehta",
    specialty: "Depression & Burnout",
    price: 500,
    availability: "Tomorrow 4–8 PM",
  },
];

/* ================= COMPONENTS ================= */
function VoiceBotCard() {
  const [active, setActive] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    if (containerRef.current?.children.length > 0) return;
    acknowledgeElevenLabs(containerRef.current);
  }, [active]);

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "12px", background: "white", color: "black", flex: 1 }}>
      <h2>🎧 AI Voice Companion (Free)</h2>
      <p>A judgment-free AI voice that listens and supports you emotionally.</p>
      <ul>
        <li>24/7 availability</li>
        <li>Stress & anxiety support</li>
        <li>Voice-based conversation</li>
      </ul>
      {!active && (
        <button 
          style={{ background: "#065f46", color: "white", padding: "10px 20px", border: "none", borderRadius: "8px", cursor: "pointer" }} 
          onClick={() => setActive(true)}
        >
          🎧 Talk to AI Now
        </button>
      )}
      <div ref={containerRef} style={{ marginTop: "16px", minHeight: active ? "120px" : "0" }} />
    </div>
  );
}

function TherapistCard() {
  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "12px", background: "white", color: "black", flex: 1 }}>
      <h2>🧑‍⚕️ Talk to a Real Therapist</h2>
      <p><strong>Starting at ₹400/hour (Students)</strong></p>
      {therapists.map((t, i) => (
        <div key={i} style={{ marginBottom: "1rem", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
          <p><strong>{t.name}</strong></p>
          <p>{t.specialty} | ₹{t.price}/hour</p>
          <p>{t.availability}</p>
          <button style={{ cursor: "pointer" }}>Book Session</button>
        </div>
      ))}
    </div>
  );
}

export default function MentalHealth() {
  return (
    <div style={{ padding: "2rem", color: "white" }}>
      <h1>Mental Health Support</h1>
      <p>Feeling lonely? Tired? Unheard? Feel free to let it out!</p>
      <div style={{ display: "flex", gap: "2rem", marginTop: "2rem", flexWrap: "wrap" }}>
        <VoiceBotCard />
        <TherapistCard />
      </div>
    </div>
  );
}