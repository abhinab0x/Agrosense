import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MetricCard from './components/MetricCard';
import { initialSensorData } from './data/mockData';

function App() {
  const [sensorData] = useState(initialSensorData);

  return (
    <div className="app-container">
      <Sidebar />
      
      <main className="main-content">
        {/* 1. TOP INTERACTIVE NAVIGATION NAVBAR */}
        <header className="top-header">
          <div className="header-left-group">
            <button className="menu-toggle-btn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
            </button>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Search anything..." 
                style={{
                  width: '380px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  fontSize: '14px',
                  color: '#334155'
                }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span style={{ position: 'absolute', top: '-4px', right: '-2px', backgroundColor: '#ef4444', color: '#ffffff', fontSize: '9px', fontWeight: '700', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid #e2e8f0', paddingLeft: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '500', fontSize: '12px', color: '#64748b' }}>Welcome,</div>
                <div style={{ fontWeight: '700', fontSize: '14px', color: '#0c4a34' }}>Farmer</div>
              </div>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#fef08a', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1.5px solid #e2e8f0' }}>
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Farmer Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          </div>
        </header>

        {/* 2. SUMMARY DASHBOARD LANDSCAPE BANNER */}
        <div className="welcome-banner">
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '4px', letterSpacing: '-0.5px' }}>Welcome to AgroSense 🌱</h1>
            <p style={{ color: '#d1fae5', fontSize: '14px', fontWeight: '400' }}>IoT-Based Smart Soil Monitoring and Crop Recommendation System</p>
          </div>
          
          <div className="system-status-pill">
            <span style={{ color: '#4ade80', display: 'inline-block', animation: 'pulse 2s infinite' }}>●</span>
            <span>System Status: **All Systems Operational**</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" style={{ marginLeft: '4px' }}><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>
          </div>
        </div>

        {/* 3. LIVE PARAMETERS CARDS GRID ROW */}
        <section className="metrics-grid">
          <MetricCard 
            title="Soil Moisture"
            value="45"
            unit="%"
            status="Moderate"
            iconBg="#eff6ff"
            iconSvg={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5"><path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z"/></svg>}
            sparklineColor="#3b82f6"
            sparklinePoints="0,15 20,18 40,12 60,16 80,10 100,14 120,8"
          />

          <MetricCard 
            title="Temperature"
            value="28.6"
            unit="°C"
            status="Normal"
            iconBg="#fff5f5"
            iconSvg={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>}
            sparklineColor="#ef4444"
            sparklinePoints="0,12 20,14 40,11 60,15 80,12 100,13 120,11"
          />

          <MetricCard 
            title="Humidity"
            value="60"
            unit="%"
            status="Normal"
            iconBg="#f0fdf4"
            iconSvg={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
            sparklineColor="#10b981"
            sparklinePoints="0,15 20,10 40,12 60,8 80,13 100,11 120,14"
          />

          <MetricCard 
            title="Soil pH"
            value="6.8"
            unit=""
            status="Slightly Acidic"
            iconBg="#f5f3ff"
            iconSvg={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5"><path d="M10 2v8L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45L14 10V2z"/></svg>}
            sparklineColor="#8b5cf6"
            sparklinePoints="0,10 20,11 40,9 60,12 80,10 100,11 120,10"
          />

          <MetricCard 
            title="NPK (N-P-K)"
            value="40-30-35"
            unit=""
            status="Good"
            iconBg="#ecfdf5"
            iconSvg={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/></svg>}
            sparklineColor="#10b981"
            sparklinePoints="0,12 20,15 40,10 60,13 80,9 100,11 120,8"
          />
        </section>

        {/* 4. MIDDLE ROW CONTAINERS SPLIT (CHART & ADVANCED ADVISORY) */}
        <div className="dashboard-layout-row">
          
          {/* Soil Parameter Historical Vector Line Chart Grid */}
          <div className="content-panel">
            <div className="panel-header-container">
              <span className="panel-title">Soil Parameters Trend</span>
              <select style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: '600', color: '#475569', outline: 'none' }}>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            
            <div className="chart-container">
              {/* Y Axis Grid Increments */}
              <div className="chart-grid-line" style={{ top: '0%' }}><span className="chart-y-axis-label">100</span></div>
              <div className="chart-grid-line" style={{ top: '25%' }}><span className="chart-y-axis-label">75</span></div>
              <div className="chart-grid-line" style={{ top: '50%' }}><span className="chart-y-axis-label">50</span></div>
              <div className="chart-grid-line" style={{ top: '75%' }}><span className="chart-y-axis-label">25</span></div>
              <div className="chart-grid-line" style={{ top: '100%' }}><span className="chart-y-axis-label">0</span></div>
              
              {/* Core Interactive Line Graph Paths */}
              <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                {/* Moisture Line Vector (Blue) */}
                <polyline fill="none" stroke="#3b82f6" strokeWidth="2.5" points="10,110 90,100 170,105 250,112 330,103 410,98 490,106" />
                <circle cx="10" cy="110" r="4" fill="#3b82f6" /><circle cx="90" cy="100" r="4" fill="#3b82f6" /><circle cx="170" cy="105" r="4" fill="#3b82f6" /><circle cx="250" cy="112" r="4" fill="#3b82f6" /><circle cx="330" cy="103" r="4" fill="#3b82f6" /><circle cx="410" cy="98" r="4" fill="#3b82f6" /><circle cx="490" cy="106" r="4" fill="#3b82f6" />

                {/* Temperature Line Vector (Orange) */}
                <polyline fill="none" stroke="#f97316" strokeWidth="2.5" points="10,145 90,135 170,148 250,140 330,145 410,152 490,142" />
                <circle cx="10" cy="145" r="4" fill="#f97316" /><circle cx="90" cy="135" r="4" fill="#f97316" /><circle cx="170" cy="148" r="4" fill="#f97316" /><circle cx="250" cy="140" r="4" fill="#f97316" /><circle cx="330" cy="145" r="4" fill="#f97316" /><circle cx="410" cy="152" r="4" fill="#f97316" /><circle cx="490" cy="142" r="4" fill="#f97316" />

                {/* Humidity Line Vector (Green) */}
                <polyline fill="none" stroke="#10b981" strokeWidth="2.5" points="10,60 90,52 170,55 250,65 330,52 410,54 490,68" />
                <circle cx="10" cy="60" r="4" fill="#10b981" /><circle cx="90" cy="52" r="4" fill="#10b981" /><circle cx="170" cy="55" r="4" fill="#10b981" /><circle cx="250" cy="65" r="4" fill="#10b981" /><circle cx="330" cy="52" r="4" fill="#10b981" /><circle cx="410" cy="54" r="4" fill="#10b981" /><circle cx="490" cy="68" r="4" fill="#10b981" />

                {/* Soil pH Line Vector (Purple) */}
                <polyline fill="none" stroke="#8b5cf6" strokeWidth="2.5" points="10,185 90,187 170,183 250,186 330,182 410,184 490,185" />
                <circle cx="10" cy="185" r="4" fill="#8b5cf6" /><circle cx="90" cy="187" r="4" fill="#8b5cf6" /><circle cx="170" cy="183" r="4" fill="#8b5cf6" /><circle cx="250" cy="186" r="4" fill="#8b5cf6" /><circle cx="330" cy="182" r="4" fill="#8b5cf6" /><circle cx="410" cy="184" r="4" fill="#8b5cf6" /><circle cx="490" cy="185" r="4" fill="#8b5cf6" />
              </svg>
            </div>
            
            {/* Timeline Horizontal Label Array */}
            <div className="chart-x-axis">
              <div className="chart-x-label">May 10</div>
              <div className="chart-x-label">May 11</div>
              <div className="chart-x-label">May 12</div>
              <div className="chart-x-label">May 13</div>
              <div className="chart-x-label">May 14</div>
              <div className="chart-x-label">May 15</div>
              <div className="chart-x-label">May 16</div>
            </div>

            {/* Custom Interactive Graph Color Legends */}
            <div className="chart-legend">
              <div className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#3b82f6' }}></span>Moisture (%)</div>
              <div className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#f97316' }}></span>Temperature (°C)</div>
              <div className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#10b981' }}></span>Humidity (%)</div>
              <div className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#8b5cf6' }}></span>pH</div>
            </div>
          </div>
          
          {/* Smart Agriculture AI Recommendations Advisory */}
          <div className="content-panel">
            <div className="panel-header-container">
              <span className="panel-title">Smart Recommendations</span>
            </div>
            
            <div className="advisory-list">
              <div className="advisory-item">
                <div className="advisory-icon-box" style={{ backgroundColor: '#f0fdf4' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M12 20V10M18 6l-6 4-6-4"/></svg>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="advisory-tag" style={{ color: '#16a34a' }}>Recommended Crop</span>
                  </div>
                  <div className="advisory-heading">Rice (Paddy)</div>
                  <p className="advisory-body">Best suitable crop for current high moisture and balanced soil conditions.</p>
                </div>
              </div>

              <div className="advisory-item">
                <div className="advisory-icon-box" style={{ backgroundColor: '#fff7ed' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div>
                  <span className="advisory-tag" style={{ color: '#ea580c' }}>Fertilizer Recommendation</span>
                  <div className="advisory-heading">Urea</div>
                  <p className="advisory-body">Apply 50 kg/acre for better nitrogen content yield based on NPK trends.</p>
                </div>
              </div>

              <div className="advisory-item">
                <div className="advisory-icon-box" style={{ backgroundColor: '#eff6ff' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z"/></svg>
                </div>
                <div>
                  <span className="advisory-tag" style={{ color: '#2563eb' }}>Irrigation Suggestion</span>
                  <div className="advisory-heading">Irrigate in 2 Days</div>
                  <p className="advisory-body">Current soil moisture is moderate. Keep automated systems on standby loop.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. BOTTOM ROW WORKSPACE SPLIT (FIELD OVERVIEW DATA TABLES & ALERTS LIST) */}
        <div className="dashboard-layout-row">
          
          {/* Active Field Overview Database Matrix */}
          <div className="content-panel">
            <div className="panel-header-container">
              <span className="panel-title">Field Overview</span>
              <a href="#all-fields" style={{ color: '#16a34a', fontSize: '12px', fontWeight: '600', textDecoration: 'none' }}>View All Fields</a>
            </div>
            
            <table className="data-table">
              <thead>
                <tr>
                  <th>Field Name</th>
                  <th>Location</th>
                  <th>Area</th>
                  <th>Last Updated</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: '600' }}>Field 1</td>
                  <td>North Farm</td>
                  <td>2.5 Acre</td>
                  <td>May 16, 2025 09:30 AM</td>
                  <td><span className="table-status-pill" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}><span style={{ fontSize: '10px' }}>●</span> Good</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: '600' }}>Field 2</td>
                  <td>East Farm</td>
                  <td>3.0 Acre</td>
                  <td>May 16, 2025 09:28 AM</td>
                  <td><span className="table-status-pill" style={{ backgroundColor: '#fef9c3', color: '#a16207' }}><span style={{ fontSize: '10px' }}>●</span> Moderate</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: '600' }}>Field 3</td>
                  <td>West Farm</td>
                  <td>1.8 Acre</td>
                  <td>May 16, 2025 09:27 AM</td>
                  <td><span className="table-status-pill" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}><span style={{ fontSize: '10px' }}>●</span> Poor</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Health Score Circle Meter and Actions Array */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Health Score Component Panel */}
            <div className="content-panel" style={{ paddingBottom: '16px' }}>
              <span className="panel-title">Soil Health Score</span>
              <div className="health-score-wrapper">
                <div className="radial-svg-box">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#16a34a" strokeWidth="10" strokeDasharray="314" strokeDashoffset="69" strokeLinecap="round" transform="rotate(-90 60 60)" />
                  </svg>
                  <div className="radial-center-text">
                    <span style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>78%</span>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#16a34a', textTransform: 'uppercase' }}>Good</span>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', fontWeight: '500' }}>Your soil is in good condition for farming. Nitrogen indexes look consistent.</p>
                  <button style={{ marginTop: '10px', padding: '6px 12px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', borderRadius: '6px', fontSize: '12px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>View Details</button>
                </div>
              </div>
            </div>

            {/* Quick Diagnostic Actions Button Box */}
            <div className="content-panel">
              <span className="panel-title" style={{ display: 'block', marginBottom: '14px' }}>Quick Actions</span>
              <div className="actions-grid">
                <a href="#live-telemetry" className="action-btn">
                  <span className="action-icon-container">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                  </span>
                  <span>View Live Data</span>
                </a>
                <a href="#new-field" className="action-btn">
                  <span className="action-icon-container">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                  </span>
                  <span>Add New Field</span>
                </a>
                <a href="#download" className="action-btn">
                  <span className="action-icon-container">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4M7 10l5 5 5-5M12 15V3"/></svg>
                  </span>
                  <span>Download Report</span>
                </a>
                <a href="#generate" className="action-btn">
                  <span className="action-icon-container">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                  </span>
                  <span>Generate Report</span>
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* GLOBAL APPLICATION METADATA FOOTER ROW */}
        <footer className="dashboard-footer">
          <div>© 2026 AgroSense. All rights reserved. Built for Bharatpur Agritech Portal.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontWeight: '600' }}>
            <span>Empowering Farmers with Data</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
        </footer>

      </main>
    </div>
  );
}

export default App;