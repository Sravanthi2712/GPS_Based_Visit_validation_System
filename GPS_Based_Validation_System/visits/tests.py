from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from customers.models import Customer
from sales_representatives.models import SalesRepresentative, CustomUser


class CheckInAPITest(APITestCase):

    def setUp(self):
        # Create Customer
        self.customer = Customer.objects.create(
            name="ABC Store",
            latitude=16.502,
            longitude=80.648
        )

        # Create CustomUser and SalesRepresentative linked together
        self.user = CustomUser.objects.create(
            username="sai@gmail.com",
            email="sai@gmail.com",
            first_name="Sai",
            role="SALES_REP"
        )
        self.user.set_password("123456")
        self.user.save()

        self.sales_rep = SalesRepresentative.objects.create(
            user=self.user,
            name="Sai",
            email="sai@gmail.com",
            password=self.user.password
        )

        # Get JWT Token
        refresh = RefreshToken.for_user(self.user)
        self.token = str(refresh.access_token)

    def test_valid_checkin(self):
        # Set authorization header
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)

        data = {
            "sales_rep_id": self.sales_rep.id,
            "customer_id": self.customer.id,
            "latitude": 16.502,
            "longitude": 80.648
        }

        response = self.client.post(
            "/visits/check-in/",
            data,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        self.assertTrue(
            response.data["success"]
        )

    def test_invalid_checkin(self):
        # Set authorization header
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)

        data = {
            "sales_rep_id": self.sales_rep.id,
            "customer_id": self.customer.id,
            "latitude": 16.700,
            "longitude": 80.900
        }

        response = self.client.post(
            "/visits/check-in/",
            data,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.assertFalse(
            response.data["success"]
        )

    def test_checkin_invalid_coordinates(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)

        # Test latitude > 90
        response = self.client.post("/visits/check-in/", {
            "sales_rep_id": self.sales_rep.id,
            "customer_id": self.customer.id,
            "latitude": 90.01,
            "longitude": 80.648
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("latitude", response.data)

        # Test latitude < -90
        response = self.client.post("/visits/check-in/", {
            "sales_rep_id": self.sales_rep.id,
            "customer_id": self.customer.id,
            "latitude": -90.01,
            "longitude": 80.648
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("latitude", response.data)

        # Test longitude > 180
        response = self.client.post("/visits/check-in/", {
            "sales_rep_id": self.sales_rep.id,
            "customer_id": self.customer.id,
            "latitude": 16.502,
            "longitude": 180.01
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("longitude", response.data)

        # Test longitude < -180
        response = self.client.post("/visits/check-in/", {
            "sales_rep_id": self.sales_rep.id,
            "customer_id": self.customer.id,
            "latitude": 16.502,
            "longitude": -180.01
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("longitude", response.data)