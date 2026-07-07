import React from 'react';

export default function FieldOverview({ fields, selectedFieldId, onSelectField }) {
  return (
    <div className="field-overview-card">
      <div className="card-header-row">
        <h3>Field Overview</h3>
        <a className="field-header-link">View All Fields</a>
      </div>

      {(!fields || fields.length === 0) ? (
        <p className="empty-state-text">No fields configured yet. Add one to see live status here.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#94a3b8', fontSize: 12 }}>
              <th style={{ padding: '8px 4px' }}>Field Name</th>
              <th style={{ padding: '8px 4px' }}>Location</th>
              <th style={{ padding: '8px 4px' }}>Area</th>
              <th style={{ padding: '8px 4px' }}>Last Updated</th>
              <th style={{ padding: '8px 4px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((f) => (
              <tr
                key={f.id}
                onClick={() => onSelectField(String(f.id))}
                style={{
                  cursor: 'pointer',
                  background: String(f.id) === String(selectedFieldId) ? '#f0fdf4' : 'transparent',
                }}
              >
                <td style={{ padding: '10px 4px', fontWeight: 600, color: '#1e293b' }}>{f.name}</td>
                <td style={{ padding: '10px 4px', color: '#64748b' }}>{f.location || '—'}</td>
                <td style={{ padding: '10px 4px', color: '#64748b' }}>{f.area || '—'}</td>
                <td style={{ padding: '10px 4px', color: '#64748b' }}>
                  {f.last_updated ? new Date(f.last_updated).toLocaleString() : 'No data yet'}
                </td>
                <td style={{ padding: '10px 4px' }}>
                  <span style={{
                    padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                    color: f.status === 'Good' ? '#16a34a' : f.status === 'Moderate' ? '#d97706' : f.status === 'Poor' ? '#dc2626' : '#94a3b8',
                    background: f.status === 'Good' ? '#f0fdf4' : f.status === 'Moderate' ? '#fffbeb' : f.status === 'Poor' ? '#fef2f2' : '#f8fafc',
                  }}>
                    {f.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}