from django.urls import path
from . import views
from .views import RegisterView, sensor_data_list

urlpatterns = [
    path('register/', RegisterView.as_view(), name='api_register'),
    path('sensors/', views.sensor_data_list, name='sensor-data-list'),
    path('crop-suggestion/', views.get_crop_suggestion, name='crop-suggestion'),
    path('crop-baselines/', views.get_crop_baselines, name='crop_baselines'),
]