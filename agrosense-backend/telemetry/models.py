from django.db import models
from farms.models import Device


class SensorTelemetry(models.Model):
    device = models.ForeignKey(
        Device, on_delete=models.CASCADE, related_name='readings',
        null=True, blank=True
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    temperature = models.FloatField()
    humidity = models.FloatField()
    soil_moisture = models.FloatField()
    soil_ph = models.FloatField(default=6.5)
    nitrogen = models.IntegerField(default=0)
    phosphorus = models.IntegerField(default=0)
    potassium = models.IntegerField(default=0)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        device_name = self.device.name if self.device else "Unassigned"
        return f"{device_name} @ {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"