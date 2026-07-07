import { useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown, Check, Loader2 } from "lucide-react";
import { useFarm } from "./FarmContext";
import "./css/FarmSwitcher.css";

export default function FarmSwitcher() {
  const { farms, selectedFarm, selectFarm, loading, error } = useFarm();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id) => {
    selectFarm(id);
    setOpen(false);
  };

  if (loading) {
    return (
      <div className="farm-switcher">
        <div className="farm-switcher-trigger farm-switcher-loading">
          <Loader2 size={15} className="farm-switcher-spin" />
          <span className="farm-switcher-loading-text">Loading farms…</span>
        </div>
      </div>
    );
  }

  if (error || farms.length === 0) {
    return (
      <div className="farm-switcher">
        <div className="farm-switcher-trigger farm-switcher-empty">
          <MapPin size={15} />
          <span className="farm-switcher-loading-text">
            {error ? "Couldn't load farms" : "No farms yet"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="farm-switcher" ref={wrapperRef}>
      <button
        className="farm-switcher-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="farm-switcher-icon">
          <MapPin size={15} />
        </span>
        <span className="farm-switcher-text">
          <span className="farm-switcher-name">{selectedFarm.name}</span>
          <span className="farm-switcher-location">{selectedFarm.location}</span>
        </span>
        <ChevronDown
          size={16}
          className={`farm-switcher-chevron ${open ? "open" : ""}`}
        />
      </button>

      {open && (
        <div className="farm-switcher-menu">
          <div className="farm-switcher-menu-label">Your farms</div>
          {farms.map((farm) => (
            <button
              key={farm.id}
              className={`farm-switcher-option ${
                farm.id === selectedFarm.id ? "active" : ""
              }`}
              onClick={() => handleSelect(farm.id)}
            >
              <span className="farm-switcher-option-text">
                <span className="farm-switcher-option-name">{farm.name}</span>
                <span className="farm-switcher-option-location">{farm.location}</span>
              </span>
              {farm.id === selectedFarm.id && <Check size={15} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}