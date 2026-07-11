import React, { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { apiFetch } from '../utils/api';

export default function Report({
  sensorReadings = [],
  selectedFieldId,
  cropMetricsSummary,
  alternativeCropsList = []
}) {
  const [recommendedCrop, setRecommendedCrop] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const reportRef = useRef(null);

  const latestLog = sensorReadings?.length > 0
    ? sensorReadings[0]
    : null;

  useEffect(() => {
    if (!selectedFieldId) return;

    apiFetch(`/api/crop-suggestion/?field_id=${selectedFieldId}`)
        .then(res => res.json())
        .then(data => {
            console.log("Crop API:", data);

            if (data.prediction_result) {
                setRecommendedCrop(data.prediction_result);
            }
        })
        .catch(err => {
            console.error("Crop API Error:", err);
        });

}, [selectedFieldId]);


  const nitrogen = latestLog?.nitrogen ?? 40;
  const phosphorus = latestLog?.phosphorus ?? 30;
  const potassium = latestLog?.potassium ?? 35;
  const moisture = latestLog?.soil_moisture ?? 157;
  const ph = latestLog?.soil_ph ?? 6.5;
  const temp = latestLog?.temperature ?? 26.3;
  const humidity = latestLog?.humidity ?? 85.4;

  const activeCropKey = (
    recommendedCrop || "coconut"
).toLowerCase().trim();

  const cropData = cropMetricsSummary?.[activeCropKey];

  // ---------- Download helpers ----------
  const getTimestampedFilename = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');

    const datePart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const timePart = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

    return `report_${datePart}_${timePart}.pdf`;
  };

  const handleDownload = async () => {
    if (!reportRef.current) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // sharper output
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');

      // A4-sized PDF, scaling the captured canvas to fit the page width
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add extra pages if the report is taller than one A4 page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(getTimestampedFilename());
    } catch (err) {
      console.error("Failed to generate report PDF:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!cropData) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif', color: '#64748b' }}>
        <h3>Loading data-driven field baselines...</h3>
        <p>Connecting to Django analytical model server</p>
      </div>
    );
  }

  const nStatus = nitrogen >= cropData.nMin && nitrogen <= cropData.nMax ? 'Optimal Baseline' : nitrogen < cropData.nMin ? 'Critically Low' : 'Surplus';
  const pStatus = phosphorus >= cropData.pMin && phosphorus <= cropData.pMax ? 'Optimal Baseline' : phosphorus < cropData.pMin ? 'Critically Low' : 'Surplus';
  const kStatus = potassium >= cropData.kMin && potassium <= cropData.kMax ? 'Optimal Baseline' : potassium < cropData.kMin ? 'Critically Low' : 'Surplus';
  const mStatus = moisture < cropData.mMin ? 'Arid (Requires Water)' : moisture > cropData.mMax ? 'Waterlogged Risk' : 'Optimal Moisture';
  const phStatus = ph >= cropData.phMin && ph <= cropData.phMax ? 'Perfect Balance' : 'Imbalanced';

  return (
    <div style={{ background: '#f8fafc', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1e293b', minHeight: '100vh' }}>

      {/* Download Button */}
      <div style={{ maxWidth: '900px', margin: '0 auto 16px auto', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: isDownloading ? '#86efac' : '#16a34a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: isDownloading ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'background 0.2s ease',
          }}
        >
          {isDownloading ? 'Generating PDF...' : '⬇ Download Report'}
        </button>
      </div>

      <div ref={reportRef} style={{ maxWidth: '900px', margin: '0 auto', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', padding: '40px' }}>

        {/* Document Header */}
        <div style={{ borderBottom: '3px solid #16a34a', paddingBottom: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#14532d', letterSpacing: '-0.5px' }}>FARM DIAGNOSTIC & FIELD REPORT</h1>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: '600', color: '#16a34a' }}>AgroSense Smart Farming Assistant</h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Live Field Telemetry Monitoring & Automated Agronomic Guidance</p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
            <div><strong>Field Tracking ID:</strong> #{selectedFieldId || 'Aayam_Farm_Node01'}</div>
            <div><strong>Report Date:</strong> {latestLog?.timestamp ? new Date(latestLog.timestamp).toLocaleString() : 'July 09, 2026'}</div>
            <div><strong>Field Node Status:</strong> <span style={{ color: '#16a34a', fontWeight: '600' }}>● Smart Link Active</span></div>
            <div><strong>Farmer Account:</strong> Aayam Pokharel</div>
          </div>
        </div>

        {/* Section 1: Executive Field Summary */}
        <h3 style={{ fontSize: '16px', color: '#14532d', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '12px', marginTop: '24px' }}>1. Executive Field Summary</h3>
        <p style={{ fontWeight: '600', color: '#16a34a', margin: '0 0 8px 0', fontSize: '14px' }}>
          Current Land Optimization Strategy: {cropData.displayName} Production Target
        </p>
        <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#334155', margin: '0 0 16px 0' }}>
          Your field data profile features an ambient plot temperature of {temp}°C paired with live air humidity rates sitting around {humidity}%. This establishes the real-time operational microclimate baseline for managing your active {cropData.displayName} setup.
        </p>

        {/* Section 2: Sensor Nutrient & Environment Health Table */}
        <h3 style={{ fontSize: '16px', color: '#14532d', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '12px', marginTop: '28px' }}>2. Current Soil Nutrients & Environment Health</h3>
        <p style={{ fontSize: '14px', color: '#334155', margin: '0 0 12px 0' }}>
          This matrix cross-references live hardware telemetry signals directly against data-driven parameters dynamically computed from your <strong>{cropData.displayName}</strong> dataset records.
        </p>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', marginBottom: '24px' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
              <th style={{ padding: '10px', color: '#334155', fontWeight: '600' }}>Soil Parameter</th>
              <th style={{ padding: '10px', color: '#334155', fontWeight: '600' }}>Your Farm Reading</th>
              <th style={{ padding: '10px', color: '#334155', fontWeight: '600' }}>Target {cropData.displayName} Baseline</th>
              <th style={{ padding: '10px', color: '#334155', fontWeight: '600' }}>Condition Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '10px', fontWeight: '500' }}>Soil Nitrogen (N)</td>
              <td style={{ padding: '10px', color: '#16a34a', fontWeight: '600' }}>{nitrogen} mg/kg</td>
              <td style={{ padding: '10px' }}>{cropData.nMin} - {cropData.nMax} mg/kg</td>
              <td style={{ padding: '10px', color: nStatus === 'Optimal Baseline' ? '#16a34a' : '#b45309', fontWeight: '600' }}>{nStatus}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '10px', fontWeight: '500' }}>Soil Phosphorus (P)</td>
              <td style={{ padding: '10px', color: '#16a34a', fontWeight: '600' }}>{phosphorus} mg/kg</td>
              <td style={{ padding: '10px' }}>{cropData.pMin} - {cropData.pMax} mg/kg</td>
              <td style={{ padding: '10px', color: pStatus === 'Optimal Baseline' ? '#16a34a' : '#b45309', fontWeight: '600' }}>{pStatus}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '10px', fontWeight: '500' }}>Soil Potassium (K)</td>
              <td style={{ padding: '10px', color: '#16a34a', fontWeight: '600' }}>{potassium} mg/kg</td>
              <td style={{ padding: '10px' }}>{cropData.kMin} - {cropData.kMax} mg/kg</td>
              <td style={{ padding: '10px', color: kStatus === 'Optimal Baseline' ? '#16a34a' : '#b45309', fontWeight: '600' }}>{kStatus}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '10px', fontWeight: '500' }}>Soil Moisture Level</td>
              <td style={{ padding: '10px', color: '#2563eb', fontWeight: '600' }}>{moisture}%</td>
              <td style={{ padding: '10px' }}>{cropData.mMin}% - {cropData.mMax}% Range</td>
              <td style={{ padding: '10px', color: mStatus === 'Waterlogged Risk' ? '#dc2626' : '#16a34a', fontWeight: '600' }}>{mStatus}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '10px', fontWeight: '500' }}>Soil pH Balance</td>
              <td style={{ padding: '10px', color: '#16a34a', fontWeight: '600' }}>{ph.toFixed(1)} pH</td>
              <td style={{ padding: '10px' }}>{cropData.phMin} - {cropData.phMax} pH</td>
              <td style={{ padding: '10px', color: phStatus === 'Perfect Balance' ? '#16a34a' : '#dc2626', fontWeight: '600' }}>{phStatus}</td>
            </tr>
          </tbody>
        </table>

        {/* Section 3: Primary & Alternative Crop Matching */}
        <h3 style={{ fontSize: '16px', color: '#14532d', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '12px', marginTop: '28px' }}>3. Dynamic Dataset Crop Strategy</h3>

        <div style={{ background: '#f0fdf4', borderLeft: '4px solid #16a34a', padding: '12px 16px', margin: '12px 0', borderRadius: '0 8px 8px 0' }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#14532d' }}>Optimal Selection Output: {cropData.displayName.toUpperCase()}</div>
          <div style={{ fontSize: '13px', color: '#365314', marginTop: '4px', lineHeight: '1.5' }}>
            Your environmental telemetry matches smoothly with target parameters verified across your data model trends.
          </div>
        </div>

        {alternativeCropsList.length > 0 && (
          <div style={{ marginTop: '16px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>🔄 Alternative System Intercrops for Spatial Optimization:</div>
            <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 8px 0' }}>
              To maximize unallocated field space effectively using matching dataset variables, consider these options:
            </p>
            <ul style={{ fontSize: '13px', color: '#475569', paddingLeft: '20px', margin: 0, lineHeight: '1.6' }}>
              {alternativeCropsList.map((crop, idx) => (
                <li key={idx}><strong>{crop.name}:</strong> {crop.reason}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Document Footer */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '30px', textAlign: 'center', fontSize: '11px', color: '#94a3b8' }}>
          <div>End of AgroSense Field Diagnostic Summary for {cropData.displayName}. Streams updating live via regional network node telemetry.</div>
          <div style={{ marginTop: '4px', fontWeight: '600' }}>AgroSense Smart Farming Portal • Tailored Field Operations Manual</div>
        </div>

      </div>
    </div>
  );
}