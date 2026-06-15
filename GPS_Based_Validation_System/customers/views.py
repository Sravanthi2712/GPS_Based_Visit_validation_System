from django.shortcuts import render
from .models import Customer
from .serializers import CustomerSerializer
from rest_framework import generics
from sales_representatives.views import IsAdminOrSalesRep

# Create your views here.

class CustomerListCreateView(generics.ListCreateAPIView):
    queryset=Customer.objects.all()
    serializer_class=CustomerSerializer
    permission_classes = [IsAdminOrSalesRep]
