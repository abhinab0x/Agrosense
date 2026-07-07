
from django.db import models

class Alert(models.Model):
    SEVERITY_CHOICES = [
        ('CRITICAL', 'Critical'),
        ('WARNING',  'Warning'),
        ('INFO',     'Info'),
    ]
    ALERT_TYPE_CHOICES = [
        ('MOISTURE',     'Moisture'),
        ('TEMPERATURE',  'Temperature'),
        ('IRRIGATION',   'Irrigation'),
        ('PH',           'pH'),
        ('HUMIDITY',     'Humidity'),
    ]

    alert_type = models.CharField(max_length=20, choices=ALERT_TYPE_CHOICES)
    message    = models.TextField()
    severity   = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='INFO')
    is_read    = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.severity}] {self.alert_type} — {self.message[:40]}"