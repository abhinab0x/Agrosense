import React, { useState, useEffect } from 'react';
import './css/LiveDataView.css'; 

function LiveDataView() {
  // 1. Top Gauges State (Always tracking the absolute newest reading)
  const [liveMetrics, setLiveMetrics] = useState({
    moisture: 0,
    temperature: 0,
    humidity: 0,
    pH: 7.0,
    nitrogen: 0,
    phosphorus: 0,
    potassium: 0
  });

  const [connectionStatus, setConnectionStatus] = useState('CONNECTING...');
  
  // 2. Bottom Timeline Table States
  const [dbRecords, setDbRecords] = useState([]);
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('today'); // today, yesterday, custom
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // ENGINE 1: Fetch Database History (Runs on filter change, page reload, or opening the drawer)
  useEffect(() => {
    if (!isTableVisible) return;

    setLoadingHistory(true);
    let url = `http://127.0.0.1:8000/api/sensors/?filter=${activeFilter}`;
    if (activeFilter === 'custom') url += `&date=${selectedDate}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Database timeline query failed");
        return res.json();
      })
      .then((data) => {
        // Securely load all actual records saved in PostgreSQL from morning onwards
        setDbRecords(data || []); 
        setLoadingHistory(false);
      })
      .catch((err) => {
        console.error("Database connection dropped:", err);
        setDbRecords([]);
        setLoadingHistory(false);
      });
  }, [activeFilter, selectedDate, isTableVisible]);

  // ENGINE 2: Live Hardware Background Stream (Keeps cards up to date & updates table)
  useEffect(() => {
    const fetchLiveStream = () => {
      fetch('http://127.0.0.1:8000/api/sensors/')
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP Status: ${response.status}`);
          return response.json();
        })
        .then((data) => {
          if (data && data.length > 0) {
            const latestReading = data[0];
            
            const freshMetrics = {
              moisture: latestReading.soil_moisture ?? 0,
              temperature: latestReading.temperature ?? 0,
              humidity: latestReading.humidity ?? 0,
              pH: latestReading.soil_ph ?? 7.0,
              nitrogen: latestReading.nitrogen ?? 0,
              phosphorus: latestReading.phosphorus ?? 0,
              potassium: latestReading.potassium ?? 0,
              timestamp: latestReading.timestamp || new Date().toISOString()
            };
            
            // Map parameters to top dashboard gauges
            setLiveMetrics(freshMetrics);
            setConnectionStatus('CONNECTED');

            // LIVE TABLE SYNCHRONIZATION
            if (activeFilter === 'today' && isTableVisible) {
              setDbRecords(prev => {
                // If the incoming data point's timestamp matches something already in the table, do nothing
                const isDuplicate = prev.some(r => r.timestamp === latestReading.timestamp);
                if (isDuplicate) return prev;
                
                // Keep the database history fully intact below, just prepend the new incoming record
                return [latestReading, ...prev]; 
              });
            }
          }
        })
        .catch((error) => {
          console.error("Error drawing live telemetry records:", error);
          setConnectionStatus('DISCONNECTED');
        });
    };

    fetchLiveStream();
    const dynamicStreamInterval = setInterval(fetchLiveStream, 2500);
    return () => clearInterval(dynamicStreamInterval);
  }, [activeFilter, isTableVisible]);


  // Threshold Evaluation Calculations
  const getMoistureStatus = (val) => {
    if (val < 30) return { text: "Warning: Arid Soil / Wilting Risk", class: "text-danger" };
    if (val > 75) return { text: "Warning: Waterlogged / Root Rot Risk", class: "text-warning" };
    return { text: "Optimal Matrix Hydration", class: "text-blue" };
  };

  const getTemperatureStatus = (val) => {
    if (val < 15) return { text: "Chilly: Reduced Plant Growth Rate", class: "text-warning" };
    if (val > 38) return { text: "Extreme Heat: Thermal Stress Active", class: "text-danger" };
    return { text: "Stable Thermal Level", class: "text-orange" };
  };

  const getHumidityStatus = (val) => {
    if (val < 40) return { text: "Dry Air: Accelerated Transpiration", class: "text-warning" };
    if (val > 85) return { text: "High Humidity: Pathogen Vulnerability", class: "text-danger" };
    return { text: "Atmosphere Consistent", class: "text-green" };
  };

  const getPhStatus = (val) => {
    if (val < 5.5) return { text: "Strongly Acidic: Nutrient Lockout", class: "text-danger" };
    if (val > 7.8) return { text: "Alkaline Soil: Iron Deficiency Risk", class: "text-warning" };
    return { text: "Balanced Neutral Range", class: "text-purple" };
  };

  return (
    <div className="live-view-container">
      {/* HEADER BAR */}
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

      {/* GAUGES CARD GRID */}
      <div className="live-gauges-grid">
        <div className="gauge-card">
          <span className="gauge-label">Soil Moisture</span>
          <div className="gauge-value-display">
            <span className="number blue">{liveMetrics.moisture}</span>
            <span className="unit">%</span>
          </div>
          <div className="progress-bar-track"><div className="progress-bar-fill bg-blue" style={{ width: `${liveMetrics.moisture}%` }}></div></div>
          <span className={`gauge-meta-status ${getMoistureStatus(liveMetrics.moisture).class}`}>{getMoistureStatus(liveMetrics.moisture).text}</span>
        </div>

        <div className="gauge-card">
          <span className="gauge-label">Ambient Temperature</span>
          <div className="gauge-value-display">
            <span className="number orange">{liveMetrics.temperature}</span>
            <span className="unit">°C</span>
          </div>
          <div className="progress-bar-track"><div className="progress-bar-fill bg-orange" style={{ width: `${(liveMetrics.temperature / 50) * 100}%` }}></div></div>
          <span className={`gauge-meta-status ${getTemperatureStatus(liveMetrics.temperature).class}`}>{getTemperatureStatus(liveMetrics.temperature).text}</span>
        </div>
       
        <div className="gauge-card">
          <span className="gauge-label">Air Humidity</span>
          <div className="gauge-value-display">
            <span className="number green">{liveMetrics.humidity}</span>
            <span className="unit">%</span>
          </div>
          <div className="progress-bar-track"><div className="progress-bar-fill bg-green" style={{ width: `${liveMetrics.humidity}%` }}></div></div>
          <span className={`gauge-meta-status ${getHumidityStatus(liveMetrics.humidity).class}`}>{getHumidityStatus(liveMetrics.humidity).text}</span>
        </div>
      
        <div className="gauge-card">
          <span className="gauge-label">Soil pH Index</span>
          <div className="gauge-value-display">
            <span className="number purple">{liveMetrics.pH}</span>
            <span className="unit">pH</span>
          </div>
          <div className="progress-bar-track"><div className="progress-bar-fill bg-purple" style={{ width: `${(liveMetrics.pH / 14) * 100}%` }}></div></div>
          <span className={`gauge-meta-status ${getPhStatus(liveMetrics.pH).class}`}>{getPhStatus(liveMetrics.pH).text}</span>
        </div>
      </div>
     
      {/* SPLIT MIDDLE PANEL ROW */}
      <div className="live-view-row-split">
        <div className="content-panel npk-live-panel">
          <span className="panel-title">Macro-Nutrient Live Indexes (N-P-K)</span>
          <div className="npk-bars-stack">
            <div className="npk-bar-item">
              <div className="npk-bar-meta"><span>Nitrogen (N)</span><span className="bold">{liveMetrics.nitrogen} mg/kg</span></div>
              <div className="progress-bar-track"><div className="progress-bar-fill bg-emerald" style={{ width: `${liveMetrics.nitrogen}%` }}></div></div>
            </div>
            <div className="npk-bar-item">
              <div className="npk-bar-meta"><span>Phosphorus (P)</span><span className="bold">{liveMetrics.phosphorus} mg/kg</span></div>
              <div className="progress-bar-track"><div className="progress-bar-fill bg-emerald" style={{ width: `${liveMetrics.phosphorus}%` }}></div></div>
            </div>
            <div className="npk-bar-item">
              <div className="npk-bar-meta"><span>Potassium (K)</span><span className="bold">{liveMetrics.potassium} mg/kg</span></div>
              <div className="progress-bar-track"><div className="progress-bar-fill bg-emerald" style={{ width: `${liveMetrics.potassium}%` }}></div></div>
            </div>
          </div>
        </div>
       
        <div className="content-panel history-control-panel">
          <span className="panel-title">Database Storage & Logging Logs</span>
          <p className="panel-description">Analyze incremental timelines of field metrics from morning to current status check intervals.</p>
          
          <button 
            className={`action-toggle-btn ${isTableVisible ? 'active' : ''}`}
            onClick={() => setIsTableVisible(!isTableVisible)}
          >
            {isTableVisible ? "🔒 Close Database Explorer" : "📊 Open Complete Database Explorer"}
          </button>
        </div>
      </div>

      {/* LOWER DATA EXPLORER MATRIX SHEET */}
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
              <div className="table-message-state">
                No telemetry parameters matching criteria found in logs.
              </div>
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
                        {new Date(record.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit', hour12: true})}
                        <span className="date-subtext">
                          Database Record
                        </span>
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