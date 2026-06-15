from rest_framework import serializers
from .models import Customer

class CustomerSerializer(serializers.ModelSerializer):
    latitude = serializers.FloatField(
        min_value=-90,
        max_value=90,
        error_messages={
            'min_value': 'Latitude must be between -90 and 90.',
            'max_value': 'Latitude must be between -90 and 90.'
        }
    )
    longitude = serializers.FloatField(
        min_value=-180,
        max_value=180,
        error_messages={
            'min_value': 'Longitude must be between -180 and 180.',
            'max_value': 'Longitude must be between -180 and 180.'
        }
    )

    class Meta:
        model = Customer
        fields = "__all__"

    def validate_name(self, value):

        if not value.strip():
            raise serializers.ValidationError(
                "Customer name cannot be empty."
            )

        return value