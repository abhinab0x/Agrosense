import React from 'react';

function MetricCard({ title, value, unit, status, iconBg, iconSvg, sparklineColor, sparklinePoints }) {
  return (
    <div className="metric-card">
      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', width: '100%' }}>
        <div className="metric-info-block" style={{ flexGrow: 1 }}>
          <span className="metric-label">{title}</span>
          <div className="metric-number">
            {value}
            {unit && <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginLeft: '2px' }}>{unit}</span>}
          </div>
        </div>
        <div className="metric-icon-circle" style={{ backgroundColor: iconBg, flexShrink: 0 }}>
          {iconSvg}
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
        <span className="metric-status-text">{status}</span>
        
        {/* Responsive Telemetry Sparkline Vector */}
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