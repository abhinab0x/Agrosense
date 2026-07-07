import { useState, useEffect, useCallback } from "react";
import { Sprout, RefreshCw, AlertTriangle, Copy, Check, Clock } from "lucide-react";
import { apiFetch } from "../utils/api";
import "./css/FertilizerSuggestion.css";

const READING_LABELS = {
  nitrogen: { label: "Nitrogen (N)", unit: "mg/kg" },
  phosphorus: { label: "Phosphorus (P)", unit: "mg/kg" },
  potassium: { label: "Potassium (K)", unit: "mg/kg" },
  temperature: { label: "Temperature", unit: "°C" },
  humidity: { label: "Humidity", unit: "%" },
  soil_ph: { label: "Soil pH", unit: "" },
  soil_moisture: { label: "Soil Moisture", unit: "%" },
};

function timeAgo(isoString) {
  if (!isoString) return null;
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return null;

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function formatDateTime(isoString) {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function FertilizerSuggestion({ selectedFieldId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchRecommendation = useCallback(async () => {
    if (!selectedFieldId) return;

    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/fertilizer/recommend/?field_id=${selectedFieldId}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Something went wrong fetching the recommendation.");
      }
      setData(json);
    } catch (err) {
      setError(err.message || "Could not reach the recommendation service.");
    } finally {
      setLoading(false);
    }
  }, [selectedFieldId]);

  useEffect(() => {
    fetchRecommendation();
  }, [fetchRecommendation]);

  const handleCopy = () => {
    if (!data?.recommendation) return;
    navigator.clipboard.writeText(data.recommendation);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fert-page">
      <div className="fert-header">
        <div>
          <h1 className="fert-title">Fertilizer Recommendation</h1>
          <p className="fert-subtitle">
            AI-generated suggestion based on your most recent sensor reading.
          </p>
        </div>
        <button className="fert-refresh-btn" onClick={fetchRecommendation} disabled={loading}>
          <RefreshCw size={16} className={loading ? "fert-icon-spin" : ""} />
          Refresh
        </button>
      </div>

      {loading && !data && (
        <div className="fert-loading">
          <RefreshCw size={22} className="fert-icon-spin" />
          <p>Fetching latest recommendation…</p>
        </div>
      )}

      {error && (
        <div className="fert-error">
          <AlertTriangle size={20} className="fert-error-icon" />
          <div>
            <p className="fert-error-title">Couldn't load a recommendation</p>
            <p className="fert-error-message">{error}</p>
            <button className="fert-retry-btn" onClick={fetchRecommendation}>
              Try again
            </button>
          </div>
        </div>
      )}

      {!error && data && (
        <div className="fert-card">
          <div className="fert-card-hero">
            <div className="fert-eyebrow">
              <Sprout size={15} />
              Recommended fertilizer
            </div>
            <div className="fert-result-row">
              <h2 className="fert-result-name">{data.recommendation}</h2>
              <button className="fert-copy-btn" title="Copy recommendation" onClick={handleCopy}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            {data.timestamp && (
              <div className="fert-timestamp-row">
                <Clock size={14} />
                <span>
                  Based on reading from {formatDateTime(data.timestamp)}
                  {timeAgo(data.timestamp) ? ` (${timeAgo(data.timestamp)})` : ""}
                </span>
              </div>
            )}
          </div>

          {data.readings && (
            <div className="fert-readings">
              <h3 className="fert-readings-title">Sensor readings used</h3>
              <div className="fert-readings-grid">
                {Object.entries(data.readings).map(([key, value]) => {
                  const meta = READING_LABELS[key] || { label: key, unit: "" };
                  return (
                    <div key={key} className="fert-reading-tile">
                      <p className="fert-reading-label">{meta.label}</p>
                      <p className="fert-reading-value">
                        {value}
                        <span className="fert-reading-unit">{meta.unit}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}