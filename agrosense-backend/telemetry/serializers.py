from rest_framework import serializers
from .models import SensorTelemetry


class SensorTelemetrySerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorTelemetry
        fields = '__all__'