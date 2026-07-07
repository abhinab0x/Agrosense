
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Alert
from .serializers import AlertSerializer
from .utils import process_sensor_data

class AlertListView(APIView):
    def get(self, request):
        alerts = Alert.objects.filter(is_read=False).order_by('-created_at')
        serializer = AlertSerializer(alerts, many=True)
        return Response(serializer.data)

    def post(self, request):
        try:
            process_sensor_data(request.data)
            return Response({"status": "processed"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
def mark_alert_read(request, alert_id):
    try:
        alert = Alert.objects.get(id=alert_id)
        alert.is_read = True
        alert.save()
        return Response({"status": "marked as read"})
    except Alert.DoesNotExist:
        return Response({"error": "Alert not found"}, status=404)


@api_view(['POST'])
def mark_all_read(request):
    Alert.objects.filter(is_read=False).update(is_read=True)
    return Response({"status": "all cleared"})