from django.db import models

class SensorReading(models.Model):
    n = models.FloatField()
    p = models.FloatField()
    k = models.FloatField()
    temp = models.FloatField()
    humidity = models.FloatField()
    ph = models.FloatField()
    rainfall = models.FloatField()
    soil_moisture = models.FloatField()
    soil_type = models.CharField(max_length=50) # e.g., "Loamy"
    crop_type = models.CharField(max_length=50) # e.g., "Rice"
    irrigation_method = models.CharField(max_length=50)
    # Add other 9 fields here...
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reading at {self.timestamp}"