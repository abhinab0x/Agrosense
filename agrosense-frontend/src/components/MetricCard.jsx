// components/MetricCard.jsx
import React from 'react';

function buildSparklinePoints(history, width = 120, height = 20) {
  if (!Array.isArray(history) || history.length === 0) {
    // flat baseline so the SVG doesn't render a broken/empty line
    return `0,${height / 2} ${width},${height / 2}`;
  }
  if (history.length === 1) {
    return `0,${height / 2} ${width},${height / 2}`;
  }

  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1; // avoid divide-by-zero when all values are equal

  return history
    .map((val, i) => {
      const x = (i / (history.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

function MetricCard({ title, value, unit, status, iconBg, iconSvg, sparklineColor, history }) {
  const sparklinePoints = buildSparklinePoints(history);

  return (
    <div className="metric-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div className="metric-info-block" style={{ flexGrow: 1 }}>
          <span className="metric-label">{title}</span>
          <div className="metric-number">
            {value}
            {unit && (
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginLeft: '2px' }}>
                {unit}
              </span>
            )}
          </div>
        </div>
        <div className="metric-icon-circle" style={{ backgroundColor: iconBg, flexShrink: 0 }}>
          {iconSvg}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
        <span className="metric-status-text">{status}</span>

        <div style={{ width: '100%', height: '20px', marginTop: '2px' }}>
          <svg width="100%" height="20" viewBox="0 0 120 20" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke={sparklineColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={sparklinePoints}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default MetricCard;