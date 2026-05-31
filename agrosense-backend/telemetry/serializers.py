from rest_framework import serializers
from .models import SensorTelemetry

# Ensure this class name matches exactly word-for-word
class SensorTelemetrySerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorTelemetry
        fields = '__all__'