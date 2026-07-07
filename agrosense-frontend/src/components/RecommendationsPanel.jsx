import React, { useEffect, useState } from 'react';

const API = 'http://127.0.0.1:8000';

function authHeaders() {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function RecommendationsPanel({ latestData, selectedFieldId }) {
  const [crop, setCrop] = useState(null);
  const [fertilizer, setFertilizer] = useState(null);
  const [irrigation, setIrrigation] = useState(null);

  const {
    nitrogen, phosphorus, potassium,
    temperature, humidity, soil_ph, soil_moisture,
  } = latestData || {};

  useEffect(() => {
    if (soil_moisture === undefined || !selectedFieldId) return;

    fetch(`${API}/api/crop-suggestion/?field_id=${selectedFieldId}`, { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : Promise.reject('Crop API error')))
      .then(setCrop)
      .catch((err) => console.error('Crop Fetch Error:', err));

    fetch(`${API}/api/fertilizer/recommend/?field_id=${selectedFieldId}`, { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : Promise.reject('Fertilizer API error')))
      .then(setFertilizer)
      .catch((err) => console.error('Fertilizer Fetch Error:', err));

    fetch(`${API}/api/irrigation/get-advice/?field_id=${selectedFieldId}`, { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : Promise.reject('Irrigation API error')))
      .then(setIrrigation)
      .catch((err) => console.error('Irrigation Fetch Error:', err));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nitrogen, phosphorus, potassium, temperature, humidity, soil_ph, soil_moisture, selectedFieldId]);

  return (
    <div className="recommendations-card panel-spacer-bottom">
      <h3>Smart Recommendations</h3>

      <div className="advisory-badge-layout">
        <span className="advisory-icon advisory-icon-crop">🌱</span>
        <div>
          <div className="advisory-tag advisory-tag-crop">Recommended Crop</div>
          <div className="advisory-value">
            {crop?.prediction_result ?? 'Analyzing...'}
          </div>
          <div className="advisory-desc">
            {crop?.message ?? 'Based on the latest field reading.'}
          </div>
        </div>
      </div>

      <div className="advisory-badge-layout">
        <span className="advisory-icon advisory-icon-fertilizer">🧪</span>
        <div>
          <div className="advisory-tag advisory-tag-fertilizer">Fertilizer Recommendation</div>
          <div className="advisory-value">
            {fertilizer?.error ? 'Unavailable' : (fertilizer?.recommendation ?? 'Analyzing...')}
          </div>
          <div className="advisory-desc">
            {fertilizer?.error ?? 'Based on the latest field reading.'}
          </div>
        </div>
      </div>

      <div className="advisory-badge-layout">
        <span className="advisory-icon advisory-icon-irrigation">💧</span>
        <div>
          <div className="advisory-tag advisory-tag-irrigation">Irrigation Suggestion</div>
          <div className="advisory-value">
            {irrigation?.irrigation?.action ?? 'Analyzing...'}
          </div>
          <div className="advisory-desc">
            {irrigation?.irrigation?.reason ?? 'Please wait for field data analysis.'}
          </div>
        </div>
      </div>
    </div>
  );
}