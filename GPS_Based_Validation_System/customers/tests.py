from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from sales_representatives.models import CustomUser


class CustomerAPITest(APITestCase):

    def setUp(self):
        # Create a Sales Rep user to authorize customer creation
        self.user = CustomUser.objects.create(
            username="rep@example.com",
            email="rep@example.com",
            first_name="Rep",
            role="SALES_REP"
        )
        self.user.set_password("reppass")
        self.user.save()

        # Get JWT Token
        refresh = RefreshToken.for_user(self.user)
        self.token = str(refresh.access_token)

    def test_create_customer(self):
        # Set authorization header
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)

        data = {
            "name": "ABC Store",
            "latitude": 16.502,
            "longitude": 80.648
        }

        response = self.client.post(
            "/customers/",
            data,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

    def test_create_customer_unauthorized(self):
        # Attempt without token
        data = {
            "name": "ABC Store",
            "latitude": 16.502,
            "longitude": 80.648
        }

        response = self.client.post(
            "/customers/",
            data,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

    def test_create_customer_invalid_coordinates(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)

        # Test latitude > 90
        response = self.client.post("/customers/", {
            "name": "ABC Store",
            "latitude": 90.01,
            "longitude": 80.648
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("latitude", response.data)

        # Test latitude < -90
        response = self.client.post("/customers/", {
            "name": "ABC Store",
            "latitude": -90.01,
            "longitude": 80.648
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("latitude", response.data)

        # Test longitude > 180
        response = self.client.post("/customers/", {
            "name": "ABC Store",
            "latitude": 16.502,
            "longitude": 180.01
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("longitude", response.data)

        # Test longitude < -180
        response = self.client.post("/customers/", {
            "name": "ABC Store",
            "latitude": 16.502,
            "longitude": -180.01
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("longitude", response.data)