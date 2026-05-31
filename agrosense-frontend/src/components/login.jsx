import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/login.css'; // Perfectly loads your separate CSS file

const Login = ({ onLoginSuccess }) => { 
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/token/', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        localStorage.setItem('username', credentials.username);
        if (onLoginSuccess) onLoginSuccess();
       if (data.is_superuser || data.is_staff) {
        // Force the browser out of the local React App domain directly into Django Admin
        window.location.href = 'http://127.0.0.1:8000/admin/';
      } else {
        // Standard farmers and device tracking nodes go to the telemetry React view
        navigate('/dashboard');
      }
      } else {
        setError(data.detail || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Cannot connect to the Django server. Is your backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* LEFT SIDE: Brand Branding Panel */}
      <div className="auth-sidebar">
        <div>
          <div className="auth-logo">🌱 AgroSense</div>
          <p className="auth-tagline">Smart Soil. Better Harvests.</p>
        </div>

        <div className="auth-sidebar-center">
          <h1 className="auth-sidebar-title">Monitor Your Fields With Precision.</h1>
          <p className="auth-sidebar-text">
            Log in to access real-time IoT soil analytics, personalized crop recommendations, and smart irrigation advisories tailored for your land.
          </p>
        </div>

        {/* <div className="auth-sidebar-footer">📍 Bharatpur, Chitwan • System Status: Operational</div> */}
      </div>

      {/* RIGHT SIDE: Login Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-header-group">
            <h2 className="auth-form-title">Welcome Back, Farmer</h2>
            <p className="auth-form-subtitle">Enter your credentials to manage your agricultural analytics.</p>
          </div>

          {error && (
            <div className="auth-error-alert">
              <p style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>Authentication Failed</p>
              <p>{error}</p>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <label className="auth-label">Username or Email Address</label>
              <input
                name="username"
                type="text"
                required
                value={credentials.username}
                onChange={handleChange}
                className="auth-input"
                placeholder="farmer123"
              />
            </div>

            <div className="auth-input-group">
              <div className="auth-password-header">
                <label className="auth-label">Password</label>
                <a href="#" className="auth-forgot-link">Forgot password?</a>
              </div>
              <input
                name="password"
                type="password"
                required
                value={credentials.password}
                onChange={handleChange}
                className="auth-input"
                placeholder="••••••••"
              />
            </div>

            <div className="auth-remember-group">
              <input type="checkbox" id="remember-me" className="auth-checkbox" />
              <label htmlFor="remember-me" className="auth-checkbox-label">Remember this device</label>
            </div>

            <button type="submit" disabled={loading} className="auth-button">
              {loading ? "Signing in..." : "Access Dashboard"}
            </button>
          </form>
          
          <div className="auth-footer-text">
            Don't have an account registered for your field hardware?{' '}
            <span onClick={() => navigate('/register')} className="auth-register-link">Register Here</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;