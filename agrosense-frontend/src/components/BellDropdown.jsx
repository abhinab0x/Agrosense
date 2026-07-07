import { useState, useRef, useEffect } from 'react';

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
    <div ref={ref} style={{ position: 'relative' }}>

      
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
        style={{
          position: 'relative',
          background: open ? '#f1f5f9' : 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 7,
          borderRadius: 8,
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.15s',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>

        
        {unread > 0 && (
          <span style={{
            position: 'absolute',
            top: 2, right: 2,
            minWidth: 16, height: 16,
            background: '#ef4444',
            color: '#fff',
            borderRadius: '50%',
            fontSize: 9,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #fff',
            padding: '0 2px',
            lineHeight: 1,
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: 348,
          maxHeight: 480,
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
          zIndex: 9999,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'system-ui, sans-serif',
        }}>

          
          <div style={{
            padding: '14px 16px 12px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fafafa',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                Notifications
              </span>
              {unread > 0 ? (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  background: '#fef2f2', color: '#ef4444',
                  border: '1px solid #fecaca',
                  borderRadius: 20, padding: '2px 7px',
                }}>
                  {unread} new
                </span>
              ) : (
                <span style={{
                  fontSize: 10, fontWeight: 600,
                  background: '#f0fdf4', color: '#16a34a',
                  border: '1px solid #bbf7d0',
                  borderRadius: 20, padding: '2px 7px',
                }}>
                  All clear
                </span>
              )}
            </div>

            {alerts.length > 0 && (
              <button
                onClick={() => { onDismissAll(); setOpen(false); }}
                style={{
                  fontSize: 12, fontWeight: 500,
                  color: '#64748b',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  padding: '4px 8px',
                  borderRadius: 6,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                Mark all read
              </button>
            )}
          </div>

          
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {recent.length === 0 ? (
              <div style={{
                padding: '44px 20px',
                textAlign: 'center',
                color: '#94a3b8',
              }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🔔</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>
                  No notifications
                </div>
                <div style={{ fontSize: 12 }}>
                  All sensor readings are within safe thresholds
                </div>
              </div>
            ) : (
              recent.map((alert, idx) => {
                const s = SEVERITY_STYLE[alert.severity] || SEVERITY_STYLE.INFO;
                const icon = TYPE_ICONS[alert.alert_type] || '⚠️';

                return (
                  <div
                    key={alert.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '12px 16px',
                      borderBottom: idx < recent.length - 1 ? '1px solid #f8fafc' : 'none',
                      transition: 'background 0.12s',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    
                    <div style={{
                      width: 34, height: 34,
                      borderRadius: 8,
                      background: s.bg,
                      border: `1px solid ${s.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 15,
                      flexShrink: 0,
                    }}>
                      {icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginBottom: 3,
                      }}>
                        <span style={{
                          fontSize: 12, fontWeight: 600,
                          color: '#0f172a',
                        }}>
                          {alert.alert_type}
                        </span>
                        <span style={{
                          fontSize: 10, fontWeight: 600,
                          color: s.color,
                          background: s.bg,
                          border: `1px solid ${s.border}`,
                          borderRadius: 4,
                          padding: '1px 5px',
                        }}>
                          {s.label}
                        </span>
                      </div>
                      <div style={{
                        fontSize: 12,
                        color: '#475569',
                        lineHeight: 1.45,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 210,
                      }}>
                        {alert.message}
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: '#94a3b8',
                        marginTop: 3,
                      }}>
                        {new Date(alert.created_at).toLocaleTimeString([], {
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </div>
                    </div>

                    
                    <button
                      onClick={() => onDismissOne(alert.id)}
                      aria-label="Dismiss"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#cbd5e1',
                        fontSize: 18,
                        lineHeight: 1,
                        padding: '2px 4px',
                        flexShrink: 0,
                        borderRadius: 4,
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#64748b'}
                      onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
                    >
                      ×
                    </button>
                  </div>
                );
              })
            )}
          </div>

          
          {alerts.length > 6 && (
            <div style={{
              padding: '10px 16px',
              borderTop: '1px solid #f1f5f9',
              textAlign: 'center',
              fontSize: 12,
              color: '#64748b',
              background: '#fafafa',
            }}>
              +{alerts.length - 6} more — open <strong>Alerts</strong> page to see all
            </div>
          )}
        </div>
      )}
    </div>
  );
}