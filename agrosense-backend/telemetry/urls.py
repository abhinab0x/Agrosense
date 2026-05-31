from django.urls import path
from . import views
from .views import RegisterView, sensor_data_list

urlpatterns = [
    path('register/', RegisterView.as_view(), name='api_register'),
    path('sensors/', views.sensor_data_list, name='sensor-data-list'),
]