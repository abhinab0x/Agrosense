from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .weather_service import get_current_weather, get_rain_forecast_24h
from telemetry.models import SensorTelemetry


def get_forecast_data():
    import os, requests
    from dotenv import load_dotenv
    from pathlib import Path
    BASE_DIR = Path(__file__).resolve().parent.parent
    load_dotenv(dotenv_path=BASE_DIR / '.env')

    api_key = os.getenv("OPENWEATHER_API_KEY")
    city = "Dhulikhel"
    url = f"https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={api_key}&units=metric"
    try:
        res = requests.get(url)
        if res.status_code == 200:
            return [
                {
                    "time": item["dt_txt"][11:16],
                    "temp": round(item["main"]["temp"]),
                    "rain": item.get("rain", {}).get("3h", 0),
                    "desc": item["weather"][0]["description"]
                }
                for item in res.json().get("list", [])[:8]
            ]
    except Exception:
        pass
    return []


@api_view(['GET'])
def advice_view(request):
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)

    field_id = request.query_params.get('field_id')
    if not field_id:
        return Response({'error': 'field_id query parameter is required'}, status=400)

    try:
        latest = SensorTelemetry.objects.filter(
            device__field_id=field_id,
            device__field__owner=request.user,
        ).latest('timestamp')
        moisture = float(latest.soil_moisture)
    except SensorTelemetry.DoesNotExist:
        moisture = None
    except Exception:
        moisture = None

    weather = get_current_weather()
    forecast = get_forecast_data()

    if not weather:
        return Response({"error": "Weather service unavailable"}, status=503)

    current = {
        "temp": round(weather["main"]["temp"]),
        "humidity": weather["main"]["humidity"],
        "desc": weather["weather"][0]["description"].capitalize(),
        "wind": weather["wind"]["speed"],
        "rain_1h": weather.get("rain", {}).get("1h", 0),
    }

    irrigation = get_irrigation_advice(moisture, weather) if moisture is not None else {
        "action": "UNKNOWN",
        "reason": "No sensor data yet for this field"
    }

    return Response({
        "current": current,
        "forecast": forecast,
        "soil_moisture": moisture,
        "irrigation": irrigation,
    })


def get_irrigation_advice(soil_moisture, weather):
    temp = weather.get("main", {}).get("temp", 25)
    humidity = weather.get("main", {}).get("humidity", 50)
    current_rain = weather.get("rain", {}).get("1h", 0)
    is_raining = any(
        'rain' in w['description'].lower()
        for w in weather.get('weather', [])
    )

    if is_raining or current_rain > 2:
        return {"action": "SKIP", "reason": f"Currently raining ({current_rain}mm)"}
    elif soil_moisture < 15:
        return {"action": "WATER", "urgency": "urgent", "reason": "Soil critically dry!"}
    elif soil_moisture < 30:
        return {"action": "WATER", "urgency": "recommended", "reason": f"Soil moisture low ({soil_moisture}%)"}
    elif soil_moisture < 50 and temp > 30 and humidity < 40:
        return {"action": "LIGHT", "reason": f"Hot & dry ({temp}°C, {humidity}%)"}
    else:
        return {"action": "STAY_OFF", "reason": f"Soil moisture sufficient ({soil_moisture}%)"}