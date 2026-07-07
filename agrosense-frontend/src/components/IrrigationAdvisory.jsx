import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import './css/IrrigationAdvisory.css';

const ACTION_CONFIG = {
    WATER:    { label: 'Irrigate Now',      color: '#e74c3c', icon: '💧', bg: 'rgba(231,76,60,0.15)'   },
    LIGHT:    { label: 'Light Irrigation',  color: '#f39c12', icon: '🌤️', bg: 'rgba(243,156,18,0.15)'  },
    SKIP:     { label: 'Skip – Rain Soon',  color: '#3498db', icon: '🌧️', bg: 'rgba(52,152,219,0.15)'  },
    STAY_OFF: { label: 'No Irrigation',     color: '#2ecc71', icon: '✅', bg: 'rgba(46,204,113,0.15)'  },
    UNKNOWN:  { label: 'Monitoring…',       color: '#95a5a6', icon: '📡', bg: 'rgba(149,165,166,0.15)' },
};

const IrrigationAdvisory = ({ selectedFieldId }) => {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    useEffect(() => {
        if (!selectedFieldId) return;

        setLoading(true);
        setError(null);

        apiFetch(`/api/irrigation/get-advice/?field_id=${selectedFieldId}`)
            .then(res => {
                if (!res.ok) throw new Error(`Server error (${res.status})`);
                return res.json();
            })
            .then(json => { setData(json); setLoading(false); })
            .catch(err => { setError(err.message); setLoading(false); });
    }, [selectedFieldId]);

    if (loading) return (
        <div className="ia-center">
            <div className="ia-spinner" />
            <p className="ia-loading-text">Fetching field conditions…</p>
        </div>
    );

    if (error) return (
        <div className="ia-center">
            <div className="ia-error-box">
                <span className="ia-error-icon">⚠️</span>
                <p className="ia-error-title">Connection failed</p>
                <p className="ia-error-msg">{error}</p>
                <p className="ia-error-hint">Make sure Django is running on port 8000</p>
            </div>
        </div>
    );

    const action     = data?.irrigation?.action ?? 'UNKNOWN';
    const cfg        = ACTION_CONFIG[action] ?? ACTION_CONFIG.UNKNOWN;
    const urgency    = data?.irrigation?.urgency;
    const current    = data?.current    ?? {};
    const forecast   = data?.forecast   ?? [];
    const moisture   = data?.soil_moisture;

    return (
        <div className="ia-page">

          
            <div className="ia-top-row">

             
                <div className="ia-card ia-weather-card">
                    <p className="ia-card-label">Current Conditions · Dhulikhel</p>
                    <div className="ia-temp-row">
                        <span className="ia-temp">{current.temp ?? '--'}°C</span>
                        <span className="ia-desc">{current.desc ?? 'N/A'}</span>
                    </div>
                    <div className="ia-weather-grid">
                        <div className="ia-weather-stat">
                            <span className="ia-stat-icon">💧</span>
                            <span className="ia-stat-value">{current.humidity ?? '--'}%</span>
                            <span className="ia-stat-label">Humidity</span>
                        </div>
                        <div className="ia-weather-stat">
                            <span className="ia-stat-icon">💨</span>
                            <span className="ia-stat-value">{current.wind ?? '--'} km/h</span>
                            <span className="ia-stat-label">Wind</span>
                        </div>
                        <div className="ia-weather-stat">
                            <span className="ia-stat-icon">🌧️</span>
                            <span className="ia-stat-value">{current.rain_1h ?? 0} mm</span>
                            <span className="ia-stat-label">Rainfall</span>
                        </div>
                    </div>
                </div>

                
                <div className="ia-card ia-advice-card" style={{ borderColor: cfg.color }}>
                    <p className="ia-card-label">Irrigation Advisory</p>
                    <div className="ia-advice-badge" style={{ background: cfg.bg, color: cfg.color }}>
                        <span className="ia-advice-icon">{cfg.icon}</span>
                        <span className="ia-advice-label">{cfg.label}</span>
                        {urgency === 'urgent' && <span className="ia-urgency-tag">URGENT</span>}
                    </div>
                    <p className="ia-advice-reason">{data?.irrigation?.reason}</p>

                    {data?.irrigation?.suggested_duration_min && (
                        <div className="ia-duration">
                            <span>⏱ Suggested duration</span>
                            <strong>{data.irrigation.suggested_duration_min} min</strong>
                        </div>
                    )}

                    {moisture !== null && moisture !== undefined && (
                        <div className="ia-moisture-bar-wrap">
                            <div className="ia-moisture-header">
                                <span>Soil Moisture</span>
                                <span>{moisture}%</span>
                            </div>
                            <div className="ia-moisture-track">
                                <div
                                    className="ia-moisture-fill"
                                    style={{
                                        width: `${moisture}%`,
                                        background: moisture < 20 ? '#e74c3c'
                                                  : moisture < 40 ? '#f39c12'
                                                  : '#2ecc71'
                                    }}
                                />
                            </div>
                            <div className="ia-moisture-ticks">
                                <span>Dry</span><span>Low</span><span>Good</span><span>Wet</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            
            {forecast.length > 0 && (
                <div className="ia-card ia-forecast-card">
                    <p className="ia-card-label">24-Hour Forecast</p>
                    <div className="ia-forecast-grid">
                        {forecast.map((item, idx) => (
                            <div className="ia-forecast-slot" key={idx}>
                                <span className="ia-fc-time">{item.time}</span>
                                <span className="ia-fc-temp">{item.temp}°C</span>
                                {item.rain > 0 && (
                                    <span className="ia-fc-rain">🌧 {item.rain}mm</span>
                                )}
                                <span className="ia-fc-desc">{item.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
};

export default IrrigationAdvisory;