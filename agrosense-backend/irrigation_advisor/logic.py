# irrigation_advisor/logic.py
from telemetry.models import SensorTelemetry
from .weather import get_weather_data

def calculate_irrigation_needs():
    # Wrap in try/except so the server doesn't crash if database is empty
    try:
        latest = SensorTelemetry.objects.latest('timestamp')
        moisture = latest.soil_moisture
    except SensorTelemetry.DoesNotExist:
        return "UNKNOWN", "No sensor data available yet."

    weather = get_weather_data()
    # Check if weather data exists before accessing it
    if not weather:
        return "ERROR", "Weather service unavailable."

    is_raining = any('rain' in w['description'].lower() for w in weather.get('weather', []))
    
    if is_raining:
        return "SKIP", "Rain detected. Irrigation stopped."
    elif moisture < 30:
        return "WATER", "Soil moisture low. Activating pump."
    else:
        return "STAY_OFF", "Soil moisture optimal."