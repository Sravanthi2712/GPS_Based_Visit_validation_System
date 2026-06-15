from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import SalesRepresentative, CustomUser


class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='first_name', read_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'role', 'name']


class UserRegisterSerializer(serializers.ModelSerializer):
    name = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = CustomUser
        fields = ['email', 'password', 'role', 'name']
        extra_kwargs = {
            'role': {'required': False}
        }

    def create(self, validated_data):
        email = validated_data['email']
        password = validated_data['password']
        name = validated_data['name']
        role = validated_data.get('role', 'SALES_REP')

        user = CustomUser.objects.create(
            email=email,
            username=email,
            first_name=name,
            role=role,
            password=make_password(password)
        )

        if role == 'SALES_REP':
            SalesRepresentative.objects.create(
                user=user,
                name=name,
                email=email,
                password=user.password
            )

        return user


class SalesRepresentativeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesRepresentative
        fields = ['id', 'name', 'email', 'password', 'created_at']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "Sales Representative name cannot be empty."
            )
        return value

    def create(self, validated_data):
        name = validated_data.get('name')
        email = validated_data.get('email')
        password = validated_data.get('password')

        # Create CustomUser first
        user = CustomUser.objects.create(
            email=email,
            username=email,
            first_name=name,
            role='SALES_REP',
            password=make_password(password)
        )

        # Create SalesRepresentative linked to user
        sales_rep = SalesRepresentative.objects.create(
            user=user,
            name=name,
            email=email,
            password=user.password
        )
        return sales_rep