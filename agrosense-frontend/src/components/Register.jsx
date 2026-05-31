import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Register.css'; // Connects directly to your custom Register.css file

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Account created! Redirecting to login...' });
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Registration failed.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Unable to connect to server.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-container">
      {/* BRANDING SIDEBAR PANEL */}
      <div className="reg-sidebar">
        <div>
          <div className="reg-logo">🌱 AgroSense</div>
          <p className="reg-tagline">Smart Soil. Better Harvests.</p>
        </div>
        
        <div className="reg-sidebar-center">
          <h1 className="reg-sidebar-title">Join AgroSense Today.</h1>
          <p className="reg-sidebar-text">
            Start tracking real-time smart soil metrics, field history logs, and automated farming suggestions.
          </p>
        </div>
        
        {/* <div className="reg-sidebar-footer">📍 Bharatpur, Chitwan • Node Status: Standby</div> */}
      </div>

      {/* FORM INPUT PANEL */}
      <div className="reg-form-panel">
        <div className="reg-form-card">
          <div className="reg-header-group">
            <h2 className="reg-form-title">Create Farmer Account</h2>
            <p className="reg-form-subtitle">Register your details to get started.</p>
          </div>

          {message.text && (
            <div className={`reg-alert-message ${message.type === 'success' ? 'reg-alert-success' : 'reg-alert-error'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="reg-form">
            <div className="reg-input-group">
              <label className="reg-label">Username</label>
              <input 
                name="username" 
                type="text" 
                required 
                value={formData.username}
                onChange={handleChange} 
                className="reg-input" 
                placeholder="farmer123" 
              />
            </div>
            
            <div className="reg-input-group">
              <label className="reg-label">Email</label>
              <input 
                name="email" 
                type="email" 
                required 
                value={formData.email}
                onChange={handleChange} 
                className="reg-input" 
                placeholder="farmer@example.com" 
              />
            </div>
            
            <div className="reg-input-group">
              <label className="reg-label">Password</label>
              <input 
                name="password" 
                type="password" 
                required 
                value={formData.password}
                onChange={handleChange} 
                className="reg-input" 
                placeholder="••••••••" 
              />
            </div>

            <button type="submit" disabled={loading} className="reg-button">
              {loading ? 'Creating Account...' : 'Register Account'}
            </button>
          </form>

          <p className="reg-footer-text">
            Already have an account?{' '}
            <span onClick={() => navigate('/login')} className="reg-login-link">Log In</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;