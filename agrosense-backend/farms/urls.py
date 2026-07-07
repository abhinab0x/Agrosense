from django.urls import path
from .views import FieldListCreateView, FieldDetailView, DeviceCreateView, DeviceListView

urlpatterns = [
    path('', FieldListCreateView.as_view(), name='field-list-create'),
    path('<int:pk>/', FieldDetailView.as_view(), name='field-detail'),
    path('<int:field_id>/devices/', DeviceCreateView.as_view(), name='device-create'),
    path('<int:field_id>/devices/list/', DeviceListView.as_view(), name='device-list'),
]