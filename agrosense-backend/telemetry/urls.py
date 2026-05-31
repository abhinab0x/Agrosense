from django.urls import path
from . import views

urlpatterns = [
    path('sensors/', views.sensor_data_list, name='sensor-data-list'),
]