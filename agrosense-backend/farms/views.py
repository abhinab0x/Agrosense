from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from .models import Field, Device
from .serializers import FieldSerializer, DeviceSerializer


class FieldListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        fields = Field.objects.filter(owner=request.user)
        return Response(FieldSerializer(fields, many=True).data)

    def post(self, request):
        name = request.data.get('name')
        if not name:
            return Response({'error': 'name is required'}, status=400)
        field = Field.objects.create(
            owner=request.user,
            name=name,
            location=request.data.get('location', ''),
            area=request.data.get('area', ''),
        )
        return Response(FieldSerializer(field).data, status=201)


class FieldDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        return Field.objects.filter(pk=pk, owner=user).first()

    def get(self, request, pk):
        field = self.get_object(pk, request.user)
        if not field:
            return Response({'error': 'Not found'}, status=404)
        return Response(FieldSerializer(field).data)

    def patch(self, request, pk):
        field = self.get_object(pk, request.user)
        if not field:
            return Response({'error': 'Not found'}, status=404)
        for attr in ('name', 'location', 'area'):
            if attr in request.data:
                setattr(field, attr, request.data[attr])
        field.save()
        return Response(FieldSerializer(field).data)

    def delete(self, request, pk):
        field = self.get_object(pk, request.user)
        if not field:
            return Response({'error': 'Not found'}, status=404)
        field.delete()
        return Response(status=204)


class DeviceCreateView(APIView):
    """Register a new PCB under one of the farmer's fields.
    Call this once per physical board, then set up that board's
    device_key via the captive-portal setup flow."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, field_id):
        field = Field.objects.filter(pk=field_id, owner=request.user).first()
        if not field:
            return Response({'error': 'Field not found'}, status=404)
        device = Device.objects.create(field=field, name=request.data.get('name', 'Sensor Node'))
        return Response(DeviceSerializer(device).data, status=201)


class DeviceListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, field_id):
        field = Field.objects.filter(pk=field_id, owner=request.user).first()
        if not field:
            return Response({'error': 'Field not found'}, status=404)
        return Response(DeviceSerializer(field.devices.all(), many=True).data)