from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

import os
import random
import joblib

from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import SensorTelemetry
from .serializers import SensorTelemetrySerializer
from farms.models import Device


try:
    from alerts.utils import process_sensor_data
    ALERTS_ENABLED = True
except ImportError:
    ALERTS_ENABLED = False
    print(" alerts app not found — alert processing disabled")


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
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
            return Response(
                {'error': 'Please provide username, email, and password.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already taken.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        User.objects.create_user(username=username, email=email, password=password)
        return Response(
            {'message': 'Farmer registered successfully!'},
            status=status.HTTP_201_CREATED
        )


def simulate_soil_chemistry():
    """
    Generates realistic placeholder pH/NPK values for testing when
    physical sensors aren't wired up yet.
    """
    return {
        'soil_ph': round(random.uniform(5.5, 7.5), 2),
        'nitrogen': random.randint(20, 120),
        'phosphorus': random.randint(10, 80),
        'potassium': random.randint(10, 100),
    }


@api_view(['GET', 'POST'])
def sensor_data_list(request):

    if request.method == 'GET':
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=401)

        field_id = request.query_params.get('field_id')
        if not field_id:
            return Response({'error': 'field_id query parameter is required'}, status=400)

        filter_type = request.query_params.get('filter', None)
        custom_date = request.query_params.get('date', None)

        queryset = SensorTelemetry.objects.filter(
            device__field_id=field_id,
            device__field__owner=request.user,
        ).order_by('-timestamp')
        today = timezone.now().date()

        if filter_type == 'today':
            queryset = queryset.filter(timestamp__date=today)
        elif filter_type == 'yesterday':
            queryset = queryset.filter(timestamp__date=today - timedelta(days=1))
        elif filter_type == 'custom' and custom_date:
            queryset = queryset.filter(timestamp__date=custom_date)
        else:
            queryset = queryset[:200]

        serializer = SensorTelemetrySerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        data = request.data.copy()
        device_key = data.get('device_key')

        if not device_key:
            return Response({'error': 'device_key is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            device = Device.objects.get(device_key=device_key, is_active=True)
        except Device.DoesNotExist:
            return Response({'error': 'Unknown or inactive device_key'}, status=status.HTTP_403_FORBIDDEN)

        simulated_values = simulate_soil_chemistry()
        simulated_fields = {}
        for field in ('soil_ph', 'nitrogen', 'phosphorus', 'potassium'):
            if field not in data or data.get(field) in (None, ''):
                data[field] = simulated_values[field]
                simulated_fields[field] = simulated_values[field]

        data['device'] = device.id

        serializer = SensorTelemetrySerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            print(f"\n TELEMETRY SAVED — device: {device.name} ({device.field.name})")
            if simulated_fields:
                print(f"   ⚠️  Simulated fields injected: {simulated_fields}")

            if ALERTS_ENABLED:
                try:
                    process_sensor_data(request.data)
                    print("Alert check passed")
                except Exception as e:
                    print(f" Alert processing error: {e}")

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        print(f" Invalid sensor data received: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def find_saved_model_file():
    possible_locations = [
        os.path.join(os.path.dirname(os.path.abspath(__file__)), 'saved_agro_model.pkl'),
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'saved_agro_model.pkl'),
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'saved_agro_model.pkl'),
        os.path.abspath('saved_agro_model.pkl'),
    ]

    for path in possible_locations:
        if os.path.exists(path):
            print(f" Model found at: {path}")
            return path

    print(" saved_agro_model.pkl not found in any expected location")
    return None


@api_view(['GET'])
def get_crop_suggestion(request):
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)

    field_id = request.query_params.get('field_id')
    if not field_id:
        return Response({'error': 'field_id query parameter is required'}, status=400)

    model_path = find_saved_model_file()

    if not model_path:
        return Response(
            {
                "error": "ML model file missing.",
                "fix": "Run: python run_train.py — then copy saved_agro_model.pkl into telemetry/",
                "cwd": os.getcwd(),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    try:
        model = joblib.load(model_path)
    except Exception as e:
        return Response(
            {"error": f"Failed to load model: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    try:
        latest = SensorTelemetry.objects.filter(
            device__field_id=field_id,
            device__field__owner=request.user,
        ).latest('timestamp')
    except SensorTelemetry.DoesNotExist:
        return Response(
            {
                "message": "No sensor data found for this field yet. Showing demo values.",
                "nitrogen": 90.0,
                "phosphorus": 42.0,
                "potassium": 43.0,
                "temperature": 24.2,
                "humidity": 80.3,
                "soil_ph": 6.5,
                "soil_moisture": 35.0,
                "prediction_result": "rice",
                "timestamp": timezone.now(),
            },
            status=status.HTTP_200_OK
        )

    try:
        n = float(latest.nitrogen)
        p = float(latest.phosphorus)
        k = float(latest.potassium)
        temp = float(latest.temperature)
        hum = float(latest.humidity)
        ph = float(latest.soil_ph)
        moisture = float(latest.soil_moisture)
    except (TypeError, ValueError, AttributeError) as err:
        return Response(
            {"error": f"Invalid sensor values in database: {err}"},
            status=status.HTTP_422_UNPROCESSABLE_ENTITY
        )

    expected_features = getattr(model, 'n_features_in_', 7)
    input_features = [[n, p, k, temp, hum, ph, moisture]]

    if expected_features != 7:
        return Response(
            {
                "error": f"Model expects {expected_features} features but we send 7.",
                "fix": "Re-run run_train.py to retrain with 7 features.",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    try:
        prediction = model.predict(input_features)[0]
        print(f" Crop prediction: {prediction}")
    except Exception as e:
        return Response(
            {"error": f"Prediction failed: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return Response(
        {
            "id": latest.id,
            "nitrogen": n,
            "phosphorus": p,
            "potassium": k,
            "temperature": temp,
            "humidity": hum,
            "soil_ph": ph,
            "soil_moisture": moisture,
            "prediction_result": str(prediction),
            "timestamp": latest.timestamp,
        },
        status=status.HTTP_200_OK
    )