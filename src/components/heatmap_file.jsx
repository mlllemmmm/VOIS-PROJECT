import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

/* ================= HeatLayer Component ================= */
function HeatLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    // Ensure all points are numbers
    const formattedPoints = points.map(p => [Number(p[0]), Number(p[1]), Number(p[2] || 0.5)]);

    const heat = L.heatLayer(formattedPoints, {
      radius: 35,
      blur: 25,
      maxZoom: 10,
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [points, map]);

  return null;
}

/* ================= DiseaseMap Component ================= */
function DiseaseMap() {
  const [hotspots, setHotspots] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/heatmap-data")
      .then((response) => response.json())
      .then((data) => {
        console.log("Heatmap data:", data);
        setHotspots(data);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        // Fallback dummy data for development
        setHotspots([
          [37.7749, -122.4194, 0.8],
          [40.7128, -74.006, 0.6],
          [51.5074, -0.1278, 0.7],
        ]);
      });
  }, []);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#0a0a0a",
        color: "white",
      }}
    >
      {/* Background Video */}
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
          zIndex: 0,
          opacity: 0.5,
          pointerEvents: "none",
        }}
      >
        <source src="/map-bg.mp4" type="video/mp4" />
      </video>

      {/* Content Layer */}
      <div style={{ position: "relative", zIndex: 1, padding: "20px" }}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
            Aarogya AI Command Center
          </h1>
          <p style={{ opacity: 0.8 }}>Real-time Global Outbreak Monitoring</p>
        </div>

        {/* Map Container */}
        <div
          style={{
            height: "70vh",
            width: "100%",
            borderRadius: "15px",
            overflow: "hidden",
            boxShadow: "0 0 20px rgba(0,0,0,0.5)",
          }}
        >
          <MapContainer
            center={[20, 0]}
            zoom={2}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            <HeatLayer points={hotspots} />
          </MapContainer>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "10px",
          }}
        >
          <h3>Live Intelligence Summary</h3>
          <p>Currently tracking {hotspots.length} active global hotspots.</p>
        </div>
      </div>
    </div>
  );
}

export default DiseaseMap;
