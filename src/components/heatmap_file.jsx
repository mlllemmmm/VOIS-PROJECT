import React, { useEffect, useState } from 'react';

import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; 
import { HeatmapLayer } from "react-leaflet-heatmap-layer-v3";

function DiseaseMap() {
  const [hotspots, setHotspots] = useState([]);

  useEffect(() => {
    // Note: Make sure your Flask backend is running on port 5000
    fetch('http://localhost:5000/api/heatmap-data') 
      .then(response => response.json())
      .then(data => {
        console.log("Data received:", data);
        setHotspots(data);
      })
      .catch(err => console.error("Fetch error:", err));
  }, []);
  return (
  /* 1. Main Page Wrapper */
  <div style={{ 
    position: 'relative', 
    minHeight: "100vh", 
    width: "100%", 
    backgroundColor: '#0a0a0a', // Deep dark background
    color: 'white'
  }}>
    
    {/* 2. Global Video Background (Covers Whole Page) */}
    <video
      autoPlay
      loop
      muted
      playsInline
      style={{
        position: 'fixed', // Fixed ensures it stays put while you scroll
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        objectFit: 'cover',
        zIndex: 0,         // Behind everything
        opacity: 0.5,      // Your requested translucency
        pointerEvents: 'none'
      }}
    >
      <source src="/map-bg.mp4" type="video/mp4" />
    </video>

    {/* 3. Content Layer (Header, Text, Map, etc.) */}
    <div style={{ position: 'relative', zIndex: 1, padding: '20px' }}>
      
      {/* Example Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Aarogya AI Command Center</h1>
        <p style={{ opacity: 0.8 }}>Real-time Global Outbreak Monitoring</p>
      </div>

      {/* 4. The Map Container Section */}
      <div style={{ 
        height: "70vh", // Map takes up 70% of screen height
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
            background: 'transparent' // Allows video to show through map tiles
          }}
        >
          {/* Dark Tiles look best with a video background */}
          <TileLayer 
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
            attribution='&copy; OpenStreetMap contributors'
          />
          
          {hotspots.length > 0 && (
            <HeatmapLayer
              points={hotspots}
              latitudeExtractor={(m) => m[0]} 
              longitudeExtractor={(m) => m[1]}
              intensityExtractor={(m) => m[2]}
              radius={35}         
              max={1.0}           
              minOpacity={0.4}    
            />
          )}
        </MapContainer>
      </div>

      {/* Example Data Footer */}
      <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
         <h3>Live Intelligence Summary</h3>
         <p>Currently tracking {hotspots.length} active global hotspots.</p>
      </div>
    </div>
  </div>
);
}
export default DiseaseMap;