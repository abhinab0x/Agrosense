
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AlertsContext = createContext(null);

const API = 'http://127.0.0.1:8000';

export function AlertsProvider({ children }) {
  const [alerts, setAlerts]   = useState([]);
  const [unread, setUnread]   = useState(0);

  const fetchAlerts = useCallback(() => {
    fetch(`${API}/api/alerts/list/`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        setAlerts(data);
        setUnread(data.filter(a => !a.is_read).length);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchAlerts();
    const id = setInterval(fetchAlerts, 15000);
    return () => clearInterval(id);
  }, [fetchAlerts]);

  const dismissOne = (id) => {
    fetch(`${API}/api/alerts/read/${id}/`, { method: 'PATCH' })
      .then(() => fetchAlerts());
  };

  const dismissAll = () => {
    fetch(`${API}/api/alerts/clear-all/`, { method: 'POST' })
      .then(() => { setAlerts([]); setUnread(0); });
  };

  return (
    <AlertsContext.Provider value={{ alerts, unread, fetchAlerts, dismissOne, dismissAll }}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error('useAlerts must be inside AlertsProvider');
  return ctx;
}