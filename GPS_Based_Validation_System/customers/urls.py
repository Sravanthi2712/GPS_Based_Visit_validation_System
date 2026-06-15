from django.urls import path
from .views import CustomerListCreateView

urlpatterns=[
    path('',CustomerListCreateView.as_view(),name='create-customer'),
]