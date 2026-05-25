// Centralized mock data matching the AgroSense Dashboard mockup
export const initialSensorData = {
  moisture: { value: 74, status: "Optimal", unit: "%" },
  temperature: { value: 24, status: "Normal", unit: "°C" },
  humidity: { value: 64, status: "Normal", unit: "%" },
  pH: { value: 6.5, status: "Optimal", unit: "pH" },
  npk: { n: 45, p: 35, k: 40, status: "Balanced" },
  soilHealthScore: 78
};

export const recommendations = {
  crop: "Rice (Paddy)",
  cropReason: "Based on optimal moisture (74%) and slightly acidic soil (6.5 pH), conditions are ideal for cereal cultivation.",
  fertilizer: "Urea (Nitrogen-based)",
  fertilizerDetails: "Apply 25kg per acre to sustain early vegetative growth phase.",
  irrigation: "Automated - Paused",
  irrigationDetails: "Soil moisture is sufficient. Next check-cycle in 4 hours."
};

export const fieldOverview = [
  { id: 1, name: "Field Alpha", location: "Bharatpur Sector-A", size: "2.5 Hector", moisture: "74%", status: "Optimal" },
  { id: 2, name: "Field Beta", location: "Bharatpur Sector-B", size: "1.8 Hector", moisture: "42%", status: "Requires Attn" },
  { id: 3, name: "Field Gamma", location: "Chitwan Riverside", size: "3.2 Hector", moisture: "81%", status: "Saturated" }
];

// Historical 7-day trend data for your line graph component
export const analyticsTrendData = [
  { day: "Mon", moisture: 70, temperature: 22, humidity: 60, ph: 6.4 },
  { day: "Tue", moisture: 72, temperature: 23, humidity: 62, ph: 6.4 },
  { day: "Wed", moisture: 75, temperature: 24, humidity: 65, ph: 6.5 },
  { day: "Thu", moisture: 74, temperature: 24, humidity: 64, ph: 6.5 },
  { day: "Fri", moisture: 68, temperature: 25, humidity: 61, ph: 6.5 },
  { day: "Sat", moisture: 71, temperature: 23, humidity: 63, ph: 6.6 },
  { day: "Sun", moisture: 74, temperature: 24, humidity: 64, ph: 6.5 },
];