from rest_framework.decorators import api_view
from rest_framework.response import Response
from .services.fertilizer_engine import get_fertilizer_prediction
from telemetry.models import SensorTelemetry


@api_view(['GET'])
def recommend_fertilizer(request):
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
    except SensorTelemetry.DoesNotExist:
        return Response({"error": "No telemetry data available yet for this field."}, status=404)

    try:
        suggestion = get_fertilizer_prediction(
            latest.nitrogen, latest.phosphorus, latest.potassium,
            latest.temperature, latest.humidity, latest.soil_ph, latest.soil_moisture
        )
        return Response({
            "recommendation": suggestion,
            "timestamp": latest.timestamp.isoformat(),
            "readings": {
                "nitrogen": latest.nitrogen,
                "phosphorus": latest.phosphorus,
                "potassium": latest.potassium,
                "temperature": latest.temperature,
                "humidity": latest.humidity,
                "soil_ph": latest.soil_ph,
                "soil_moisture": latest.soil_moisture,
            }
        })
    except FileNotFoundError as e:
        return Response({"error": f"Model not found: {str(e)}"}, status=500)
    except AttributeError as e:
        return Response({"error": f"Telemetry field mismatch: {str(e)}"}, status=500)
    except Exception as e:
        return Response({"error": str(e)}, status=500)