from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import BasePermission
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from .models import SalesRepresentative, CustomUser
from .serializers import SalesRepresentativeSerializer, UserRegisterSerializer


# Custom Role-Based Access Control Permissions
class IsAdminUserRole(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'ADMIN'
        )


class IsSalesRepUserRole(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'SALES_REP'
        )


class IsAdminOrSalesRep(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role in ['ADMIN', 'SALES_REP']
        )


class RegisterView(generics.CreateAPIView):
    authentication_classes = []
    permission_classes = []
    serializer_class = UserRegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            'token': str(refresh.access_token),
            'user': {
                'id': user.id,
                'name': user.first_name,
                'email': user.email,
                'role': user.role
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {"error": "Please provide both email and password"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=email, password=password)

        if not user:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            'token': str(refresh.access_token),
            'user': {
                'id': user.id,
                'name': user.first_name,
                'email': user.email,
                'role': user.role
            }
        }, status=status.HTTP_200_OK)


# Only Admin can create sales representatives directly
class SalesRepresentativeCreateView(generics.CreateAPIView):
    queryset = SalesRepresentative.objects.all()
    serializer_class = SalesRepresentativeSerializer
    permission_classes = [IsAdminUserRole]


from customers.models import Customer
from visits.models import Visit
from rest_framework.permissions import IsAuthenticated

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        total_customers = Customer.objects.count()

        if user.role == 'ADMIN':
            total_reps = SalesRepresentative.objects.count()
            total_visits = Visit.objects.count()
            return Response({
                "total_customers": total_customers,
                "total_reps": total_reps,
                "total_visits": total_visits
            }, status=status.HTTP_200_OK)
            
        elif user.role == 'SALES_REP':
            sales_rep = getattr(user, 'sales_rep_profile', None)
            total_visits = Visit.objects.filter(sales_rep=sales_rep).count() if sales_rep else 0
            return Response({
                "total_customers": total_customers,
                "total_visits": total_visits
            }, status=status.HTTP_200_OK)

        return Response({"error": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)