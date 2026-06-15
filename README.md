# FieldTrack - GPS Based Visit Validation System

FieldTrack is a GPS-based visit validation system designed for managing and verifying field sales representatives. It prevents fake customer visits by validating the representative's physical location (captured via mobile GPS) against the customer's registered coordinates before permitting a visit check-in.

The distance is calculated using the **Haversine Formula**. A visit is successfully validated and recorded only if the representative is within **200 meters** of the customer location.


---

## Features

### 👥 Customer Management
* Create and store customer records with name and GPS coordinates (Latitude & Longitude).
* View registered customer lists.

### 💼 Sales Representative Management
* Register new sales representative accounts.
* Create sales representative profiles (Administrator only).

### 📍 GPS-Based Check-in
* Capture real-time device GPS coordinates.
* Calculate the real-time distance between the representative and the customer.
* Validate and record visit details if the distance is within **200 meters**.
* Reject check-in attempts outside the 200-meter range.

### 📋 Visit History
* Store history of all successful check-ins.
* Keep track of the sales representative, customer, coordinates, check-in time, and calculated distance.

### 📱 Mobile UI
* **Dashboard Screen**: Displays summary stats (Customers count, Sales Rep count, Visits log).
* **Customers Screen**: Quick form to register new customers and capture GPS.
* **Sales Rep Screen**: Form for Admins to create representative accounts.
* **Check-In Screen**: Dropdown to select a customer, fetch GPS coordinates, and check in.
* **Visit History Screen**: Tabulated historical visit logs.

---

## Repository Structure

```text
FieldTrack/
├── GPS_Based_Validation_System/      # Django Backend Project
│   ├── customers/                    # Customer App (Models, Views, Serializers)
│   ├── sales_representatives/        # Sales Reps App (Models, Views, RBAC)
│   ├── visits/                       # Visits & Check-In App (Validation logic)
│   ├── utils/                        # Utilities (Haversine distance calculation)
│   ├── db.sqlite3                    # Database
│   ├── manage.py                     # Django management script
│   └── requirements.txt              # Backend python dependencies
│
├── GPS_Mobile_App/                   # React Native (Expo) Mobile Application
│   ├── src/
│   │   ├── app/                      # Expo Router Screens (Login, Dashboard, Check-In, etc.)
│   │   ├── components/               # Custom UI Components
│   │   ├── constants/                # Global configurations
│   │   └── hooks/                    # Reusable React Hooks
│   ├── assets/                       # Images, icons, and fonts
│   ├── config.js                     # Mobile API endpoint config
│   └── package.json                  # Mobile package dependencies
│
├── README.md                         # Main Documentation
└── API_DOCUMENTATION.md              # Detailed API Endpoint Reference
```

---

## Tech Stack

* **Backend**: Python 3.x, Django 5.x, Django REST Framework (DRF), Simple JWT (for authentication), CORS headers, SQLite database.
* **Mobile App**: React Native, Expo, Expo Router, TypeScript, Vanilla CSS/StyleSheet.

---

## Database Schema Overview

### 1. Custom Users (`sales_representatives.CustomUser`)
* Standard Django auth user extended with roles: `ADMIN` or `SALES_REP`.
* Authenticated using Email as the primary username.

### 2. Customers (`customers.Customer`)
* Fields: `id` (int), `name` (string), `latitude` (float), `longitude` (float), `created_at` (datetime).

### 3. Sales Representatives Profile (`sales_representatives.SalesRepresentative`)
* Fields: `id` (int), `user` (One-to-One link to CustomUser), `name` (string), `email` (string), `password` (hashed string), `created_at` (datetime).

### 4. Visits (`visits.Visit`)
* Fields: `id` (int), `sales_rep` (Foreign Key), `customer` (Foreign Key), `checkin_latitude` (float), `checkin_longitude` (float), `distance_in_meters` (float), `checkin_time` (datetime).

---

## Getting Started

### 1. Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd GPS_Based_Validation_System
   ```

2. **Create and activate a virtual environment:**
   * **Windows:**
     ```bash
     python -m venv venv
     venv\Scripts\activate
     ```
   * **macOS/Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install the dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Apply database migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Start the local API development server:**
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```
   *(Running on `0.0.0.0` allows the mobile application running on your physical device or emulator to connect to the server).*

---

### 2. Mobile App Setup

1. **Navigate to the mobile app directory:**
   ```bash
   cd GPS_Mobile_App
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure the Backend API URL:**
   Open [config.js](file:///E:/FieldTrack/GPS_Mobile_App/config.js) and update `BASE_URL` with your local development environment IP:
   * **Android Emulator:** Keep `http://10.0.2.2:8000` (Android redirects this to host localhost).
   * **iOS Simulator / Localhost:** Use `http://localhost:8000` or `http://127.0.0.1:8000`.
   * **Physical Device (Expo Go):** Find your computer's local network IP (e.g., `192.168.1.10`) and set it:
     ```javascript
     export const BASE_URL = "http://192.168.1.10:8000";
     ```

4. **Start the Expo server:**
   ```bash
   npx expo start
   ```

5. **Open the app:**
   * Scan the terminal's QR code using the **Expo Go** app on your physical device.
   * Or press `a` for Android Emulator, or `i` for iOS Simulator.

---

## Authentication & Access Control (RBAC)

The system uses **JWT (JSON Web Token) Authentication** for securing its endpoints. 

### Roles:
1. **ADMIN**:
   * Access dashboard stats for the entire organization (total customers, total sales representatives, total visits).
   * Register new Administrators and Sales Representatives.
   * View all visit logs across all representatives.
   * Register new customers.
2. **SALES_REP**:
   * Access individual stats (total customers, own visit count).
   * Register new customers.
   * Perform GPS-based check-ins.
   * View their own history of logged visits.

---

## API Summary

All endpoints (except login/register) require passing the JWT token in the headers:
`Authorization: Bearer <your_access_token>`

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/sales-representatives/register/` | Public | Register a new user (Admin / Sales Rep) |
| **POST** | `/sales-representatives/login/` | Public | Login to get a JWT access token |
| **POST** | `/customers/` | Admin & Sales Rep | Register a new customer with GPS coordinates |
| **GET** | `/customers/` | Admin & Sales Rep | List all registered customers |
| **POST** | `/visits/check-in/` | Sales Rep Only | Validate coordinates and check in |
| **POST** | `/checkin/` | Sales Rep Only | Direct/Alternative Check-in endpoint |
| **GET** | `/visits/` | Admin & Sales Rep | Retrieve visit history (Admins see all; Sales Reps see own) |
| **GET** | `/sales-representatives/dashboard-stats/` | Admin & Sales Rep | Fetch summary statistics for the dashboard |

> [!NOTE]
> Detailed JSON payloads and response structures are available in the [API_DOCUMENTATION.md](API_DOCUMENTATION.md) file.

---

## Testing

Run backend tests using:
```bash
python manage.py test
```
The test suite validates:
* Customer Creation & coordinate boundaries (-90 to 90 latitude, -180 to 180 longitude).
* Sales Representative Creation & registration rules.
* Visit creation and correct distance calculation boundary (within 200m accepted; > 200m rejected).

---

## Author

 Sravanthi Lakkaraju
