# alerts/urls.py
from django.urls import path
from .views import AlertListView, mark_alert_read, mark_all_read

urlpatterns = [
    path('list/',         AlertListView.as_view(), name='alert-list'),
    path('read/<int:alert_id>/', mark_alert_read,  name='alert-read'),
    path('clear-all/',    mark_all_read,            name='alert-clear'),
]