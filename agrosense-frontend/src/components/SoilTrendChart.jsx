// components/SoilTrendChart.jsx
import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const RANGE_TO_DAYS = { 'Last 7 Days': 7, 'Last 14 Days': 14, 'Last 30 Days': 30 };

function aggregateData(readings, days) {
  // Figure out how many distinct calendar days the data actually spans.
  const distinctDays = new Set(
    readings
      .map((r) => {
        const d = new Date(r.timestamp || r.created_at);
        return isNaN(d) ? null : d.toISOString().slice(0, 10);
      })
      .filter(Boolean)
  );

  // Not enough day-spread yet (e.g. all readings are from today, during testing) —
  // group by hour instead so the chart still shows a meaningful trend line.
  if (distinctDays.size < 2) {
    return aggregateByHour(readings);
  }
  return aggregateByDay(readings, days);
}

function aggregateByHour(readings) {
  const buckets = {}; // keyed by "yyyy-mm-ddTHH" for sorting

  readings.forEach((r) => {
    const d = new Date(r.timestamp || r.created_at);
    if (isNaN(d)) return;

    const hourKey = d.toISOString().slice(0, 13); // e.g. "2026-07-02T14"
    const label = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    if (!buckets[hourKey]) {
      buckets[hourKey] = { date: label, moisture: [], temperature: [], humidity: [], ph: [] };
    }
    buckets[hourKey].moisture.push(Number(r.soil_moisture) || 0);
    buckets[hourKey].temperature.push(Number(r.temperature) || 0);
    buckets[hourKey].humidity.push(Number(r.humidity) || 0);
    buckets[hourKey].ph.push(Number(r.soil_ph) || 0);
  });

  const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

  return Object.keys(buckets)
    .sort()
    .slice(-24) // last 24 hourly points
    .map((key) => {
      const b = buckets[key];
      return {
        date: b.date,
        Moisture: +avg(b.moisture).toFixed(1),
        Temperature: +avg(b.temperature).toFixed(1),
        Humidity: +avg(b.humidity).toFixed(1),
        pH: +avg(b.ph).toFixed(1),
      };
    });
}

function aggregateByDay(readings, days) {
  const buckets = {}; // keyed by ISO date (yyyy-mm-dd) for reliable sorting

  readings.forEach((r) => {
    const d = new Date(r.timestamp || r.created_at);
    if (isNaN(d)) return;

    const isoKey = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (!buckets[isoKey]) {
      buckets[isoKey] = { date: label, moisture: [], temperature: [], humidity: [], ph: [] };
    }
    buckets[isoKey].moisture.push(Number(r.soil_moisture) || 0);
    buckets[isoKey].temperature.push(Number(r.temperature) || 0);
    buckets[isoKey].humidity.push(Number(r.humidity) || 0);
    buckets[isoKey].ph.push(Number(r.soil_ph) || 0);
  });

  const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

  return Object.keys(buckets)
    .sort() // ascending ISO date order, oldest -> newest
    .slice(-days) // now correctly grabs the most recent N days
    .map((key) => {
      const b = buckets[key];
      return {
        date: b.date,
        Moisture: +avg(b.moisture).toFixed(1),
        Temperature: +avg(b.temperature).toFixed(1),
        Humidity: +avg(b.humidity).toFixed(1),
        pH: +avg(b.ph).toFixed(1),
      };
    });
}

export default function SoilTrendChart({ readings }) {
  const [range, setRange] = useState('Last 7 Days');
  const data = useMemo(() => aggregateData(readings || [], RANGE_TO_DAYS[range]), [readings, range]);

  return (
    <div className="trend-chart-card">
      <div className="card-header-row">
        <h3>Soil Parameters Trend</h3>
        <select
          className="trend-filter-select"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          {Object.keys(RANGE_TO_DAYS).map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>

      {data.length < 2 ? (
        <p className="empty-state-text">
          Not enough sensor history yet — keep the ESP32 sending data and the trend will appear here.
        </p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={260} className="chart-vector-canvas">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="Moisture" stroke="#3b82f6" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Temperature" stroke="#f97316" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Humidity" stroke="#10b981" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="pH" stroke="#8b5cf6" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>

          <div className="chart-legend-row">
            <span className="legend-item"><span className="legend-item-marker-blue" /> Moisture (%)</span>
            <span className="legend-item"><span className="legend-item-marker-orange" /> Temperature (°C)</span>
            <span className="legend-item"><span className="legend-item-marker-green" /> Humidity (%)</span>
            <span className="legend-item"><span className="legend-item-marker-purple" /> pH</span>
          </div>
        </>
      )}
    </div>
  );
}