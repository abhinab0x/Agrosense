// components/SoilHealthScore.jsx
import React from 'react';

function computeHealthScore({ soil_moisture, soil_ph, humidity } = {}) {
  const scoreRange = (val, min, max) => {
    if (val === undefined || val === null) return 0;
    if (val >= min && val <= max) return 100;
    const dist = val < min ? min - val : val - max;
    return Math.max(0, 100 - dist * 4);
  };
  const moistureScore = scoreRange(soil_moisture, 40, 60);
  const phScore = scoreRange(soil_ph, 6.0, 7.0);
  const humidityScore = scoreRange(humidity, 50, 70);
  return Math.round((moistureScore + phScore + humidityScore) / 3);
}

export default function SoilHealthScore({ latestData }) {
  const score = computeHealthScore(latestData);
  const label = score >= 75 ? 'Good' : score >= 50 ? 'Moderate' : 'Poor';
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#f59e0b' : '#dc2626';
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="soil-health-card panel-spacer-bottom">
      <h3>Soil Health Score</h3>
      <div className="donut-wrap">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="45" fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="45" fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" transform="rotate(-90 60 60)"
          />
          <text x="60" y="58" textAnchor="middle" className="radial-center-text-score">{score}%</text>
          <text x="60" y="76" textAnchor="middle" className="radial-center-text-status">{label}</text>
        </svg>

        <div className="health-summary-details">
          <p>Your soil is in <strong>{label.toLowerCase()}</strong> condition for farming.</p>
          {/* <button className="health-details-action-btn">View Details</button> */}
        </div>
      </div>
    </div>
  );
}