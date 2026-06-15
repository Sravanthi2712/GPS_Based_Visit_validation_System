from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from customers.models import Customer
from sales_representatives.models import SalesRepresentative
from sales_representatives.views import IsAdminOrSalesRep, IsSalesRepUserRole
from .models import Visit
from .serializers import VisitSerializer, CheckInSerializer
from utils.haversine import calculate_distance


# Create your views here.
class VisitListView(generics.ListAPIView):
    serializer_class = VisitSerializer
    permission_classes = [IsAdminOrSalesRep]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Visit.objects.all().order_by('-checkin_time')
        elif user.role == 'SALES_REP':
            sales_rep = getattr(user, 'sales_rep_profile', None)
            if sales_rep:
                return Visit.objects.filter(sales_rep=sales_rep).order_by('-checkin_time')
            return Visit.objects.none()
        return Visit.objects.none()


class CheckInView(APIView):
    permission_classes = [IsSalesRepUserRole]

    def post(self, request):
        serializer = CheckInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        customer = Customer.objects.filter(
            id=data["customer_id"]
        ).first()

        if not customer:
            return Response(
                {"success": False, "message": "Customer not found"}, status=404
            )

        # Resolve Sales Representative from authenticated user
        sales_rep = getattr(request.user, 'sales_rep_profile', None)

        # Fallback to ID if profile not found on user object (e.g. manual CLI call or tests)
        if not sales_rep and data.get("sales_rep_id"):
            sales_rep = SalesRepresentative.objects.filter(
                id=data.get("sales_rep_id")
            ).first()

        if not sales_rep:
            return Response(
                {"success": False, "message": "Sales Representative not found"}, status=404
            )

        distance = calculate_distance(
            customer.latitude,
            customer.longitude,
            data["latitude"],
            data["longitude"]
        )

        if distance > 200:
            return Response({
                "success": False,
                "distance": round(distance, 2),
                "message": "Check-in allowed only within 200 meters"
            }, status=status.HTTP_400_BAD_REQUEST)

        Visit.objects.create(
            sales_rep=sales_rep,
            customer=customer,
            checkin_latitude=data["latitude"],
            checkin_longitude=data["longitude"],
            distance_in_meters=distance
        )

        return Response({
            "success": True,
            "distance": round(distance, 2)
        }, status=201)