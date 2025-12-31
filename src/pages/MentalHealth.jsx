import { useState, useEffect, useRef } from "react";

/* ================= DUMMY THERAPIST DATA ================= */
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

/* ================= MAIN PAGE ================= */
export default function MentalHealth() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Mental Health Support</h1>
      <p>Feeling lonely? Tired? Unheard? Feel free to let it out!</p>

      <div style={{ display: "flex", gap: "2rem", marginTop: "2rem" }}>
        <VoiceBotCard />
        <TherapistCard />
      </div>
    </div>
  );
}

/* ================= VOICE BOT CARD ================= */
function VoiceBotCard() {
  const [active, setActive] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    // Prevent multiple injections
    if (containerRef.current?.children.length > 0) return;

    // Load script dynamically
    acknowledgeElevenLabs(containerRef.current);
  }, [active]);

  return (
    <div className="card" style={{ position: "relative" }}>
      <h2>🎧 AI Voice Companion (Free)</h2>
      <p>A judgment-free AI voice that listens and supports you emotionally.</p>

      <ul>
        <li>24/7 availability</li>
        <li>Stress & anxiety support</li>
        <li>Voice-based conversation</li>
        <li>Completely free</li>
      </ul>

      {!active && (
        <button className="btn-primary" onClick={() => setActive(true)}>
          🎧 Talk to AI Now
        </button>
      )}

      {/* Widget container */}
      <div
        ref={containerRef}
        style={{
          marginTop: "16px",
          minHeight: active ? "120px" : "0",
        }}
      />
    </div>
  );
}

/* ================= ELEVENLABS LOADER ================= */
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

function injectWidget(mountNode) {
  const widget = document.createElement("elevenlabs-convai");
  widget.setAttribute("agent-id", "agent_7301kdmxfwzefevvktxhmjjfst9b");

  // VERY IMPORTANT: disable floating behavior
  widget.style.position = "static";
  widget.style.width = "100%";

  mountNode.appendChild(widget);
}

/* ================= THERAPIST CARD ================= */
function TherapistCard() {
  return (
    <div className="card">
      <h2>🧑‍⚕️ Talk to a Real Therapist</h2>
      <p><strong>Starting at ₹400/hour (Students)</strong></p>

      {therapists.map((t, i) => (
        <div key={i} style={{ marginBottom: "1rem" }}>
          <p><strong>{t.name}</strong></p>
          <p>{t.specialty}</p>
          <p>₹{t.price}/hour</p>
          <p>{t.availability}</p>
          <button>Book Session</button>
        </div>
      ))}
    </div>
  );
}
