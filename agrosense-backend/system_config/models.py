from django.db import models

class SystemSettings(models.Model):
    # Only one row of settings for the whole system
    moisture_threshold = models.FloatField(default=20.0)
    temp_threshold = models.FloatField(default=35.0)

    def __str__(self):
        return "Global System Settings"