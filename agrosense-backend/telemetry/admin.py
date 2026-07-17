from django.contrib import admin
from .models import SensorTelemetry

@admin.register(SensorTelemetry)
class SensorTelemetryAdmin(admin.ModelAdmin):
    list_display = ('id', 'device', 'timestamp', 'soil_moisture', 'temperature', 'humidity', 'soil_ph', 'nitrogen', 'phosphorus', 'potassium')
    list_filter = ('device',)
    ordering = ('-timestamp',)