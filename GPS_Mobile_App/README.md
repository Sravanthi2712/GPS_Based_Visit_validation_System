# FieldTrack Mobile Application

This is the mobile companion application for **FieldTrack - GPS Based Visit Validation System**. Built using React Native and Expo, this app allows sales representatives to register customer stores, fetch real-time GPS locations, and perform validated check-ins. It also features an Administrator view to create representatives and monitor check-in logs.

---

## Features

* **JWT Secure Auth**: Distinct views for Administrator and Sales Representative roles.
* **Real-Time GPS Location**: Integrates with device GPS (`expo-location`) to fetch coordinates automatically.
* **Customer Registration**: Register new customer stores along with their GPS locations.
* **Validated Check-In**: Check in at customer stores. The check-in is validated by the server and allowed only if the representative is within **200 meters** of the store.
* **Dashboard Summary**: Real-time counter of total customers, representatives, and visits.
* **Visit Logs**: Display historical check-in data with precise time and computed distance metrics.

---

## Directory Structure

* `/src/app/` - Expo Router file-based screens:
  * `index.tsx`: Main dashboard and navigation menu (stats summary).
  * `login.tsx`: Login and Register portal with Admin/Sales Rep toggle.
  * `customer.tsx`: Screen to add/register a customer store.
  * `sales-representative.tsx`: Screen for Admins to create representative accounts.
  * `check-in.tsx`: Location capture and validation check-in screen.
  * `visit-history.tsx`: List of logs of completed visits.
  * `_layout.tsx`: Root layout with context provider for JWT authentication and session storage.
* `config.js` - API settings defining the backend base server URL.

---

## Prerequisites

Ensure you have **Node.js** (v18+) and **npm** installed.

---

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure API Endpoint:**
   Before running the app, update the backend API endpoint to point to your Django development server.
   Open [config.js](file:///E:/FieldTrack/GPS_Mobile_App/config.js):
   ```javascript
   export const BASE_URL = "http://<YOUR_IP_ADDRESS>:8000";
   ```
   * **Android Emulator**: Keep `http://10.0.2.2:8000` (refers to host computer's localhost).
   * **iOS Simulator / Localhost**: Use `http://localhost:8000`.
   * **Physical Phone (Expo Go)**: Use your computer's local network IP address (e.g. `http://192.168.1.50:8000`). Make sure your phone and computer are on the same Wi-Fi network.

3. **Start the Expo Server:**
   ```bash
   npx expo start
   ```

4. **Launch the App:**
   * **Physical Device**: Download the **Expo Go** app from the App Store or Google Play Store. Scan the QR code printed in the terminal console.
   * **Android Emulator**: Press `a` in the terminal command prompt (requires Android Studio emulator to be running).
   * **iOS Simulator**: Press `i` in the terminal command prompt (macOS only, requires Xcode).
