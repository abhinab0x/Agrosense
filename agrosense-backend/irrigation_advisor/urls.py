from django.urls import path
from .views import advice_view

urlpatterns = [
    path('get-advice/', advice_view),
]