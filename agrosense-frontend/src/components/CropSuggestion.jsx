import React, { useState, useEffect } from 'react';

const CropSuggestion = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestPrediction = () => {
      fetch('http://127.0.0.1:8000/api/crop-suggestion/') 
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Server returned status: ${res.status}`);
          }
          return res.json();
        })
        .then((predictionPackage) => {
          if (predictionPackage && predictionPackage.error) {
            throw new Error(predictionPackage.error);
          }
          setData(predictionPackage);
          setLoading(false);
          setError(null);
        })
        .catch((err) => {
          console.error("Error fetching ML data:", err);
          setError(err.message);
          setLoading(false);
        });
    };

    fetchLatestPrediction();
    const interval = setInterval(fetchLatestPrediction, 5000); 
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#1b5e20', fontSize: '18px', fontWeight: '500' }}>
        🔄 Processing Soil Matrix Layers & Querying ML Model Brain...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '30px', margin: '20px', background: '#ffebee', borderLeft: '5px solid #d32f2f', borderRadius: '4px', color: '#c62828' }}>
        <h3>⚠️ Connection Pipeline Restrained</h3>
        <p>Could not read real-time prediction metrics from the server database.</p>
        <small style={{ opacity: 0.9, fontWeight: 'bold' }}>Reason: {error}</small>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', background: '#fcfdfc', minHeight: '85vh' }}>
      
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)', color: 'white', padding: '24px 30px', borderRadius: '12px', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '600' }}>🌱 Machine Learning Crop Recommendation</h1>
        <p style={{ margin: '6px 0 0 0', opacity: 0.9, fontSize: '14px' }}>Real-time predictive suggestions based on your live IoT sensor arrays.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '30px' }}>
        
        {/* Main Display Box using safe optional chaining '?.' */}
        <div style={{ background: '#ffffff', padding: '35px 25px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #e8f5e9', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '700' }}>Optimal Crop Choice</span>
          
          <h2 style={{ fontSize: '42px', color: '#1b5e20', margin: '20px 0', fontWeight: '700', textTransform: 'capitalize' }}>
            {data?.prediction_result || "Analyzing..."}
          </h2>
          
          <div style={{ background: '#e8f5e9', color: '#1b5e20', padding: '8px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', display: 'inline-block' }}>
            ✨ Parameter Match Verified
          </div>
        </div>

        {/* Environmental Matrix Card using safe optional chaining '?.' */}
        <div style={{ background: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #eaf0eb' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50', fontSize: '18px', fontWeight: '600' }}>Active Analysis Telemetry Matrix</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ borderBottom: '1px solid #f0f4f1', paddingBottom: '12px' }}>🍂 Nitrogen (N): <strong style={{ color: '#2e7d32', float: 'right' }}>{data?.nitrogen ?? '--'} mg/kg</strong></div>
            <div style={{ borderBottom: '1px solid #f0f4f1', paddingBottom: '12px' }}>🌾 Phosphorus (P): <strong style={{ color: '#2e7d32', float: 'right' }}>{data?.phosphorus ?? '--'} mg/kg</strong></div>
            <div style={{ borderBottom: '1px solid #f0f4f1', paddingBottom: '12px' }}>🪵 Potassium (K): <strong style={{ color: '#2e7d32', float: 'right' }}>{data?.potassium ?? '--'} mg/kg</strong></div>
            <div style={{ borderBottom: '1px solid #f0f4f1', paddingBottom: '12px' }}>🌡️ Temperature: <strong style={{ color: '#2e7d32', float: 'right' }}>{data?.temperature ?? '--'} °C</strong></div>
            <div style={{ borderBottom: '1px solid #f0f4f1', paddingBottom: '12px' }}>💧 Humidity: <strong style={{ color: '#2e7d32', float: 'right' }}>{data?.humidity ?? '--'} %</strong></div>
            <div style={{ borderBottom: '1px solid #f0f4f1', paddingBottom: '12px' }}>🧪 Soil pH Balance: <strong style={{ color: '#2e7d32', float: 'right' }}>{data?.soil_ph ?? '--'}</strong></div>
            
            {/* 🟢 NEW SOIL MOISTURE DISPLAY COMPONENT */}
            <div style={{ borderBottom: '1px solid #f0f4f1', paddingBottom: '12px' }}>🔹 Soil Moisture: <strong style={{ color: '#2e7d32', float: 'right' }}>{data?.soil_moisture ?? '--'} %</strong></div>
          </div>

          <div style={{ color: '#999', fontSize: '12px', marginTop: '25px', textAlign: 'right', fontStyle: 'italic' }}>
            Last updated: {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : '--'}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CropSuggestion;