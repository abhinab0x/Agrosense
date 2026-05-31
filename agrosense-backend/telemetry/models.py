from django.db import models

class SensorTelemetry(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    temperature = models.FloatField()
    humidity = models.FloatField()
    soil_moisture = models.FloatField()
    soil_ph = models.FloatField(default=6.5)
    nitrogen = models.IntegerField(default=0)
    phosphorus = models.IntegerField(default=0)
    potassium = models.IntegerField(default=0)

    class Meta:
        ordering = ['-timestamp'] # Latest readings appear first

    def __str__(self):
        return f"Reading at {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')} - Temp: {self.temperature}°C"