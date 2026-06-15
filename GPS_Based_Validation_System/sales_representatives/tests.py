from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from sales_representatives.models import CustomUser


class SalesRepresentativeAPITest(APITestCase):

    def setUp(self):
        # Create an Admin user to authorize creation of sales reps
        self.admin_user = CustomUser.objects.create(
            username="admin@example.com",
            email="admin@example.com",
            first_name="Admin",
            role="ADMIN"
        )
        self.admin_user.set_password("adminpass")
        self.admin_user.save()

        # Get JWT Token for Admin
        refresh = RefreshToken.for_user(self.admin_user)
        self.token = str(refresh.access_token)

    def test_create_sales_rep(self):
        # Set authorization header
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)

        data = {
            "name": "Sai",
            "email": "sai@gmail.com",
            "password": "123456"
        }

        response = self.client.post(
            "/sales-representatives/",
            data,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

    def test_create_sales_rep_unauthorized(self):
        # Attempt without token
        data = {
            "name": "Sai",
            "email": "sai@gmail.com",
            "password": "123456"
        }

        response = self.client.post(
            "/sales-representatives/",
            data,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

    def test_register_and_login(self):
        # Test self-registration
        reg_data = {
            "email": "new_rep@example.com",
            "password": "password123",
            "name": "New Rep",
            "role": "SALES_REP"
        }
        reg_response = self.client.post(
            "/sales-representatives/register/",
            reg_data,
            format="json"
        )
        self.assertEqual(reg_response.status_code, status.HTTP_201_CREATED)
        self.assertIn("token", reg_response.data)

        # Test login
        login_data = {
            "email": "new_rep@example.com",
            "password": "password123"
        }
        login_response = self.client.post(
            "/sales-representatives/login/",
            login_data,
            format="json"
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn("token", login_response.data)