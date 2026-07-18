import { useState, useRef, useEffect } from 'react';
import './css/BellDropdown.css';

const SEVERITY_STYLE = {
  CRITICAL: { dot: '#ef4444', bg: '#fef2f2', border: '#fecaca', color: '#991b1b', label: 'Critical' },
  WARNING:  { dot: '#f59e0b', bg: '#fffbeb', border: '#fde68a', color: '#92400e', label: 'Warning'  },
  INFO:     { dot: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af', label: 'Info'     },
};

const TYPE_ICONS = {
  MOISTURE:    '💧',
  TEMPERATURE: '🌡️',
  IRRIGATION:  '🚿',
  PH:          '🧪',
  HUMIDITY:    '💨',
};

export default function BellDropdown({ alerts, onDismissOne, onDismissAll }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const unread = alerts.filter(a => !a.is_read).length;
  const recent = alerts.slice(0, 6);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="bell-dropdown-wrap">

      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
        className={`bell-dropdown-trigger ${open ? 'open' : ''}`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>

        {unread > 0 && (
          <span className="bell-dropdown-badge">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Tap-anywhere-to-close backdrop, mobile only (see CSS) */}
          <div className="bell-dropdown-backdrop" onClick={() => setOpen(false)} />

          <div className="bell-dropdown-panel">

            <div className="bell-dropdown-header">
              <div className="bell-dropdown-header-left">
                <span className="bell-dropdown-title">Notifications</span>
                {unread > 0 ? (
                  <span className="bell-dropdown-count-badge unread">
                    {unread} new
                  </span>
                ) : (
                  <span className="bell-dropdown-count-badge clear">
                    All clear
                  </span>
                )}
              </div>

              {alerts.length > 0 && (
                <button
                  onClick={() => { onDismissAll(); setOpen(false); }}
                  className="bell-dropdown-mark-all-btn"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="bell-dropdown-list">
              {recent.length === 0 ? (
                <div className="bell-dropdown-empty">
                  <div className="bell-dropdown-empty-icon">🔔</div>
                  <div className="bell-dropdown-empty-title">No notifications</div>
                  <div className="bell-dropdown-empty-subtitle">
                    All sensor readings are within safe thresholds
                  </div>
                </div>
              ) : (
                recent.map((alert, idx) => {
                  const s = SEVERITY_STYLE[alert.severity] || SEVERITY_STYLE.INFO;
                  const icon = TYPE_ICONS[alert.alert_type] || '⚠️';

                  return (
                    <div key={alert.id} className="bell-dropdown-item">
                      <div
                        className="bell-dropdown-item-icon"
                        style={{ background: s.bg, border: `1px solid ${s.border}` }}
                      >
                        {icon}
                      </div>

                      <div className="bell-dropdown-item-body">
                        <div className="bell-dropdown-item-top">
                          <span className="bell-dropdown-item-type">
                            {alert.alert_type}
                          </span>
                          <span
                            className="bell-dropdown-item-severity"
                            style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
                          >
                            {s.label}
                          </span>
                        </div>
                        <div className="bell-dropdown-item-message">
                          {alert.message}
                        </div>
                        <div className="bell-dropdown-item-time">
                          {new Date(alert.created_at).toLocaleTimeString([], {
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </div>
                      </div>

                      <button
                        onClick={() => onDismissOne(alert.id)}
                        aria-label="Dismiss"
                        className="bell-dropdown-item-dismiss"
                      >
                        ×
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {alerts.length > 6 && (
              <div className="bell-dropdown-footer">
                +{alerts.length - 6} more — open <strong>Alerts</strong> page to see all
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}