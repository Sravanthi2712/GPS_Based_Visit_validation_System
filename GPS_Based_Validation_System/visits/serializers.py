from rest_framework import serializers
from .models import Visit


class VisitSerializer(serializers.ModelSerializer):

    sales_rep_name = serializers.CharField(
        source='sales_rep.name',
        read_only=True
    )

    customer_name = serializers.CharField(
        source='customer.name',
        read_only=True
    )

    class Meta:
        model = Visit
        fields = [
            'id',
            'sales_rep_name',
            'customer_name',
            'checkin_latitude',
            'checkin_longitude',
            'distance_in_meters',
            'checkin_time'
        ]


class CheckInSerializer(serializers.Serializer):
    sales_rep_id = serializers.IntegerField(required=False, allow_null=True)
    customer_id = serializers.IntegerField()

    latitude = serializers.FloatField(
        min_value=-90,
        max_value=90
    )

    longitude = serializers.FloatField(
        min_value=-180,
        max_value=180
    )