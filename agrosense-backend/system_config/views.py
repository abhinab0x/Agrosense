from rest_framework.views import APIView
from rest_framework.response import Response
from .models import SystemSettings

class SettingsView(APIView):
    def get(self, request):
        settings = SystemSettings.objects.first()
        return Response({"moisture": settings.moisture_threshold, "temp": settings.temp_threshold})

    def post(self, request):
        settings = SystemSettings.objects.first()
        settings.moisture_threshold = request.data.get('moisture', settings.moisture_threshold)
        settings.temp_threshold = request.data.get('temp', settings.temp_threshold)
        settings.save()
        return Response({"status": "Settings updated"})