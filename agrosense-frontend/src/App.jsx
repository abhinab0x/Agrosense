import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MetricCard from './components/MetricCard';
import LiveDataView from './components/LiveDataView'; // 1. Imported your live tracking view
import { initialSensorData } from './data/mockData';
import './App.css'; // Link to our cleaned code structure stylesheet

function App() {
  // DJANGO BACKEND CONNECTION STATES 
  const [sensorReadings, setSensorReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Main Tab Routing State Manager
  const [activeTab, setActiveTab] = useState('dashboard');

  // Fetch telemetry array directly from local Django REST framework server instance
  useEffect(() => {
    // Isolated data-fetching function to look clean and allow repeated background execution
    const fetchSensorData = () => {
      fetch('http://127.0.0.1:8000/api/sensors/')
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          setSensorReadings(data);
          setLoading(false); // Disable spinner screen instantly on first successful frame load
        })
        .catch((error) => {
          console.error("Error connecting to AgroSense API backend Node:", error);
          // Fallback to local mock data file if server drops, but prevent breaking the app structure
          setSensorReadings((prevData) => prevData.length > 0 ? prevData : (initialSensorData || []));
          setLoading(false);
        });
    };

    // 1. Initial invocation immediately when the app mounts on screen
    fetchSensorData();

    // 2. Clear out manual updates: background polling loop fetches fresh database records every 5 seconds (5000ms)
    const dataPollingInterval = setInterval(() => {
      fetchSensorData();
    }, 5000);

    // 3. Mandatory clean-up block to stop the polling routine when the React component structure changes
    return () => clearInterval(dataPollingInterval);
  }, []);

  // Handle loading state while fetching database matrix rows on initial boot layout
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc', color: '#1e293b', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '10px' }}>Connecting to AgroSense Node Matrix... 🌱</h2>
          <p style={{ color: '#64748b' }}>Establishing handshake pipeline with Django REST framework backend</p>
        </div>
      </div>
    );
  }

  // target index 0 
  // If database is initialized but empty, it applies standard baseline fallbacks
  const latestData = sensorReadings[0] || {
    soil_moisture: 0,
    temperature: 0,
    humidity: 0,
    soil_ph: 7.0,
    nitrogen: 0,
    phosphorus: 0,
    potassium: 0
  };

  return (
    <div className="app-container">
      {/* Passing states into sidebar component */}
      <Sidebar currentTab={activeTab} changeTab={setActiveTab} />
      
      <main className="main-content">
        
        {/* NAVIGATION NAVBAR */}
        <header className="top-header">
          <div className="header-left-group">
            <button className="menu-toggle-btn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
            </button>
            <div className="header-search-wrapper">
              <input type="text" placeholder="Search anything..." className="header-search-input" />
            </div>
          </div>
          
          <div className="header-actions-group">
            <div className="notification-badge-trigger">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span className="notification-badge-count">3</span>
            </div>
            
            <div className="profile-widget-container">
              <div className="profile-identity-text">
                <div className="greeting">Welcome,</div>
                <div className="user-role">Farmer</div>
              </div>
              <div className="profile-avatar-frame">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Farmer Profile" />
              </div>
            </div>
          </div>
        </header>

        {/* 4. DYNAMIC VIEW SWITCHING CONDITIONAL ROUTING*/}
        {activeTab === 'live-data' ? (
          <LiveDataView />
        ) : activeTab === 'dashboard' ? (
          <>
            {/* DASHBOARD LANDSCAPE BANNER */}
            <div className="welcome-banner">
              <div>
                <h1 className="banner-title">Welcome to AgroSense 🌱</h1>
                <p className="banner-subtitle">IoT-Based Smart Soil Monitoring and Crop Recommendation System</p>
              </div>
              
              <div className="system-status-pill">
                <span className="status-indicator-dot">●</span>
                <span>System Status: <strong>Live Django Backend Connected</strong></span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" className="status-indicator-signal"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>
              </div>
            </div>

            {/* LIVE PARAMETERS CARDS GRID */}
            <section className="metrics-grid">
              <MetricCard 
                title="Soil Moisture" 
                value={latestData.soil_moisture !== undefined ? latestData.soil_moisture : 0} 
                unit="%" 
                status={latestData.soil_moisture < 30 ? "Dry" : latestData.soil_moisture > 75 ? "Wet" : "Moderate"} 
                iconBg="#eff6ff" 
                sparklineColor="#3b82f6"
                sparklinePoints="0,15 20,18 40,12 60,16 80,10 100,14 120,8"
                iconSvg={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5"><path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z"/></svg>}
              />
              <MetricCard 
                title="Temperature" 
                value={latestData.temperature !== undefined ? latestData.temperature : 0} 
                unit="°C" 
                status="Normal" 
                iconBg="#fff5f5" 
                sparklineColor="#ef4444"
                sparklinePoints="0,12 20,14 40,11 60,15 80,12 100,13 120,11"
                iconSvg={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>}
              />
              <MetricCard 
                title="Humidity" 
                value={latestData.humidity !== undefined ? latestData.humidity : 0} 
                unit="%" 
                status="Normal" 
                iconBg="#f0fdf4" 
                sparklineColor="#10b981"
                sparklinePoints="0,15 20,10 40,12 60,8 80,13 100,11 120,14"
                iconSvg={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
              />
              <MetricCard 
                title="Soil pH" 
                value={latestData.soil_ph !== undefined ? latestData.soil_ph : 7.0} 
                unit="" 
                status="Slightly Acidic" 
                iconBg="#f5f3ff" 
                sparklineColor="#8b5cf6"
                sparklinePoints="0,10 20,11 40,9 60,12 80,10 100,11 120,10"
                iconSvg={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5"><path d="M10 2v8L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45L14 10V2z"/></svg>}
              />
              <MetricCard 
                title="NPK (N-P-K)" 
                value={`${latestData.nitrogen || 0}-${latestData.phosphorus || 0}-${latestData.potassium || 0}`} 
                unit="" 
                status="Good" 
                iconBg="#ecfdf5" 
                sparklineColor="#10b981"
                sparklinePoints="0,12 20,15 40,10 60,13 80,9 100,11 120,8"
                iconSvg={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/></svg>}
              />
            </section>

            {/* CHART LAYOUT ROW */}
            <div className="dashboard-layout-row">
              <div className="content-panel">
                <div className="panel-header-container">
                  <span className="panel-title">Soil Parameters Trend</span>
                  <select className="trend-filter-select">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                  </select>
                </div>
                
                <div className="chart-container">
                  <div className="chart-grid-line y-grid-100"><span className="chart-y-axis-label">100</span></div>
                  <div className="chart-grid-line y-grid-75"><span className="chart-y-axis-label">75</span></div>
                  <div className="chart-grid-line y-grid-50"><span className="chart-y-axis-label">50</span></div>
                  <div className="chart-grid-line y-grid-25"><span className="chart-y-axis-label">25</span></div>
                  <div className="chart-grid-line y-grid-0"><span className="chart-y-axis-label">0</span></div>
                  
                  <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none" className="chart-vector-canvas">
                    <polyline fill="none" stroke="#3b82f6" strokeWidth="2.5" points="10,110 90,100 170,105 250,112 330,103 410,98 490,106" />
                    <circle cx="10" cy="110" r="4" fill="#3b82f6" /><circle cx="90" cy="100" r="4" fill="#3b82f6" /><circle cx="170" cy="105" r="4" fill="#3b82f6" /><circle cx="250" cy="112" r="4" fill="#3b82f6" /><circle cx="330" cy="103" r="4" fill="#3b82f6" /><circle cx="410" cy="98" r="4" fill="#3b82f6" /><circle cx="490" cy="106" r="4" fill="#3b82f6" />

                    <polyline fill="none" stroke="#f97316" strokeWidth="2.5" points="10,145 90,135 170,148 250,140 330,145 410,152 490,142" />
                    <circle cx="10" cy="145" r="4" fill="#f97316" /><circle cx="90" cy="135" r="4" fill="#f97316" /><circle cx="170" cy="148" r="4" fill="#f97316" /><circle cx="250" cy="140" r="4" fill="#f97316" /><circle cx="330" cy="145" r="4" fill="#f97316" /><circle cx="410" cy="152" r="4" fill="#f97316" /><circle cx="490" cy="142" r="4" fill="#f97316" />

                    <polyline fill="none" stroke="#10b981" strokeWidth="2.5" points="10,60 90,52 170,55 250,65 330,52 410,54 490,68" />
                    <circle cx="10" cy="60" r="4" fill="#10b981" /><circle cx="90" cy="52" r="4" fill="#10b981" /><circle cx="170" cy="55" r="4" fill="#10b981" /><circle cx="250" cy="65" r="4" fill="#10b981" /><circle cx="330" cy="52" r="4" fill="#10b981" /><circle cx="410" cy="54" r="4" fill="#10b981" /><circle cx="490" cy="68" r="4" fill="#10b981" />

                    <polyline fill="none" stroke="#8b5cf6" strokeWidth="2.5" points="10,185 90,187 170,183 250,186 330,182 410,184 490,185" />
                    <circle cx="10" cy="185" r="4" fill="#8b5cf6" /><circle cx="90" cy="187" r="4" fill="#8b5cf6" /><circle cx="170" cy="183" r="4" fill="#8b5cf6" /><circle cx="250" cy="186" r="4" fill="#8b5cf6" /><circle cx="330" cy="182" r="4" fill="#8b5cf6" /><circle cx="410" cy="184" r="4" fill="#8b5cf6" /><circle cx="490" cy="185" r="4" fill="#8b5cf6" />
                  </svg>
                </div>
                
                <div className="chart-x-axis">
                  <div className="chart-x-label">May 10</div>
                  <div className="chart-x-label">May 11</div>
                  <div className="chart-x-label">May 12</div>
                  <div className="chart-x-label">May 13</div>
                  <div className="chart-x-label">May 14</div>
                  <div className="chart-x-label">May 15</div>
                  <div className="chart-x-label">May 16</div>
                </div>

                <div className="chart-legend">
                  <div className="legend-item"><span className="legend-dot legend-item-marker-blue"></span>Moisture (%)</div>
                  <div className="legend-item"><span className="legend-dot legend-item-marker-orange"></span>Temperature (°C)</div>
                  <div className="legend-item"><span className="legend-dot legend-item-marker-green"></span>Humidity (%)</div>
                  <div className="legend-item"><span className="legend-dot legend-item-marker-purple"></span>pH</div>
                </div>
              </div>
              
              {/* Agriculture AI Recommendations */}
              <div className="content-panel">
                <div className="panel-header-container">
                  <span className="panel-title">Smart Recommendations</span>
                </div>
                
                <div className="advisory-list">
                  <div className="advisory-item">
                    <div className="advisory-icon-box advisory-icon-crop">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M12 20V10M18 6l-6 4-6-4"/></svg>
                    </div>
                    <div>
                      <div className="advisory-badge-layout">
                        <span className="advisory-tag advisory-tag-crop">Recommended Crop</span>
                      </div>
                      <div className="advisory-heading">Rice (Paddy)</div>
                      <p className="advisory-body">Best suitable crop for current high moisture and balanced soil conditions.</p>
                    </div>
                  </div>

                  <div className="advisory-item">
                    <div className="advisory-icon-box advisory-icon-fertilizer">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                    <div>
                      <span className="advisory-tag advisory-tag-fertilizer">Fertilizer Recommendation</span>
                      <div className="advisory-heading">Urea</div>
                      <p className="advisory-body">Apply 50 kg/acre for better nitrogen content yield based on NPK trends.</p>
                    </div>
                  </div>

                  <div className="advisory-item">
                    <div className="advisory-icon-box advisory-icon-irrigation">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z"/></svg>
                    </div>
                    <div>
                      <span className="advisory-tag advisory-tag-irrigation">Irrigation Suggestion</span>
                      <div className="advisory-heading">{latestData.soil_moisture < 30 ? "Irrigate Immediately!" : "Irrigate in 2 Days"}</div>
                      <p className="advisory-body">{latestData.soil_moisture < 30 ? "Soil moisture levels have fallen critical. Powering irrigation vectors." : "Current soil moisture is moderate. Keep automated systems on standby loop."}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FIELD OVERVIEW DATA TABLES */}
            <div className="dashboard-layout-row">
              <div className="content-panel">
                <div className="panel-header-container">
                  <span className="panel-title">Field Overview</span>
                  <a href="#all-fields" className="field-header-link">View All Fields</a>
                </div>
                
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Field Name</th><th>Location</th><th>Area</th><th>Last Updated</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="cell-emphasized">Field 1</td><td>North Farm</td><td>2.5 Acre</td><td>Just Now</td><td><span className="table-status-pill pill-status-good"><span className="status-bullet-small">●</span> Good</span></td>
                    </tr>
                    <tr>
                      <td className="cell-emphasized">Field 2</td><td>East Farm</td><td>3.0 Acre</td><td>May 16, 2025 09:28 AM</td><td><span className="table-status-pill pill-status-mod"><span className="status-bullet-small">●</span> Moderate</span></td>
                    </tr>
                    <tr>
                      <td className="cell-emphasized">Field 3</td><td>West Farm</td><td>1.8 Acre</td><td>May 16, 2025 09:27 AM</td><td><span className="table-status-pill pill-status-poor"><span className="status-bullet-small">●</span> Poor</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="right-side-column-layout">
                <div className="content-panel panel-spacer-bottom">
                  <span className="panel-title">Soil Health Score</span>
                  <div className="health-score-wrapper">
                    <div className="radial-svg-box">
                      <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                        <circle cx="60" cy="60" r="50" fill="none" stroke="#16a34a" strokeWidth="10" strokeDasharray="314" strokeDashoffset={314 - (314 * (latestData.soil_moisture > 0 ? 78 : 0)) / 100} strokeLinecap="round" transform="rotate(-90 60 60)" />
                      </svg>
                      <div className="radial-center-text">
                        <span className="radial-center-text-score">78%</span>
                        <span className="radial-center-text-status">Good</span>
                      </div>
                    </div>
                    <div className="health-summary-details">
                      <p>Your soil is in good condition for farming. Nitrogen indexes look consistent.</p>
                      <button className="health-details-action-btn">View Details</button>
                    </div>
                  </div>
                </div>

                <div className="content-panel">
                  <span className="panel-title quick-actions-headline">Quick Actions</span>
                  <div className="actions-grid">
                    <a href="#live-telemetry" className="action-btn" onClick={(e) => { e.preventDefault(); setActiveTab('live-data'); }}>
                      <span className="action-icon-container">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                      </span>
                      <span>View Live Data</span>
                    </a>
                    <a href="#new-field" className="action-btn"><span className="action-icon-container"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg></span><span>Add New Field</span></a>
                    <a href="#download" className="action-btn"><span className="action-icon-container"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4M7 10l5 5 5-5M12 15V3"/></svg></span><span>Download Report</span></a>
                    <a href="#generate" className="action-btn"><span className="action-icon-container"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></span><span>Generate Report</span></a>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <h2>{activeTab.replace('-', ' ').toUpperCase()} Component Panel</h2>
            <p>AgroSense feature framework dashboard node online.</p>
          </div>
        )}

        {/* FOOTER */}
        <footer className="dashboard-footer">
          <div>© 2026 AgroSense. All rights reserved. Built for Bharatpur Agritech Portal.</div>
          <div className="footer-compliance-row">
            <span>Empowering Farmers with Data</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
        </footer>

      </main>
    </div>
  );
}

export default App;