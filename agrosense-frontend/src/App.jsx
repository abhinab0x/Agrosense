import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MetricCard from './components/MetricCard';
import LiveDataView from './components/LiveDataView';
import Register from './components/Register';
import Login from './components/login';
import CropSuggestion from './components/CropSuggestion.jsx';
import IrrigationAdvisory from './components/IrrigationAdvisory';
import AlertsPage from './components/AlertsPage.jsx';
import BellDropdown from './components/BellDropdown.jsx';
import FertilizerForm from './components/FertilizerForm.jsx';
import SoilTrendChart from './components/SoilTrendChart';
import RecommendationsPanel from './components/RecommendationsPanel';
import FieldOverview from './components/FieldOverview';
import SoilHealthScore from './components/SoilHealthScore';
import History from './components/History';
import Report from './components/Report';
import FieldSwitcher from './components/FieldSwitcher';
import { apiFetch, CROP_BASELINES_ENDPOINT } from './utils/api'; import { initialSensorData } from './data/mockData';
import './App.css';

const API = 'http://127.0.0.1:8000';

function MainDashboardLayout({
  activeTab, setActiveTab, username, handleLogout,
  renderMainContent, alerts, onDismissOne, onDismissAll,
  sidebarOpen, onToggleSidebar, onCloseSidebar,
  fields, selectedFieldId, onSelectField, onCreateField,
}) {
  return (
    <div className="app-container">
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={onCloseSidebar} />
      )}

      <Sidebar
        currentTab={activeTab}
        changeTab={(tab) => {
          setActiveTab(tab);
          onCloseSidebar();
        }}
        isOpen={sidebarOpen}
        onClose={onCloseSidebar}
      />

      <main className="main-content">
        <header className="top-header">
          <div className="header-left-group">
            <button className="menu-toggle-btn" onClick={onToggleSidebar}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="#1e293b" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
            <div className="header-search-wrapper">
              <input
                type="text"
                placeholder="Search anything..."
                className="header-search-input"
              />
            </div>
          </div>

          <div className="header-actions-group">
            <FieldSwitcher
              fields={fields}
              selectedFieldId={selectedFieldId}
              onSelectField={onSelectField}
              onCreateField={onCreateField}
            />

            <BellDropdown
              alerts={alerts}
              onDismissOne={onDismissOne}
              onDismissAll={onDismissAll}
            />

            <div
              className="profile-widget-container">
              <div className="profile-identity-text">
                <div className="greeting">Hi, {username}</div>
                <button
                  className="signout-action-btn"
                  onClick={handleLogout}
                  title="Click to securely log out"
                >
                  <span>Sign Out</span>
                  <span className="signout-icon">🚪</span>
                </button>
              </div>
              <div className="profile-avatar-frame">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                  alt="Farmer Profile"
                />
              </div>
            </div>
          </div>
        </header>

        {renderMainContent()}

        <footer className="dashboard-footer">
          <div>© 2026 AgroSense. All rights reserved. Built for Bharatpur Agritech Portal.</div>
          <div className="footer-compliance-row">
            Empowering Farmers with Data <span>🌱</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

