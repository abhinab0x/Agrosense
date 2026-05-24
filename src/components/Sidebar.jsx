import React from 'react';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2z"/><path d="M9 22v-4h4"/></svg>
          <span>AgroSense</span>
        </div>
        <div className="sidebar-tagline">Smart Soil. Better Harvests.</div>
        
        <ul className="sidebar-menu">
          <li>
            <a href="#dashboard" className="menu-item active">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a href="#telemetry" className="menu-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
              <span>Live Data</span>
            </a>
          </li>
          <li>
            <a href="#fields" className="menu-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h18v18H3z"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>
              <span>Field Overview</span>
            </a>
          </li>
          <li>
            <a href="#recommendations" className="menu-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c5.523 0 10-4.477 10-12S17.523 2 12 2 2 4.477 2 10s4.477 12 10 12z"/><path d="m9 10 2 2 4-4"/></svg>
              <span>Recommendations</span>
            </a>
          </li>
          <li>
            <a href="#crop" className="menu-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10M18 6l-6 4-6-4"/></svg>
              <span>Crop Suggestion</span>
            </a>
          </li>
          <li>
            <a href="#fertilizer" className="menu-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span>Fertilizer Suggestion</span>
            </a>
          </li>
          <li>
            <a href="#irrigation" className="menu-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z"/></svg>
              <span>Irrigation Advisor</span>
            </a>
          </li>
          <li>
            <a href="#history" className="menu-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <span>History</span>
            </a>
          </li>
          <li>
            <a href="#alerts" className="menu-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span>Alerts</span>
            </a>
          </li>
          <li>
            <a href="#reports" className="menu-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
              <span>Reports</span>
            </a>
          </li>
          <li>
            <a href="#profile" className="menu-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>Profile</span>
            </a>
          </li>
          <li>
            <a href="#settings" className="menu-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              <span>Settings</span>
            </a>
          </li>
        </ul>
      </div>

      <div className="sidebar-weather">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
          <span style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>28°C</span>
        </div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>Bharatpur, Chitwan</div>
        <div style={{ fontSize: '11px', color: '#a7f3d0', marginTop: '2px' }}>Sunny • Humidity: 60%</div>
        <div style={{ fontSize: '11px', color: '#a7f3d0' }}>Wind: 12 km/h</div>
      </div>
    </aside>
  );
}

export default Sidebar;