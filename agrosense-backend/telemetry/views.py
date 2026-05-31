from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from .models import SensorTelemetry
from .serializers import SensorTelemetrySerializer

@api_view(['GET', 'POST'])
def sensor_data_list(request):
    if request.method == 'GET':
        # 1. Grab the active filter and custom date variables from the frontend URL
        filter_type = request.query_params.get('filter', None)
        custom_date = request.query_params.get('date', None)
        
        # Base query ordered by newest records first so they appear at the top of the table
        queryset = SensorTelemetry.objects.all().order_by('-timestamp')
        
        # Get today's date based on the server's local timezone configuration
        today = timezone.now().date()

        # 2. Apply filtering strictly if the frontend is querying history parameters
        if filter_type == 'today':
            queryset = queryset.filter(timestamp__date=today)
            
        elif filter_type == 'yesterday':
            queryset = queryset.filter(timestamp__date=today - timedelta(days=1))
            
        elif filter_type == 'custom' and custom_date:
            queryset = queryset.filter(timestamp__date=custom_date)
            
        else:
            # Fallback/Default: If no filter is provided (like the regular top cards update),
            # just grab the 50 most recent records to prevent slamming the database.
            queryset = queryset[:50]

        serializer = SensorTelemetrySerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        serializer = SensorTelemetrySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save() 
            
            print("\n💾 TELEMETRY SAVED TO DATABASE PERMANENTLY 💾")
            print(f"Data: {request.data}")
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)