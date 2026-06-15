# API Documentation

This API supports the FieldTrack GPS-Based Visit Validation System. It validates sales representatives' real-time locations against customer coordinates using the **Haversine Formula** before allowing check-ins (maximum allowable distance is **200 meters**).

---

## Authentication

All secured endpoints require authentication using **JWT (JSON Web Tokens)**. To access these endpoints, pass the access token in the request header as follows:

```http
Authorization: Bearer <your_access_token>
```

---

## 1. Authentication Endpoints

### 1.1. User Registration
Register a new Custom User. If registering as a `SALES_REP`, a corresponding Sales Representative profile is created automatically.

* **Endpoint**: `POST /sales-representatives/register/` (or without trailing slash `/sales-representatives/register`)
* **Auth Required**: No (Public)
* **Request Body**:
  ```json
  {
      "email": "rep@example.com",
      "password": "securepassword123",
      "name": "Sai Kumar",
      "role": "SALES_REP" 
  }
  ```
  *(Note: `role` can be `ADMIN` or `SALES_REP`. Defaults to `SALES_REP` if omitted).*
* **Success Response (201 Created)**:
  ```json
  {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLC...",
      "user": {
          "id": 3,
          "name": "Sai Kumar",
          "email": "rep@example.com",
          "role": "SALES_REP"
      }
  }
  ```

---

### 1.2. User Login
Log in to generate a JWT token.

* **Endpoint**: `POST /sales-representatives/login/` (or without trailing slash `/sales-representatives/login`)
* **Auth Required**: No (Public)
* **Request Body**:
  ```json
  {
      "email": "rep@example.com",
      "password": "securepassword123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLC...",
      "user": {
          "id": 3,
          "name": "Sai Kumar",
          "email": "rep@example.com",
          "role": "SALES_REP"
      }
  }
  ```

---

## 2. Customer Endpoints

### 2.1. Create Customer
Register a new customer location with precise GPS coordinates.

* **Endpoint**: `POST /customers/` (or without trailing slash `/customers`)
* **Auth Required**: Yes (`ADMIN` or `SALES_REP`)
* **Request Body**:
  ```json
  {
      "name": "ABC Store",
      "latitude": 16.502,
      "longitude": 80.648
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
      "id": 1,
      "name": "ABC Store",
      "latitude": 16.502,
      "longitude": 80.648,
      "created_at": "2026-06-09T15:00:00Z"
  }
  ```

---

### 2.2. List Customers
Retrieve list of all registered customers.

* **Endpoint**: `GET /customers/` (or `/customers`)
* **Auth Required**: Yes (`ADMIN` or `SALES_REP`)
* **Success Response (200 OK)**:
  ```json
  [
      {
          "id": 1,
          "name": "ABC Store",
          "latitude": 16.502,
          "longitude": 80.648,
          "created_at": "2026-06-09T15:00:00Z"
      }
  ]
  ```

---

## 3. Sales Representative Endpoints

### 3.1. Create Sales Representative Profile (Admin Direct Creation)
Allows an administrator to manually create a sales representative profile.

* **Endpoint**: `POST /sales-representatives/` (or `/sales-representatives`)
* **Auth Required**: Yes (`ADMIN` only)
* **Request Body**:
  ```json
  {
      "name": "John Sales",
      "email": "john@example.com",
      "password": "johnpassword123"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
      "id": 4,
      "name": "John Sales",
      "email": "john@example.com",
      "created_at": "2026-06-15T12:00:00Z"
  }
  ```

---

### 3.2. Dashboard Stats
Retrieve stats summary tailored to the authenticated user's role.

* **Endpoint**: `GET /sales-representatives/dashboard-stats/` (or `/sales-representatives/dashboard-stats`)
* **Auth Required**: Yes (`ADMIN` or `SALES_REP`)
* **Success Response for Admin (200 OK)**:
  ```json
  {
      "total_customers": 15,
      "total_reps": 5,
      "total_visits": 42
  }
  ```
* **Success Response for Sales Rep (200 OK)**:
  ```json
  {
      "total_customers": 15,
      "total_visits": 8
  }
  ```

---

## 4. Visit & Check-In Endpoints

### 4.1. Check-In / Visit Validation
Submit a physical check-in request. The system validates the representative's coordinates against the customer's coordinates.

* **Endpoint**: `POST /visits/check-in/` (Alternative: `POST /checkin/`)
* **Auth Required**: Yes (`SALES_REP` only)
* **Request Body**:
  ```json
  {
      "customer_id": 1,
      "latitude": 16.5025,
      "longitude": 80.6482
  }
  ```
* **Successful Check-In Response (201 Created)**:
  *(Allowed because distance is under 200m)*
  ```json
  {
      "success": true,
      "distance": 59.27
  }
  ```
* **Rejected Check-In Response (400 Bad Request)**:
  *(Denied because distance is above 200m)*
  ```json
  {
      "success": false,
      "distance": 478.26,
      "message": "Check-in allowed only within 200 meters"
  }
  ```

---

### 4.2. Get Visit History
Retrieve visit records. Admins see all visits; representatives see only their own.

* **Endpoint**: `GET /visits/` (or `/visits`)
* **Auth Required**: Yes (`ADMIN` or `SALES_REP`)
* **Success Response (200 OK)**:
  ```json
  [
      {
          "id": 12,
          "sales_rep_name": "Sai Kumar",
          "customer_name": "ABC Store",
          "checkin_latitude": 16.5025,
          "checkin_longitude": 80.6482,
          "distance_in_meters": 59.27,
          "checkin_time": "2026-06-15T10:15:30Z"
      }
  ]
  ```

---

## Validation & Business Rules

### Customer Validation:
* Name cannot be empty.
* Latitude must be between `-90.0` and `90.0` degrees.
* Longitude must be between `-180.0` and `180.0` degrees.

### Check-in Validation:
* Customer and Sales Representative must exist.
* The physical distance between the representative's coordinates and the customer's coordinates must not exceed **200 meters**.
