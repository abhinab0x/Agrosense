import { createContext, useContext, useState, useEffect } from "react";

const FarmContext = createContext(null);

const API_BASE = "http://127.0.0.1:8000";

export function FarmProvider({ children }) {
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/farms/list/`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setFarms(data);
        if (data.length > 0) {
          setSelectedFarmId(data[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load farms:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const selectedFarm =
    farms.find((f) => f.id === selectedFarmId) || farms[0] || null;

  const value = {
    farms,
    selectedFarm,
    selectFarm: (id) => setSelectedFarmId(id),
    loading,
    error,
  };

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}

// Usage in any component:
//   const { selectedFarm, farms, selectFarm, loading } = useFarm();
// Pass `selectedFarm?.id` as a `farm_id` query param on every
// telemetry/recommendation fetch call once the backend supports it.
export function useFarm() {
  const ctx = useContext(FarmContext);
  if (!ctx) {
    throw new Error("useFarm must be used inside a <FarmProvider>");
  }
  return ctx;
}