# alerts/utils.py
from .models import Alert

def process_sensor_data(data):
    moisture    = float(data.get('soil_moisture', 100))
    temperature = float(data.get('temperature', 25))
    humidity    = float(data.get('humidity', 60))
    ph          = float(data.get('soil_ph', 7.0))

   
    if moisture < 20:
        if not Alert.objects.filter(alert_type='MOISTURE', is_read=False).exists():
            Alert.objects.create(
                alert_type='MOISTURE',
                message=f"Critical: Soil moisture is {moisture}% — wilting risk.",
                severity='CRITICAL'
            )

   
    if temperature > 35:
        if not Alert.objects.filter(alert_type='TEMPERATURE', is_read=False).exists():
            Alert.objects.create(
                alert_type='TEMPERATURE',
                message=f"High temperature: {temperature}°C — thermal stress risk.",
                severity='WARNING'
            )

    
    if moisture < 30:
        if not Alert.objects.filter(alert_type='IRRIGATION', is_read=False).exists():
            Alert.objects.create(
                alert_type='IRRIGATION',
                message=f"Irrigation recommended — moisture at {moisture}%.",
                severity='INFO'
            )

   
    if ph < 5.5 or ph > 7.8:
        if not Alert.objects.filter(alert_type='PH', is_read=False).exists():
            Alert.objects.create(
                alert_type='PH',
                message=f"Soil pH is {ph} — outside safe range (5.5–7.8).",
                severity='WARNING'
            )

    
    if humidity > 85:
        if not Alert.objects.filter(alert_type='HUMIDITY', is_read=False).exists():
            Alert.objects.create(
                alert_type='HUMIDITY',
                message=f"Humidity at {humidity}% — pathogen risk elevated.",
                severity='WARNING'
            )