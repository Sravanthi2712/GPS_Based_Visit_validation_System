from django.urls import path
from .views import SalesRepresentativeCreateView, RegisterView, LoginView, DashboardStatsView

urlpatterns = [
    path('', SalesRepresentativeCreateView.as_view(), name='create-sales-rep'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]
