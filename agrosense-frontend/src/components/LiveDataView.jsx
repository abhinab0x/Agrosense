import React, { useState, useEffect, useRef, useMemo } from 'react';
import { apiFetch } from '../utils/api';
import './css/LiveDataView.css';

function LiveDataView({ selectedFieldId }) {
  const [liveMetrics, setLiveMetrics] = useState({
    moisture: 0, temperature: 0, humidity: 0,
    pH: 7.0, nitrogen: 0, phosphorus: 0, potassium: 0
  });
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING...');

  // Always-on "today, morning to evening" trend data — independent of
  // the explorer table below, so the daily picture is visible at a glance
  // without needing to click "Open Database Explorer" first.
  const [todayRecords, setTodayRecords] = useState([]);
  const [todayLoading, setTodayLoading] = useState(true);

  const [dbRecords, setDbRecords] = useState([]);
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('today');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const activeFilterRef = useRef(activeFilter);
  const isTableVisibleRef = useRef(isTableVisible);

  useEffect(() => { activeFilterRef.current = activeFilter; }, [activeFilter]);
  useEffect(() => { isTableVisibleRef.current = isTableVisible; }, [isTableVisible]);

  const buildHistoryUrl = (fieldId, filter, date) => {
    let url = `/api/sensors/?field_id=${fieldId}&filter=${filter}`;
    if (filter === 'custom') url += `&date=${date}`;
    return url;
  };

  // ---------- Today's full-day trend (always fetched, always visible) ----------
  const fetchTodayTrend = (signal) => {
    if (!selectedFieldId) return;
    apiFetch(buildHistoryUrl(selectedFieldId, 'today'), { signal })
      .then((res) => {
        if (!res.ok) throw new Error('Trend query failed');
        return res.json();
      })
      .then((data) => {
        const ascending = [...(data || [])].sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
        setTodayRecords(ascending);
        setTodayLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Today trend fetch failed:', err);
        setTodayLoading(false);
      });
  };

  useEffect(() => {
    if (!selectedFieldId) return;
    setTodayLoading(true);
    const controller = new AbortController();
    fetchTodayTrend(controller.signal);

    // Refresh the day's trend every 60s so it fills in as new readings arrive.
    const interval = setInterval(() => fetchTodayTrend(), 60000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [selectedFieldId]);

  // ---------- Explorer table (Today / Yesterday / custom date, filterable) ----------
  const fetchHistory = (signal) => {
    if (!selectedFieldId) return;
    setLoadingHistory(true);

    apiFetch(buildHistoryUrl(selectedFieldId, activeFilter, selectedDate), { signal })
      .then((res) => {
        if (!res.ok) throw new Error('Timeline query failed');
        return res.json();
      })
      .then((data) => {
        const sorted = [...(data || [])].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setDbRecords(sorted);
        setLoadingHistory(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('DB fetch failed:', err);
        setDbRecords([]);
        setLoadingHistory(false);
      });
  };

  useEffect(() => {
    if (!isTableVisible || !selectedFieldId) return;
    const controller = new AbortController();
    fetchHistory(controller.signal);
    return () => controller.abort();
  }, [activeFilter, selectedDate, isTableVisible, selectedFieldId]);

  useEffect(() => {
    if (!isTableVisible || activeFilter !== 'today' || !selectedFieldId) return;
    const syncInterval = setInterval(() => fetchHistory(), 30000);
    return () => clearInterval(syncInterval);
  }, [isTableVisible, activeFilter, selectedFieldId]);

  // ---------- Live gauge polling ----------
  useEffect(() => {
    if (!selectedFieldId) {
      setConnectionStatus('NO FIELD SELECTED');
      return;
    }

    const fetchLive = () => {
      apiFetch(`/api/sensors/?field_id=${selectedFieldId}`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (!data || data.length === 0) return;

          const latest = data[0];
          const fresh = {
            moisture: latest.soil_moisture ?? 0,
            temperature: latest.temperature ?? 0,
            humidity: latest.humidity ?? 0,
            pH: latest.soil_ph ?? 7.0,
            nitrogen: latest.nitrogen ?? 0,
            phosphorus: latest.phosphorus ?? 0,
            potassium: latest.potassium ?? 0,
            timestamp: latest.timestamp || new Date().toISOString(),
          };

          setLiveMetrics(fresh);
          setConnectionStatus('CONNECTED');

          setTodayRecords((prev) => {
            const isDuplicate = prev.some((r) => r.timestamp === latest.timestamp);
            if (isDuplicate) return prev;
            return [...prev, latest];
          });

          if (activeFilterRef.current === 'today' && isTableVisibleRef.current) {
            setDbRecords((prev) => {
              const isDuplicate = prev.some((r) => r.timestamp === latest.timestamp);
              if (isDuplicate) return prev;
              return [latest, ...prev];
            });
          }
        })
        .catch((err) => {
          console.error('Live stream error:', err);
          setConnectionStatus('DISCONNECTED');
        });
    };

    fetchLive();
    const interval = setInterval(fetchLive, 2500);
    return () => clearInterval(interval);
  }, [selectedFieldId]);

  const getMoistureStatus = (val) => {
    if (val < 30) return { text: 'Warning: Arid Soil / Wilting Risk', class: 'text-danger' };
    if (val > 75) return { text: 'Warning: Waterlogged / Root Rot Risk', class: 'text-warning' };
    return { text: 'Optimal Matrix Hydration', class: 'text-blue' };
  };
  const getTemperatureStatus = (val) => {
    if (val < 15) return { text: 'Chilly: Reduced Plant Growth Rate', class: 'text-warning' };
    if (val > 38) return { text: 'Extreme Heat: Thermal Stress Active', class: 'text-danger' };
    return { text: 'Stable Thermal Level', class: 'text-orange' };
  };
  const getHumidityStatus = (val) => {
    if (val < 40) return { text: 'Dry Air: Accelerated Transpiration', class: 'text-warning' };
    if (val > 85) return { text: 'High Humidity: Pathogen Vulnerability', class: 'text-danger' };
    return { text: 'Atmosphere Consistent', class: 'text-green' };
  };
  const getPhStatus = (val) => {
    if (val < 5.5) return { text: 'Strongly Acidic: Nutrient Lockout', class: 'text-danger' };
    if (val > 7.8) return { text: 'Alkaline Soil: Iron Deficiency Risk', class: 'text-warning' };
    return { text: 'Balanced Neutral Range', class: 'text-purple' };
  };

  // ---------- Day trend chart (pure SVG, no extra dependency) ----------
  const DAY_START_HOUR = 5;   // 5 AM
  const DAY_END_HOUR = 21;    // 9 PM
  const CHART_W = 600;
  const CHART_H = 120;
  const PAD_L = 34;
  const PAD_R = 10;
  const PAD_T = 10;
  const PAD_B = 22;

  const hourFraction = (isoString) => {
    const d = new Date(isoString);
    return d.getHours() + d.getMinutes() / 60;
  };

  const xForHour = (h) => {
    const clamped = Math.max(DAY_START_HOUR, Math.min(h, DAY_END_HOUR));
    const frac = (clamped - DAY_START_HOUR) / (DAY_END_HOUR - DAY_START_HOUR);
    return PAD_L + frac * (CHART_W - PAD_L - PAD_R);
  };

  const yFor = (value, min, max) => {
    const clamped = Math.max(min, Math.min(value, max));
    const frac = (clamped - min) / (max - min || 1);
    return CHART_H - PAD_B - frac * (CHART_H - PAD_T - PAD_B);
  };

  const buildPath = (records, key, min, max) => {
    if (records.length === 0) return '';
    return records
      .map((r, i) => {
        const x = xForHour(hourFraction(r.timestamp));
        const y = yFor(Number(r[key]) || 0, min, max);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const hourTicks = [6, 9, 12, 15, 18, 21];

  const trendMetrics = useMemo(() => ([
    { key: 'soil_moisture', label: 'Soil Moisture', unit: '%', color: '#3b82f6', min: 0, max: 100 },
    { key: 'temperature', label: 'Temperature', unit: '°C', color: '#ea580c', min: 0, max: 50 },
    { key: 'humidity', label: 'Humidity', unit: '%', color: '#16a34a', min: 0, max: 100 },
    { key: 'soil_ph', label: 'Soil pH', unit: '', color: '#7c3aed', min: 0, max: 14 },
  ]), []);

  const renderTrendChart = ({ key, label, unit, color, min, max }) => {
    const values = todayRecords.map((r) => Number(r[key]) || 0);
    const latestValue = values.length ? values[values.length - 1] : null;

    return (
      <div className="trend-chart-card" key={key}>
        <div className="trend-chart-header">
          <span className="trend-chart-label">{label}</span>
          {latestValue !== null && (
            <span className="trend-chart-latest">
              {latestValue}{unit}
            </span>
          )}
        </div>

        {todayRecords.length === 0 ? (
          <div className="trend-chart-empty">No readings yet today</div>
        ) : (
          <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="trend-chart-svg" preserveAspectRatio="none">
            {hourTicks.map((h) => (
              <line
                key={h}
                x1={xForHour(h)} x2={xForHour(h)}
                y1={PAD_T} y2={CHART_H - PAD_B}
                className="trend-chart-gridline"
              />
            ))}
            <path
              d={buildPath(todayRecords, key, min, max)}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {todayRecords.map((r, i) => (
              <circle
                key={i}
                cx={xForHour(hourFraction(r.timestamp))}
                cy={yFor(Number(r[key]) || 0, min, max)}
                r="2.2"
                fill={color}
              />
            ))}
            {hourTicks.map((h) => (
              <text
                key={h}
                x={xForHour(h)}
                y={CHART_H - 6}
                className="trend-chart-tick-label"
                textAnchor="middle"
              >
                {h % 12 === 0 ? 12 : h % 12}{h < 12 ? 'AM' : 'PM'}
              </text>
            ))}
          </svg>
        )}
      </div>
    );
  };

  return (
    <div className="live-view-container">
      <div className="live-view-header">
        <div>
          <h2 className="live-view-title">Live Hardware Telemetry</h2>
          <p className="live-view-subtitle">Real-time socket stream from active field sensor nodes</p>
        </div>
        <div className={`hardware-status-badge ${connectionStatus.toLowerCase().replace(/\./g, '')}`}>
          <span className="pulse-dot">●</span>
          <span>Node-01: <strong>{connectionStatus}</strong></span>
        </div>
      </div>

      <div className="live-gauges-grid">
        <div className="gauge-card">
          <span className="gauge-label">Soil Moisture</span>
          <div className="gauge-value-display">
            <span className="number blue">{liveMetrics.moisture}</span>
            <span className="unit">%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill bg-blue" style={{ width: `${liveMetrics.moisture}%` }} />
          </div>
          <span className={`gauge-meta-status ${getMoistureStatus(liveMetrics.moisture).class}`}>
            {getMoistureStatus(liveMetrics.moisture).text}
          </span>
        </div>

        <div className="gauge-card">
          <span className="gauge-label">Ambient Temperature</span>
          <div className="gauge-value-display">
            <span className="number orange">{liveMetrics.temperature}</span>
            <span className="unit">°C</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill bg-orange" style={{ width: `${(liveMetrics.temperature / 50) * 100}%` }} />
          </div>
          <span className={`gauge-meta-status ${getTemperatureStatus(liveMetrics.temperature).class}`}>
            {getTemperatureStatus(liveMetrics.temperature).text}
          </span>
        </div>

        <div className="gauge-card">
          <span className="gauge-label">Air Humidity</span>
          <div className="gauge-value-display">
            <span className="number green">{liveMetrics.humidity}</span>
            <span className="unit">%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill bg-green" style={{ width: `${liveMetrics.humidity}%` }} />
          </div>
          <span className={`gauge-meta-status ${getHumidityStatus(liveMetrics.humidity).class}`}>
            {getHumidityStatus(liveMetrics.humidity).text}
          </span>
        </div>

        <div className="gauge-card">
          <span className="gauge-label">Soil pH Index</span>
          <div className="gauge-value-display">
            <span className="number purple">{liveMetrics.pH}</span>
            <span className="unit">pH</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill bg-purple" style={{ width: `${(liveMetrics.pH / 14) * 100}%` }} />
          </div>
          <span className={`gauge-meta-status ${getPhStatus(liveMetrics.pH).class}`}>
            {getPhStatus(liveMetrics.pH).text}
          </span>
        </div>
      </div>

      <div className="content-panel trend-section">
        <div className="trend-section-header">
          <span className="panel-title">Today's Trend — Morning to Evening</span>
          <p className="panel-description">
            {todayLoading
              ? 'Loading today\'s readings…'
              : `${todayRecords.length} reading${todayRecords.length === 1 ? '' : 's'} recorded so far today.`}
          </p>
        </div>
        <div className="trend-charts-grid">
          {trendMetrics.map(renderTrendChart)}
        </div>
      </div>

      <div className="live-view-row-split">
        <div className="content-panel npk-live-panel">
          <span className="panel-title">Macro-Nutrient Live Indexes (N-P-K)</span>
          <div className="npk-bars-stack">
            <div className="npk-bar-item">
              <div className="npk-bar-meta"><span>Nitrogen (N)</span><span className="bold">{liveMetrics.nitrogen} mg/kg</span></div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill bg-emerald" style={{ width: `${liveMetrics.nitrogen}%` }} />
              </div>
            </div>
            <div className="npk-bar-item">
              <div className="npk-bar-meta"><span>Phosphorus (P)</span><span className="bold">{liveMetrics.phosphorus} mg/kg</span></div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill bg-emerald" style={{ width: `${liveMetrics.phosphorus}%` }} />
              </div>
            </div>
            <div className="npk-bar-item">
              <div className="npk-bar-meta"><span>Potassium (K)</span><span className="bold">{liveMetrics.potassium} mg/kg</span></div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill bg-emerald" style={{ width: `${liveMetrics.potassium}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="content-panel history-control-panel">
          <span className="panel-title">Database Storage & Logging Logs</span>
          <p className="panel-description">Analyze incremental timelines of field metrics from morning to current status intervals.</p>
          <button
            className={`action-toggle-btn ${isTableVisible ? 'active' : ''}`}
            onClick={() => setIsTableVisible((v) => !v)}
          >
            {isTableVisible ? '🔒 Close Database Explorer' : '📊 Open Complete Database Explorer'}
          </button>
        </div>
      </div>

      {isTableVisible && (
        <div className="database-explorer-sheet">
          <div className="explorer-filter-bar">
            <div className="filter-group-buttons">
              <button className={activeFilter === 'today' ? 'active' : ''} onClick={() => setActiveFilter('today')}>Today</button>
              <button className={activeFilter === 'yesterday' ? 'active' : ''} onClick={() => setActiveFilter('yesterday')}>Yesterday</button>
              <button className={activeFilter === 'custom' ? 'active' : ''} onClick={() => setActiveFilter('custom')}>Select Date 📅</button>
            </div>
            {activeFilter === 'custom' && (
              <div className="calendar-input-wrapper">
                <input
                  type="date"
                  value={selectedDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="native-app-calendar"
                />
              </div>
            )}
          </div>

          <div className="table-overflow-viewport">
            {loadingHistory ? (
              <div className="table-message-state">Querying secure server database registries...</div>
            ) : dbRecords.length === 0 ? (
              <div className="table-message-state">No telemetry parameters matching criteria found in logs.</div>
            ) : (
              <table className="agro-data-table">
                <thead>
                  <tr>
                    <th>Timestamp (Timeline)</th>
                    <th>Moisture</th>
                    <th>Temp</th>
                    <th>Humidity</th>
                    <th>pH</th>
                    <th>N-P-K Index</th>
                  </tr>
                </thead>
                <tbody>
                  {dbRecords.map((record, index) => (
                    <tr key={record.id || index}>
                      <td className="time-cell">
                        {new Date(record.timestamp).toLocaleTimeString([], {
                          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
                        })}
                        <span className="date-subtext">Database Record</span>
                      </td>
                      <td><span className="table-num blue-text">{record.soil_moisture ?? record.moisture}%</span></td>
                      <td><span className="table-num orange-text">{record.temperature}°C</span></td>
                      <td><span className="table-num green-text">{record.humidity}%</span></td>
                      <td><span className="table-num purple-text">{record.soil_ph ?? record.pH}</span></td>
                      <td className="npk-combined">
                        <span className="n-badge">N: {record.nitrogen}</span>
                        <span className="p-badge">P: {record.phosphorus}</span>
                        <span className="k-badge">K: {record.potassium}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveDataView;