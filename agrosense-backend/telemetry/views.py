from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

import os
import joblib

from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import SensorTelemetry
from .serializers import SensorTelemetrySerializer

# =====================================================================
# --- CUSTOM JWT CONFIGURATION FOR ADMIN ROUTING ---
# =====================================================================

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Extends the standard Simple JWT payload validation to append database role flags
    so that the React client can verify if a profile belongs to an administrator.
    """
    def validate(self, attrs):
        data = super().validate(attrs)
        data['is_superuser'] = self.user.is_superuser
        data['is_staff'] = self.user.is_staff
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        if not username or not password or not email:
            return Response({'error': 'Please provide username, email, and password.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already taken.'}, status=status.HTTP_400_BAD_REQUEST)

        User.objects.create_user(username=username, email=email, password=password)
        return Response({'message': 'Farmer registered successfully!'}, status=status.HTTP_201_CREATED)

# =====================================================================
# --- SENSOR TELEMETRY GATEWAY VIEW ---
# =====================================================================

@api_view(['GET', 'POST'])
def sensor_data_list(request):
    if request.method == 'GET':
        filter_type = request.query_params.get('filter', None)
        custom_date = request.query_params.get('date', None)
        
        queryset = SensorTelemetry.objects.all().order_by('-timestamp')
        today = timezone.now().date()

        if filter_type == 'today':
            queryset = queryset.filter(timestamp__date=today)
        elif filter_type == 'yesterday':
            queryset = queryset.filter(timestamp__date=today - timedelta(days=1))
        elif filter_type == 'custom' and custom_date:
            queryset = queryset.filter(timestamp__date=custom_date)
        else:
            queryset = queryset[:50]

        serializer = SensorTelemetrySerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        serializer = SensorTelemetrySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save() 
            print("\n💾 TELEMETRY SAVED TO DATABASE PERMANENTLY 💾")
            print(f"Data: {request.data}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# =====================================================================
# --- LIVE CROP SUGGESTION GATEWAY VIEW WITH SMART PATH LOGIC ---
# =====================================================================

def find_saved_model_file():
    """
    Scans folders dynamically relative to current execution layout 
    to make sure Django finds 'saved_agro_model.pkl'.
    """
    possible_locations = [
        os.path.join(os.path.dirname(os.path.abspath(__file__)), 'saved_agro_model.pkl'), # inside telemetry/
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'saved_agro_model.pkl'), # inside agrosense-backend/
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'saved_agro_model.pkl'), # inside AGROSENSE/
        os.path.abspath('saved_agro_model.pkl') # root fallback
    ]
    
    for path in possible_locations:
        if os.path.exists(path):
            return path
    return None


@api_view(['GET'])
def get_crop_suggestion(request):
    """
    API view endpoint that retrieves the absolute newest telemetry log entry,
    passes its features into the pre-trained ML model, and returns a crop recommendation.
    """
    # Look for the model core dynamically right now
    resolved_model_path = find_saved_model_file()

    if not resolved_model_path:
        return Response(
            {
                "error": "Machine learning model file is missing or corrupted on the server.",
                "debug_hint": f"Ensure 'saved_agro_model.pkl' exists in your root folder. Python evaluated execution from: {os.getcwd()}"
            }, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    try:
        # Load the model core safely on-demand
        active_ml_model = joblib.load(resolved_model_path)
    except Exception as e:
        return Response(
            {"error": f"Failed loading serialization matrix core payload: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    try:
        # Pull the absolute freshest row entry sent by the ESP32
        latest_telemetry = SensorTelemetry.objects.latest('timestamp')
    except SensorTelemetry.DoesNotExist:
        return Response(
            {
                "message": "No telemetry logs found in the database. Generating placeholder simulation recommendation...",
                "nitrogen": 90.0,
                "phosphorus": 42.0,
                "potassium": 43.0,
                "temperature": 24.2,
                "humidity": 80.3,
                "soil_ph": 6.5,
                "soil_moisture": 35.0,  # 🟢 Updated placeholder
                "prediction_result": "rice",
                "timestamp": timezone.now()
            }, 
            status=status.HTTP_200_OK
        )

    try:
        # Extract the metrics from the model fields
        n = float(latest_telemetry.nitrogen)
        p = float(latest_telemetry.phosphorus)
        k = float(latest_telemetry.potassium)
        temp = float(latest_telemetry.temperature)
        hum = float(latest_telemetry.humidity)
        ph = float(latest_telemetry.soil_ph)
        moisture = float(latest_telemetry.soil_moisture) 
    except (TypeError, ValueError, AttributeError) as err:
        return Response(
            {"error": f"Invalid or incomplete numerical metrics found in database row: {err}"}, 
            status=status.HTTP_422_UNPROCESSABLE_ENTITY
        )

    # Format data for Scikit-Learn: shape must be a 2D array [[N, P, K, Temp, Hum, pH, Soil_Moisture]]
    input_features = [[n, p, k, temp, hum, ph, moisture]]
    
    # Execute prediction algorithm
    prediction = active_ml_model.predict(input_features)[0]

    # Return structured telemetry dataset + prediction match to React frontend app
    return Response({
        "id": latest_telemetry.id,
        "nitrogen": n,
        "phosphorus": p,
        "potassium": k,
        "temperature": temp,
        "humidity": hum,
        "soil_ph": ph,
        "soil_moisture": moisture, 
        "prediction_result": str(prediction),
        "timestamp": latest_telemetry.timestamp
    }, status=status.HTTP_200_OK)