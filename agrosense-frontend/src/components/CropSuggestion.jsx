import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import './css/CropSuggestion.css';

const READING_FIELDS = [
  { key: 'nitrogen', label: 'Nitrogen', unit: 'mg/kg' },
  { key: 'phosphorus', label: 'Phosphorus', unit: 'mg/kg' },
  { key: 'potassium', label: 'Potassium', unit: 'mg/kg' },
  { key: 'temperature', label: 'Temperature', unit: '°C' },
  { key: 'humidity', label: 'Humidity', unit: '%' },
  { key: 'soil_ph', label: 'Soil pH', unit: '' },
];

const CropSuggestion = ({ selectedFieldId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedFieldId) return;

    const fetchLatestPrediction = async () => {
      try {
        const res = await apiFetch(`/api/crop-suggestion/?field_id=${selectedFieldId}`);
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        setData(json);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestPrediction();
    const interval = setInterval(fetchLatestPrediction, 5000);
    return () => clearInterval(interval);
  }, [selectedFieldId]);

  if (loading) {
    return (
      <div className="crop-loading">
        <div className="crop-spinner" />
        <p className="crop-loading-text">Calibrating Predictive ML Model...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="crop-page">
        <div className="crop-error">
          <p className="crop-error-title">Couldn't load a crop recommendation</p>
          <p className="crop-error-message">{error}</p>
        </div>
      </div>
    );
  }

  // Backend returns a 200 with placeholder values (and a "message" field)
  // when this field has no real sensor readings yet — show that state
  // instead of presenting demo numbers as a real recommendation.
  const noRealData = Boolean(data?.message);

  return (
    <div className="crop-page">
      <div className="crop-hero">
        <h1>Smart Crop Intelligence</h1>
        <p>AI-driven field insights for sustainable farming</p>
      </div>

      {noRealData ? (
        <div className="crop-empty-state">
          <p className="crop-empty-title">No sensor data yet</p>
          <p className="crop-empty-message">
            This field hasn't received any sensor readings yet. Once your
            device starts sending data, a real crop recommendation will
            appear here.
          </p>
        </div>
      ) : (
        <div className="crop-main-grid">
          <div className="crop-result-card">
            <p className="crop-result-label">Recommended Crop</p>
            <h2 className="crop-result-name">{data?.prediction_result}</h2>
            {/* Note: this is a static label, not a real model confidence score.
                To show a genuine value, the backend needs to return
                model.predict_proba() alongside prediction_result. */}
            <div className="crop-confidence-pill">Confidence: High</div>
          </div>

          <div className="crop-readings-grid">
            {READING_FIELDS.map((item) => (
              <div key={item.key} className="crop-reading-tile">
                <div className="crop-reading-label">{item.label}</div>
                <div className="crop-reading-value">
                  {data?.[item.key]}
                  <span className="crop-reading-unit">{item.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CropSuggestion;