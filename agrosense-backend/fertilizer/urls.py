from django.urls import path
from . import views

urlpatterns = [
    path('recommend/', views.recommend_fertilizer, name='recommend_fertilizer'),
]