import os
from pathlib import Path
from dotenv import load_dotenv
import requests

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=os.path.join(BASE_DIR, '.env'))

def get_current_weather():
    """Fetches full weather data for the city."""
    api_key = os.getenv("OPENWEATHER_API_KEY")
    city = "Dhulikhel"
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            return response.json()
        return {}
    except Exception:
        return {}

def get_rain_forecast_24h():
    """Extracts rain data specifically."""
    data = get_current_weather()
    # Safely access the rain data from the API response
    return data.get('rain', {}).get('1h', 0) if data else 0