function App() {
  const [sensorReadings, setSensorReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [username, setUsername] = useState('Farmer');
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('accessToken')
  );

  const [alerts, setAlerts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [fields, setFields] = useState([]);
  const [fieldsLoaded, setFieldsLoaded] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState(
    localStorage.getItem('selectedFieldId') || null
  );

  const [cropMetricsSummary, setCropMetricsSummary] = useState(null);
  const [alternativeCrops, setAlternativeCrops] = useState([]);

  // ---------- Fields ----------
  const fetchFields = () => {
    apiFetch('/api/fields/')
      .then((r) => (r.ok ? r.json() : Promise.reject('Fields fetch failed')))
      .then((data) => {
        setFields(data);
        setFieldsLoaded(true);
        setSelectedFieldId((prev) => {
          const stillValid = data.some((f) => String(f.id) === String(prev));
          if (stillValid) return prev;
          const fallback = data.length ? String(data[0].id) : null;
          if (fallback) localStorage.setItem('selectedFieldId', fallback);
          return fallback;
        });
      })
      .catch((err) => {
        console.error('Fields Fetch Error:', err);
        setFieldsLoaded(true);
      });
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchFields();
  }, [isAuthenticated]);

  const handleSelectField = (fieldId) => {
    setSelectedFieldId(fieldId);
    localStorage.setItem('selectedFieldId', fieldId);
  };

  const handleCreateField = ({ name, location, area }) => {
    apiFetch('/api/fields/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, location, area }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject('Field create failed')))
      .then((newField) => {
        setFields((prev) => [newField, ...prev]);
        handleSelectField(String(newField.id));
      })
      .catch((err) => console.error('Create Field Error:', err));
  };

  // ---------- Alerts ----------
  const fetchAlerts = () => {
    apiFetch('/api/alerts/list/')
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => setAlerts(data))
      .catch(() => { });
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchAlerts();
    const id = setInterval(fetchAlerts, 15000);
    return () => clearInterval(id);
  }, [isAuthenticated]);

  const handleDismissOne = (id) => {
    apiFetch(`/api/alerts/read/${id}/`, { method: 'PATCH' })
      .then(() => fetchAlerts());
  };

  const handleDismissAll = () => {
    apiFetch('/api/alerts/clear-all/', { method: 'POST' })
      .then(() => setAlerts([]));
  };

  // ---------- Auth ----------
  useEffect(() => {
    if (isAuthenticated) {
      const name = localStorage.getItem('username');
      if (name) setUsername(name.charAt(0).toUpperCase() + name.slice(1));
    } else {
      setUsername('Farmer');
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = () => setIsAuthenticated(true);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('selectedFieldId');
    setIsAuthenticated(false);
    setFields([]);
    setFieldsLoaded(false);
    setSelectedFieldId(null);
  };

  // ---------- Sensor data (field-scoped) ----------
  useEffect(() => {
    if (!isAuthenticated || !selectedFieldId) {
      if (!isAuthenticated || fieldsLoaded) setLoading(false);
      return;
    }

    const fetchSensorData = () => {
      apiFetch(`/api/sensors/?field_id=${selectedFieldId}`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
  console.log("API Sensor Data:", data);
  console.log("First sensor object:", data[0]);
  console.log("recommended_crop:", data[0]?.recommended_crop);

  setSensorReadings(data);
  setLoading(false);
})
        .catch(() => {
          setSensorReadings((prev) => (prev.length > 0 ? prev : (initialSensorData || [])));
          setLoading(false);
        });
    };

    fetchSensorData();
    const id = setInterval(fetchSensorData, 5000);
    return () => clearInterval(id);
  }, [isAuthenticated, selectedFieldId, fieldsLoaded]);

  useEffect(() => {
    if (!isAuthenticated) return;

    apiFetch('/api/crop-baselines/')
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch crop baselines'))
      .then(data => setCropMetricsSummary(data))
      .catch(err => console.error("Crop baselines load error:", err));
  }, [isAuthenticated]);

  // --- INSERTED HERE: Watch latest telemetry and map alternative crops ---
  useEffect(() => {
    if (!sensorReadings || sensorReadings.length === 0) return;

    const latestLog = sensorReadings[0];
    console.log("Current latestLog:", latestLog);
    console.log("Recommended Crop:", latestLog?.recommended_crop);
    const currentCrop = (latestLog?.recommended_crop || "coconut").toLowerCase().trim();

    let alternatives = [];
    if (currentCrop === "coconut") {
      alternatives = [
        { name: "Banana / Papaya", reason: "Excellent short-term fruit companions that thrive under high humidity." },
        { name: "Ginger / Turmeric", reason: "Shade-tolerant root spices that utilize empty under-canopy floor rows." }
      ];
    } else if (currentCrop === "rice") {
      alternatives = [
        { name: "Black Gram", reason: "Fixes structural nitrogen levels during dry paddy rotation intervals." }
      ];
    } else {
      alternatives = [
        { name: "Soybean", reason: "An excellent rotational legume choice to re-enrich field mineral beds naturally." }
      ];
    }
    setAlternativeCrops(alternatives);
  }, [sensorReadings]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Still figuring out whether the user is logged in / has fields
  if (isAuthenticated && !fieldsLoaded) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', backgroundColor: '#f8fafc',
        color: '#1e293b', fontFamily: 'sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: 10 }}>Connecting to AgroSense Node Matrix... 🌱</h2>
          <p style={{ color: '#64748b' }}>
            Establishing handshake with Django REST framework
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && fieldsLoaded && fields.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        height: '100vh', backgroundColor: '#f8fafc', color: '#1e293b',
        fontFamily: 'sans-serif', padding: 24, textAlign: 'center',
      }}>
        <h2 style={{ marginBottom: 10 }}>No fields yet 🌱</h2>
        <p style={{ color: '#64748b', marginBottom: 20 }}>
          Add your first field to start receiving sensor data.
        </p>
        <button
          style={{
            padding: '10px 20px', borderRadius: 8, border: 'none',
            background: '#16a34a', color: '#fff', fontWeight: 600, cursor: 'pointer',
          }}
          onClick={() => {
            const name = prompt('Field name (e.g. North Farm):');
            if (name) handleCreateField({ name, location: '', area: '' });
          }}
        >
          + Add Field
        </button>

        <button
          style={{
            marginTop: 16, background: 'none', border: 'none',
            color: '#94a3b8', fontSize: 13, textDecoration: 'underline', cursor: 'pointer',
          }}
          onClick={handleLogout}
        >
          Sign Out
        </button>
      </div>
    );
  }

  if (isAuthenticated && loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', backgroundColor: '#f8fafc',
        color: '#1e293b', fontFamily: 'sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: 10 }}>Connecting to AgroSense Node Matrix... 🌱</h2>
          <p style={{ color: '#64748b' }}>
            Establishing handshake with Django REST framework
          </p>
        </div>
      </div>
    );
  }

  console.log("sensorReadings:", sensorReadings);
  console.log("Is Array?", Array.isArray(sensorReadings));

  const latestData = sensorReadings[0] || {
    soil_moisture: 0,
    temperature: 0,
    humidity: 0,
    soil_ph: 7.0,
    nitrogen: 0,
    phosphorus: 0,      
    potassium: 0,
  };

  const history = (key) =>
    sensorReadings.slice(0, 20).reverse().map((r) => Number(r[key]) || 0);

  const renderMainContent = () => {
    if (activeTab === 'live-data') return <LiveDataView selectedFieldId={selectedFieldId} />;
    if (activeTab === 'crop-suggestion') return <CropSuggestion selectedFieldId={selectedFieldId} />;
    if (activeTab === 'irrigation-advisor') return <IrrigationAdvisory selectedFieldId={selectedFieldId} />;
    if (activeTab === 'fertilizer-suggestion') return <FertilizerForm selectedFieldId={selectedFieldId} />;

    if (activeTab === 'recommendations') return <RecommendationsPanel latestData={latestData} selectedFieldId={selectedFieldId} />;
    if (activeTab === 'reports') {
      console.log("latestData =", latestData);
      console.log("recommended_crop =", latestData?.recommended_crop);

      return (
        <Report
          sensorReadings={sensorReadings}
          selectedFieldId={selectedFieldId}
          cropMetricsSummary={cropMetricsSummary}
          alternativeCropsList={alternativeCrops}
          recommendedCrop={latestData?.recommended_crop}
        />
      );
    }
    if (activeTab === 'history') return <History selectedFieldId={selectedFieldId} />;

    if (activeTab === 'alerts') {
      return (
        <AlertsPage
          alerts={alerts}
          onDismissOne={handleDismissOne}
          onDismissAll={handleDismissAll}
        />
      );
    }

    if (activeTab === 'dashboard') {
      return (
        <>
          <div
            className="welcome-banner"
            style={{ backgroundImage: `url(/farm-banner.jpg)` }}
          >
            <div>
              <h1 className="banner-title">Welcome to AgroSense 🌱</h1>
              <p className="banner-subtitle">
                IoT-Based Smart Soil Monitoring and Crop Recommendation System
              </p>
            </div>
            <div className="system-status-pill">
              <span className="status-indicator-dot">●</span>
              <span>System Status: <strong>Live Django Backend Connected</strong></span>
            </div>
          </div>

          <section className="metrics-grid">
            <MetricCard
              title="Soil Moisture"
              value={latestData.soil_moisture}
              unit="%"
              status={latestData.soil_moisture < 30 ? 'Dry' : 'Moderate'}
              iconBg="#eff6ff"
              sparklineColor="#3b82f6"
              history={history('soil_moisture')}
              iconSvg={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="#2563eb" strokeWidth="2.5">
                  <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z" />
                </svg>
              }
            />
            <MetricCard
              title="Temperature"
              value={latestData.temperature}
              unit="°C"
              status="Normal"
              iconBg="#fff5f5"
              sparklineColor="#ef4444"
              history={history('temperature')}
              iconSvg={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="#dc2626" strokeWidth="2.5">
                  <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
                </svg>
              }
            />
            <MetricCard
              title="Humidity"
              value={latestData.humidity}
              unit="%"
              status="Normal"
              iconBg="#f0fdf4"
              sparklineColor="#10b981"
              history={history('humidity')}
              iconSvg={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="#16a34a" strokeWidth="2.5">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              }
            />
            <MetricCard
              title="Soil pH"
              value={latestData.soil_ph}
              unit=""
              status="Slightly Acidic"
              iconBg="#f5f3ff"
              sparklineColor="#8b5cf6"
              history={history('soil_ph')}
              iconSvg={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="#7c3aed" strokeWidth="2.5">
                  <path d="M10 2v8L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45L14 10V2z" />
                </svg>
              }
            />
            <MetricCard
              title="NPK (N-P-K)"
              value={`${latestData.nitrogen || 0}-${latestData.phosphorus || 0}-${latestData.potassium || 0}`}
              unit=""
              status="Good"
              iconBg="#ecfdf5"
              sparklineColor="#10b981"
              history={history('nitrogen')}
              iconSvg={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="#059669" strokeWidth="2.5">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                </svg>
              }
            />
          </section>

          <div className="dashboard-layout-row">
            <SoilTrendChart readings={sensorReadings} />

            <div className="right-side-column-layout">
              <RecommendationsPanel latestData={latestData} selectedFieldId={selectedFieldId} />

              <div className="alerts-preview-card panel-spacer-bottom">
                <div className="card-header-row">
                  <h3>Recent Alerts</h3>
                  <a className="field-header-link" onClick={() => setActiveTab('alerts')}>
                    View All
                  </a>
                </div>
                {alerts.length === 0 && (
                  <p className="empty-state-text">No alerts right now.</p>
                )}
                {alerts.slice(0, 3).map((a) => (
                  <div key={a.id} className="alert-row">
                    <div>{a.message}</div>
                    <div className="alert-time">
                      {new Date(a.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dashboard-layout-row">
            <FieldOverview fields={fields} selectedFieldId={selectedFieldId} onSelectField={handleSelectField} />

            <div className="right-side-column-layout">
              <SoilHealthScore latestData={latestData} />

              <div className="quick-actions-card">
                <span className="quick-actions-headline">Quick Actions</span>
                <div className="quick-actions-grid">
                  <button className="quick-action-btn" onClick={() => setActiveTab('live-data')}>
                    View Live Data
                  </button>
                  <button className="quick-action-btn" onClick={() => setActiveTab('fertilizer-suggestion')}>
                    Fertilizer Suggestion
                  </button>
                  <button
                    className="quick-action-btn"
                    onClick={() => window.open(`${API}/api/reports/download/`, '_blank')}
                  >
                    Download Report
                  </button>
                  <button className="quick-action-btn" onClick={() => setActiveTab('irrigation-advisor')}>
                    Irrigation Advisor
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }

    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
        <h2>{activeTab.replace('-', ' ').toUpperCase()} Panel</h2>
        <p style={{ marginTop: 10, color: '#94a3b8' }}>
          This section is wired to the menu but view code is pending.
        </p>
      </div>
    );
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            !isAuthenticated
              ? <Login onLoginSuccess={handleLoginSuccess} />
              : <Navigate to="/dashboard" replace />
          }
        />
        <Route
          path="/register"
          element={
            !isAuthenticated
              ? <Register />
              : <Navigate to="/dashboard" replace />
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated
              ? <MainDashboardLayout
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                username={username}
                handleLogout={handleLogout}
                renderMainContent={renderMainContent}
                alerts={alerts}
                onDismissOne={handleDismissOne}
                onDismissAll={handleDismissAll}
                sidebarOpen={sidebarOpen}
                onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
                onCloseSidebar={() => setSidebarOpen(false)}
                fields={fields}
                selectedFieldId={selectedFieldId}
                onSelectField={handleSelectField}
                onCreateField={handleCreateField}
              />
              : <Navigate to="/login" replace />
          }
        />
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;