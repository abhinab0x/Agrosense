import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import SoilHealthScore from './SoilHealthScore'; 

function History({ selectedFieldId }) {
  const [latestRecord, setLatestRecord] = useState(null);
  const [cropData, setCropData] = useState(null);
  const [fertilizerData, setFertilizerData] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedFieldId) return;

    setLoading(true);
    setError(null);

    const fetchAllDashboardData = async () => {
      try {
        // 1. Fetch live telemetry data
        const telemetryRes = await apiFetch(`/api/sensors/?field_id=${selectedFieldId}`);
        if (!telemetryRes.ok) throw new Error('Failed to fetch telemetry streams.');
        const telemetryData = await telemetryRes.json();

        if (telemetryData && telemetryData.length > 0) {
          const record = telemetryData[0];
          setLatestRecord(record);

          // 25 second difference between online and offline data
          const recordTime = new Date(record.timestamp).getTime();
          const currentTime = new Date().getTime();
          const isRecent = (currentTime - recordTime) < 25000; 
          setIsOnline(isRecent);
        } else {
          setLatestRecord(null);
          setIsOnline(false);
        }

        //  Fetch ML Crop Prediction
        const cropRes = await apiFetch(`/api/crop-suggestion/?field_id=${selectedFieldId}`);
        if (cropRes.ok) {
          const cropJson = await cropRes.json();
          setCropData(cropJson.message ? null : cropJson);
        }

        //  Fetch AI Fertilizer Suggestion
        const fertRes = await apiFetch(`/api/fertilizer/recommend/?field_id=${selectedFieldId}`);
        if (fertRes.ok) {
          const fertJson = await fertRes.json();
          setFertilizerData(fertJson);
        }

      } catch (err) {
        console.error('Unified Dashboard Sync Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDashboardData();
    const interval = setInterval(fetchAllDashboardData, 5000);
    return () => clearInterval(interval);
  }, [selectedFieldId]);

  //  Live Advisory Recommendations based on thresholds
  const generateAdvisories = (record) => {
    if (!record) return [];
    const tips = [];
    if (record.soil_moisture < 40) tips.push({ type: 'warning', text: '💧 Moisture is running critically dry. Initiate drip sequencing.' });
    if (record.soil_moisture > 65) tips.push({ type: 'danger', text: '⚠️ Heavy saturation detected. Pause active water feeds.' });
    if (record.soil_ph < 6.0) tips.push({ type: 'info', text: '🧪 Acidic profile. Consider introducing fine agricultural lime carbonate.' });
    if (record.nitrogen < 35) tips.push({ type: 'warning', text: '🌱 Low Nitrogen. Top dressing with standard nitrogenous feeds recommended.' });
    return tips;
  };

  if (!selectedFieldId) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        ⚠️ Please select a field workspace from the dropdown to view telemetry.
      </div>
    );
  }

  const advisories = generateAdvisories(latestRecord);

  return (
    <div className="live-view-container" style={{ padding: '20px' }}>
      
      {/* Dynamic Status Header */}
      <div className="live-view-header" style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 className="live-view-title" style={{ margin: '0 0 4px 0', color: '#1e293b' }}>
            Node Telemetry Status
          </h2>
          <p className="live-view-subtitle" style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Display Status:{' '}
            <span style={{ color: isOnline ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
              {isOnline ? '● Online / Displaying Live Data' : '○ Offline / Displaying Last Logged'}
            </span>
          </p>
        </div>

        {/* 🏆 YOUR DONUT CHART COMPONENT: Placed right up top in the header flex box */}
        {latestRecord && (
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '15px 20px' }}>
            <SoilHealthScore latestData={latestRecord} />
          </div>
        )}
      </div>

      {loading && !latestRecord ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Querying hardware registry...</div>
      ) : error ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>⚠️ Error: {error}</div>
      ) : !latestRecord ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
          No data has ever been recorded for this device. Turn on your ESP32 node to begin streaming.
        </div>
      ) : (
        <div>
          {/* Timestamp Indicator */}
          <div style={{ marginBottom: '20px', fontSize: '13px', color: '#475569', background: '#f1f5f9', padding: '10px 14px', borderRadius: '6px', display: 'inline-block', fontWeight: '500' }}>
            📅 **Last Reading Recorded At:** {new Date(latestRecord.timestamp).toLocaleString()}
          </div>

          {/* Metric Dashboard Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            
            {/* 1. RECOMMENDED CROP */}
            <div style={{ padding: '20px', background: '#f0fdfa', borderRadius: '12px', border: '1px solid #ccfbf1' }}>
              <span style={{ fontSize: '11px', color: '#0d9488', fontWeight: '600', display: 'block', letterSpacing: '0.5px' }}>🌾 RECOMMENDED CROP</span>
              <strong style={{ fontSize: '24px', color: '#0f766e', display: 'block', marginTop: '6px', textTransform: 'capitalize' }}>
                {cropData ? cropData.prediction_result : 'Analyzing...'}
              </strong>
            </div>

            {/* 2. RECOMMENDED FERTILIZER */}
            <div style={{ padding: '20px', background: '#fdf4ff', borderRadius: '12px', border: '1px solid #f5d0fe' }}>
              <span style={{ fontSize: '11px', color: '#a21caf', fontWeight: '600', display: 'block', letterSpacing: '0.5px' }}>🧪 RECOMMENDED FERTILIZER</span>
              <strong style={{ fontSize: '24px', color: '#701a75', display: 'block', marginTop: '6px' }}>
                {fertilizerData ? fertilizerData.recommendation : 'Calculating...'}
              </strong>
            </div>

            {/* 3. SOIL MOISTURE */}
            <div style={{ padding: '20px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
              <span style={{ fontSize: '11px', color: '#1e40af', fontWeight: '600', display: 'block', letterSpacing: '0.5px' }}>💧 SOIL MOISTURE</span>
              <strong style={{ fontSize: '24px', color: '#2563eb', display: 'block', marginTop: '6px' }}>{latestRecord.soil_moisture}%</strong>
            </div>

            {/* 4. TEMPERATURE */}
            <div style={{ padding: '20px', background: '#fff7ed', borderRadius: '12px', border: '1px solid #ffedd5' }}>
              <span style={{ fontSize: '11px', color: '#9a3412', fontWeight: '600', display: 'block', letterSpacing: '0.5px' }}>🌡️ TEMPERATURE</span>
              <strong style={{ fontSize: '24px', color: '#ea580c', display: 'block', marginTop: '6px' }}>{latestRecord.temperature}°C</strong>
            </div>

            {/* 5. AIR HUMIDITY */}
            <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #dcfce7' }}>
              <span style={{ fontSize: '11px', color: '#166534', fontWeight: '600', display: 'block', letterSpacing: '0.5px' }}>💨 AIR HUMIDITY</span>
              <strong style={{ fontSize: '24px', color: '#16a34a', display: 'block', marginTop: '6px' }}>{latestRecord.humidity}%</strong>
            </div>

            {/* 6. SOIL PH */}
            <div style={{ padding: '20px', background: '#faf5ff', borderRadius: '12px', border: '1px solid #f3e8ff' }}>
              <span style={{ fontSize: '11px', color: '#6b21a8', fontWeight: '600', display: 'block', letterSpacing: '0.5px' }}>🧪 SOIL PH</span>
              <strong style={{ fontSize: '24px', color: '#7c3aed', display: 'block', marginTop: '4px' }}>{latestRecord.soil_ph}</strong>
            </div>

          </div>

          {/* NPK Summary Section */}
          <div style={{ marginTop: '16px', padding: '20px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '13px', color: '#334155', fontWeight: '700', display: 'block', marginBottom: '12px' }}>🌱 NPK NUTRIENTS MATRIX</span>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ background: '#f0fdf4', color: '#166534', padding: '6px 12px', borderRadius: '6px', fontSize: '14px', fontWeight: '600' }}>Nitrogen (N): {latestRecord.nitrogen} mg/kg</span>
              <span style={{ background: '#f0fdf4', color: '#166534', padding: '6px 12px', borderRadius: '6px', fontSize: '14px', fontWeight: '600' }}>Phosphorus (P): {latestRecord.phosphorus} mg/kg</span>
              <span style={{ background: '#eff6ff', color: '#1e40af', padding: '6px 12px', borderRadius: '6px', fontSize: '14px', fontWeight: '600' }}>Potassium (K): {latestRecord.potassium} mg/kg</span>
            </div>
          </div>

          {/* RECOMMENDATIONS ADVISORY PANEL */}
          {advisories.length > 0 && (
            <div style={{ marginTop: '16px', padding: '20px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fef3c7' }}>
              <span style={{ fontSize: '13px', color: '#92400e', fontWeight: '700', display: 'block', marginBottom: '12px' }}>💡 LIVE ACTIONABLE RECOMMENDATIONS</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {advisories.map((tip, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      padding: '10px 14px', 
                      borderRadius: '8px', 
                      fontSize: '14px', 
                      fontWeight: '500',
                      background: '#ffffff',
                      borderLeft: '4px solid',
                      borderColor: tip.type === 'warning' ? '#f59e0b' : tip.type === 'danger' ? '#ef4444' : '#3b82f6',
                      color: '#334155'
                    }}
                  >
                    {tip.text}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default History;