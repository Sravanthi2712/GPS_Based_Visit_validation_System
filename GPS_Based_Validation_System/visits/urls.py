from django.urls import path
from .views import VisitListView, CheckInView

urlpatterns = [
    path('', VisitListView.as_view(), name='visit-history'),
    path('check-in/', CheckInView.as_view(), name='check-in'),
]