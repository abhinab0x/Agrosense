import { useState } from 'react';

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

const FILTERS = [
  { key: 'ALL',      label: 'All',      activeColor: '#0f172a', activeBg: '#f1f5f9' },
  { key: 'CRITICAL', label: 'Critical', activeColor: '#fff',    activeBg: '#ef4444' },
  { key: 'WARNING',  label: 'Warning',  activeColor: '#fff',    activeBg: '#f59e0b' },
  { key: 'INFO',     label: 'Info',     activeColor: '#fff',    activeBg: '#3b82f6' },
];

export default function AlertsPage({ alerts, onDismissOne, onDismissAll }) {
  const [filter, setFilter] = useState('ALL');

  const filtered = filter === 'ALL'
    ? alerts
    : alerts.filter(a => a.severity === filter);

  const counts = {
    ALL:      alerts.length,
    CRITICAL: alerts.filter(a => a.severity === 'CRITICAL').length,
    WARNING:  alerts.filter(a => a.severity === 'WARNING').length,
    INFO:     alerts.filter(a => a.severity === 'INFO').length,
  };

  return (
    <div style={{
      padding: 24,
      fontFamily: 'system-ui, sans-serif',
      minHeight: '85vh',
      background: '#f8fafc',
    }}>

      {/* ── Page header ── */}
      <div style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '20px 24px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <h2 style={{
            fontSize: 18, fontWeight: 600,
            color: '#0f172a', margin: 0, marginBottom: 4,
          }}>
            🔔 System Alerts
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Real-time threshold alerts from your ESP32 sensor nodes. Auto-refreshes every 15 seconds.
          </p>
        </div>
        {alerts.length > 0 && (
          <button
            onClick={onDismissAll}
            style={{
              fontSize: 13, fontWeight: 500,
              color: '#64748b',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '9px 18px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#64748b'; }}
          >
            ✓ Mark all as read
          </button>
        )}
      </div>

      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
        marginBottom: 16,
      }}>
        {[
          { label: 'Total alerts', value: counts.ALL,      color: '#0f172a', border: '#e2e8f0', bg: '#fff'    },
          { label: 'Critical',     value: counts.CRITICAL, color: '#ef4444', border: '#fecaca', bg: '#fef2f2' },
          { label: 'Warnings',     value: counts.WARNING,  color: '#f59e0b', border: '#fde68a', bg: '#fffbeb' },
          { label: 'Info',         value: counts.INFO,     color: '#3b82f6', border: '#bfdbfe', bg: '#eff6ff' },
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg,
            border: `1px solid ${s.border}`,
            borderRadius: 12,
            padding: '16px 20px',
          }}>
            <div style={{
              fontSize: 30, fontWeight: 700,
              color: s.color, lineHeight: 1,
            }}>
              {s.value}
            </div>
            <div style={{
              fontSize: 12, color: '#64748b',
              marginTop: 6, fontWeight: 500,
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      
      <div style={{
        display: 'flex', gap: 8,
        marginBottom: 16,
      }}>
        {FILTERS.map(f => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
                background: active ? f.activeBg : '#fff',
                color:      active ? f.activeColor : '#64748b',
                border:     active ? `1px solid ${f.activeBg}` : '1px solid #e2e8f0',
              }}
            >
              {f.label}
              <span style={{
                marginLeft: 7,
                fontSize: 11,
                background: active ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                color:      active ? f.activeColor : '#64748b',
                borderRadius: 10,
                padding: '1px 7px',
                fontWeight: 600,
              }}>
                {counts[f.key]}
              </span>
            </button>
          );
        })}
      </div>

      
      <div style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        {filtered.length === 0 ? (

          
          <div style={{
            padding: '64px 20px',
            textAlign: 'center',
            color: '#94a3b8',
          }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
            <div style={{
              fontSize: 15, fontWeight: 600,
              color: '#475569', marginBottom: 6,
            }}>
              {filter === 'ALL' ? 'No active alerts' : `No ${filter.toLowerCase()} alerts`}
            </div>
            <div style={{ fontSize: 13 }}>
              All sensor readings are within safe thresholds
            </div>
          </div>

        ) : (

          
          filtered.map((alert, idx) => {
            const s    = SEVERITY_STYLE[alert.severity] || SEVERITY_STYLE.INFO;
            const icon = TYPE_ICONS[alert.alert_type] || '⚠️';

            return (
              <div
                key={alert.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '16px 20px',
                  borderBottom: idx < filtered.length - 1
                    ? '1px solid #f8fafc'
                    : 'none',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
               
                <div style={{
                  width: 44, height: 44,
                  borderRadius: 10,
                  background: s.bg,
                  border: `1px solid ${s.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  flexShrink: 0,
                }}>
                  {icon}
                </div>

                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 4,
                  }}>
                    <span style={{
                      fontSize: 13, fontWeight: 600,
                      color: '#0f172a',
                    }}>
                      {alert.alert_type}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color: s.color,
                      background: s.bg,
                      border: `1px solid ${s.border}`,
                      borderRadius: 4,
                      padding: '2px 7px',
                    }}>
                      {s.label}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: '#475569',
                    lineHeight: 1.5,
                  }}>
                    {alert.message}
                  </div>
                </div>

                
                <div style={{
                  fontSize: 12,
                  color: '#94a3b8',
                  flexShrink: 0,
                  textAlign: 'right',
                  lineHeight: 1.6,
                }}>
                  <div style={{ fontWeight: 500, color: '#64748b' }}>
                    {new Date(alert.created_at).toLocaleTimeString([], {
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                  <div>
                    {new Date(alert.created_at).toLocaleDateString([], {
                      month: 'short', day: 'numeric',
                    })}
                  </div>
                </div>

                
                <button
                  onClick={() => onDismissOne(alert.id)}
                  style={{
                    background: 'none',
                    border: '1px solid #e2e8f0',
                    borderRadius: 7,
                    cursor: 'pointer',
                    color: '#94a3b8',
                    fontSize: 12,
                    fontWeight: 500,
                    padding: '6px 12px',
                    flexShrink: 0,
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#fef2f2';
                    e.currentTarget.style.borderColor = '#fecaca';
                    e.currentTarget.style.color = '#ef4444';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.color = '#94a3b8';
                  }}
                >
                  Dismiss
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}