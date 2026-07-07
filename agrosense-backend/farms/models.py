import uuid
from django.db import models
from django.contrib.auth.models import User


def generate_device_key():
    return uuid.uuid4().hex


class Field(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fields')
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=200, blank=True)
    area = models.CharField(max_length=50, blank=True)  # e.g. "2.5 Acre"
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.owner.username})"


class Device(models.Model):
    """Represents one physical PCB/ESP32 installed in a field."""
    field = models.ForeignKey(Field, on_delete=models.CASCADE, related_name='devices')
    name = models.CharField(max_length=100, default="Sensor Node")
    device_key = models.CharField(max_length=64, unique=True, default=generate_device_key, editable=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} — {self.field.name}"