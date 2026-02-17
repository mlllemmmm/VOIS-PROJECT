import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

function HeatmapLayerComponent({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    const heatLayer = L.heatLayer(points, {
      radius: 35,
      blur: 25,
      maxZoom: 10,
      minOpacity: 0.4,
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [points, map]);

  return null;
}

function DiseaseMap() {
  const [hotspots, setHotspots] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/heatmap-data')
      .then(response => response.json())
      .then(data => {
        console.log("Data received:", data);
        setHotspots(data);
      })
      .catch(err => console.error("Fetch error:", err));
  }, []);

  return (
    <div style={{ 
      position: 'relative', 
      minHeight: "100vh", 
      width: "100%", 
      backgroundColor: '#0a0a0a',
      color: 'white'
    }}>
      
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 0,
          opacity: 0.5,
          pointerEvents: 'none'
        }}
      >
        <source src="/map-bg.mp4" type="video/mp4" />
      </video>

      <div style={{ position: 'relative', zIndex: 1, padding: '20px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
            Aarogya AI Command Center
          </h1>
          <p style={{ opacity: 0.8 }}>
            Real-time Global Outbreak Monitoring
          </p>
        </div>

        <div style={{ 
          height: "70vh",
          width: "100%", 
          borderRadius: '15px', 
          overflow: 'hidden',
          boxShadow: '0 0 20px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <MapContainer 
            center={[20, 0]} 
            zoom={2} 
            style={{ 
              height: "100%", 
              width: "100%", 
              background: 'transparent'
            }}
          >
            <TileLayer 
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
              attribution='&copy; OpenStreetMap contributors'
            />

            {hotspots.length > 0 && (
              <HeatmapLayerComponent points={hotspots} />
            )}
          </MapContainer>
        </div>

        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          background: 'rgba(255,255,255,0.05)', 
          borderRadius: '10px' 
        }}>
          <h3>Live Intelligence Summary</h3>
          <p>
            Currently tracking {hotspots.length} active global hotspots.
          </p>
        </div>
      </div>
    </div>
  );
}

export default DiseaseMap;
