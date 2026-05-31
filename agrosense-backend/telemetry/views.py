from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import SensorTelemetry
from .serializers import SensorTelemetrySerializer

# --- NEW: CUSTOM JWT CONFIGURATION FOR ADMIN ROUTING ---

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Extends the standard Simple JWT payload validation to append database role flags
    so that the React client can verify if a profile belongs to an administrator.
    """
    def validate(self, attrs):
        # Fire base validation to generate standard access/refresh keys
        data = super().validate(attrs)
        
        # Pull role metadata straight out of the authenticated auth_user row instance
        data['is_superuser'] = self.user.is_superuser
        data['is_staff'] = self.user.is_staff
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Overridden endpoint view linking custom serializer properties back to /api/token/ 
    """
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(APIView):
    """
    API View to handle new farmer user registration requests 
    coming from the React frontend register form layout.
    """
    permission_classes = [AllowAny] # Anyone can reach this page to sign up

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        # Validation: Ensure all fields are filled out
        if not username or not password or not email:
            return Response(
                {'error': 'Please provide username, email, and password.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validation: Check if username already exists in Django auth system
        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already taken.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Securely create the user (hashes the password automatically)
        User.objects.create_user(username=username, email=email, password=password)
        return Response(
            {'message': 'Farmer registered successfully!'}, 
            status=status.HTTP_201_CREATED
        )
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