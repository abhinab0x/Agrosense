import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MetricCard from './components/MetricCard';
import LiveDataView from './components/LiveDataView'; 
import Register from './components/Register';
import Login from './components/login';
import CropSuggestion from './components/CropSuggestion.jsx';
import { initialSensorData } from './data/mockData';
import './App.css'; 

function App() {
  // DJANGO BACKEND CONNECTION STATES 
  const [sensorReadings, setSensorReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Main Tab Routing State Manager
  const [activeTab, setActiveTab] = useState('dashboard');
  const [username, setUsername] = useState('Farmer');

  // Tracks if the user has a valid Django JWT token saved in their browser
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('accessToken')
  );

  useEffect(() => {
    if (isAuthenticated) {
      const storedName = localStorage.getItem('username');
      if (storedName) {
        // Capitalize the first letter dynamically for clean UI presentation
        setUsername(storedName.charAt(0).toUpperCase() + storedName.slice(1));
      }
    } else {
      setUsername('Farmer'); // Reset to fallback on logout
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
  };

  useEffect(() => {
    // Only query data from your Django API if the user has authenticated successfully
    if (!isAuthenticated) return;
    
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

    // 2. Background polling loop fetches fresh database records every 5 seconds (5000ms)
    const dataPollingInterval = setInterval(() => {
      fetchSensorData();
    }, 5000);

    // 3. Mandatory clean-up block to stop the polling routine when the React component structure changes
    return () => clearInterval(dataPollingInterval);
  }, [isAuthenticated]);

  // Handle loading state while fetching database matrix rows on initial boot layout
  if (isAuthenticated && loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc', color: '#1e293b', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '10px' }}>Connecting to AgroSense Node Matrix... 🌱</h2>
          <p style={{ color: '#64748b' }}>Establishing handshake pipeline with Django REST framework backend</p>
        </div>
      </div>
    );
  }

  // Target index 0: If database is initialized but empty, it applies standard baseline fallbacks
  const latestData = sensorReadings[0] || {
    soil_moisture: 0,
    temperature: 0,
    humidity: 0,
    soil_ph: 7.0,
    nitrogen: 0,
    phosphorus: 0,
    potassium: 0
  };

  // Modern React Best Practice: Inline layout mapping safely captures contextual parent component states
  const renderMainContent = () => {
    if (activeTab === 'live-data') {
      return <LiveDataView />;
    }
    
    if (activeTab === 'crop-suggestion') {
      return <CropSuggestion />;
    }
    
    if (activeTab === 'dashboard') {
      return (
        <>
          <div className="welcome-banner">
            <div>
              <h1 className="banner-title">Welcome to AgroSense 🌱</h1>
              <p className="banner-subtitle">IoT-Based Smart Soil Monitoring and Crop Recommendation System</p>
            </div>
            <div className="system-status-pill">
              <span className="status-indicator-dot">●</span>
              <span>System Status: <strong>Live Django Backend Connected</strong></span>
            </div>
          </div>

          <section className="metrics-grid">
            <MetricCard title="Soil Moisture" value={latestData.soil_moisture} unit="%" status={latestData.soil_moisture < 30 ? "Dry" : "Moderate"} iconBg="#eff6ff" sparklineColor="#3b82f6" iconSvg={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5"><path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z"/></svg>} />
            <MetricCard title="Temperature" value={latestData.temperature} unit="°C" status="Normal" iconBg="#fff5f5" sparklineColor="#ef4444" iconSvg={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>} />
            <MetricCard title="Humidity" value={latestData.humidity} unit="%" status="Normal" iconBg="#f0fdf4" sparklineColor="#10b981" iconSvg={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} />
            <MetricCard title="Soil pH" value={latestData.soil_ph} unit="" status="Slightly Acidic" iconBg="#f5f3ff" sparklineColor="#8b5cf6" iconSvg={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5"><path d="M10 2v8L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45L14 10V2z"/></svg>} />
            <MetricCard title="NPK (N-P-K)" value={`${latestData.nitrogen || 0}-${latestData.phosphorus || 0}-${latestData.potassium || 0}`} unit="" status="Good" iconBg="#ecfdf5" sparklineColor="#10b981" iconSvg={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/></svg>} />
          </section>

          <div className="dashboard-layout-row">
            {/* Existing visual panels for trends, tables, and quick links map here */}
          </div>
        </>
      );
    }

    // Default under-construction state fallback
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        <h2>{activeTab.replace('-', ' ').toUpperCase()} Panel</h2>
        <p style={{ marginTop: '10px', color: '#94a3b8' }}>This section is wired to the menu but view code is pending.</p>
      </div>
    );
  };

  const MainDashboardLayout = () => (
    <div className="app-container">
      <Sidebar currentTab={activeTab} changeTab={setActiveTab} />
      
      <main className="main-content">
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
            
            <div className="profile-widget-container" onClick={handleLogout} style={{ cursor: 'pointer' }} title="Click to log out">
              <div className="profile-identity-text">
                <div className="greeting">Hi, {username}</div>
                <div className="user-role">Sign Out</div>
              </div>
              <div className="profile-avatar-frame">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Farmer Profile" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamically renders views inside your dashboard workspace frame */}
        {renderMainContent()}

        <footer className="dashboard-footer">
          <div>© 2026 AgroSense. All rights reserved. Built for Bharatpur Agritech Portal.</div>
        </footer>
      </main>
    </div>
  );

  return (
    <Router>
      <Routes>
        {/* Route 1: Login Portal */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/dashboard" replace />} 
        />

        {/* Route 2: Registration Portal */}
        <Route 
          path="/register" 
          element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />} 
        />

        {/* Route 3: Protected Dashboard App (Requires Token validation) */}
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <MainDashboardLayout /> : <Navigate to="/login" replace />} 
        />

        {/* Route 4: Catch-All Fallback Redirect */}
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;