from django.contrib import admin
from .models import Field, Device


@admin.register(Field)
class FieldAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'location', 'area', 'created_at')
    list_filter = ('owner',)


@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ('name', 'field', 'device_key', 'is_active', 'created_at')
    readonly_fields = ('device_key',)