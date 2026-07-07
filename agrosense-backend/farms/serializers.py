from rest_framework import serializers
from .models import Field, Device


class FieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = Field
        fields = ['id', 'name', 'location', 'area', 'created_at']


class DeviceSerializer(serializers.ModelSerializer):
    field_name = serializers.CharField(source='field.name', read_only=True, default=None)

    class Meta:
        model = Device
        fields = [
            'id', 'name', 'device_key', 'is_active',
            'last_seen', 'created_at', 'field', 'field_name',
        ]