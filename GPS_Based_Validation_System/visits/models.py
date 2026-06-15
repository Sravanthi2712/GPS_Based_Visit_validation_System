from django.db import models

# Create your models here.
from customers.models import Customer
from sales_representatives.models import SalesRepresentative


class Visit(models.Model):
    sales_rep = models.ForeignKey(
        SalesRepresentative,
        on_delete=models.CASCADE,
        related_name="visits"
    )

    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name="visits"
    )

    checkin_latitude = models.FloatField()
    checkin_longitude = models.FloatField()

    distance_in_meters = models.FloatField()

    checkin_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sales_rep.name} - {self.customer.name}"