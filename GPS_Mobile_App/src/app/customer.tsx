import * as Location from "expo-location";
import Toast from "react-native-toast-message";
import { useState } from "react";
import { BASE_URL } from "../../config";
import { useAuth } from "./_layout";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";

export default function CustomerScreen() {
  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  const getCurrentLocation = async () => {
    setLocLoading(true);
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        Alert.alert("Error", "Please turn on GPS");
        setLocLoading(false);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        setLocLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const lat = location.coords.latitude.toString();
      const lng = location.coords.longitude.toString();

      setLatitude(lat);
      setLongitude(lng);

      Toast.show({
        type: "success",
        text1: "Location Captured",
        text2: `Lat: ${lat.slice(0, 7)}, Lng: ${lng.slice(0, 7)}`,
      });
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Unable to get current location.");
    } finally {
      setLocLoading(false);
    }
  };

  const { token } = useAuth();

  const createCustomer = async () => {
    if (!name || !latitude || !longitude) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fill in all fields",
      });
      return;
    }

    const latVal = parseFloat(latitude);
    const lngVal = parseFloat(longitude);

    if (isNaN(latVal) || latVal < -90 || latVal > 90) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Latitude must be between -90 and 90",
      });
      return;
    }

    if (isNaN(lngVal) || lngVal < -180 || lngVal > 180) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Longitude must be between -180 and 180",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/customers/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Customer created successfully",
        });

        setName("");
        setLatitude("");
        setLongitude("");
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: data.message || "Something went wrong",
        });
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>New Customer</Text>
          <Text style={styles.cardSubtitle}>Register store and GPS coordinates</Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Customer Name</Text>
              <TextInput
                placeholder="Store / Customer Name"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Latitude</Text>
              <TextInput
                placeholder="e.g. 16.502"
                placeholderTextColor="#94a3b8"
                value={latitude}
                onChangeText={setLatitude}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Longitude</Text>
              <TextInput
                placeholder="e.g. 80.648"
                placeholderTextColor="#94a3b8"
                value={longitude}
                onChangeText={setLongitude}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={getCurrentLocation}
              disabled={locLoading}
            >
              {locLoading ? (
                <ActivityIndicator color="#38bdf8" />
              ) : (
                <Text style={styles.secondaryButtonText}>📍 Get Current Location</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={createCustomer}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Create Customer</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a", // Sleek dark slate
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 450,
    backgroundColor: "#1e293b", // Slate card
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f8fafc",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 24,
    marginTop: 2,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94a3b8",
  },
  input: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#f8fafc",
    borderWidth: 1,
    borderColor: "#334155",
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: "#2563eb",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  secondaryButton: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#38bdf8",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#38bdf8",
  },
});