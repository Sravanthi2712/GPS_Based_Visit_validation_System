import * as Location from "expo-location";
import Toast from "react-native-toast-message";
import { useState, useEffect } from "react";
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
import { BASE_URL } from "../../config";
import { useAuth } from "./_layout";

export default function CheckInScreen() {
  const { token } = useAuth();
  const [customerId, setCustomerId] = useState("");
  const [selectedCustomerName, setSelectedCustomerName] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/customers/`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.log("Error fetching customers:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const getCurrentLocation = async () => {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location permission denied");
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
      Alert.alert("Error", "Unable to capture GPS coordinates");
    } finally {
      setLocLoading(false);
    }
  };

  const checkIn = async () => {
    if (!customerId || !latitude || !longitude) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please select a customer and capture location",
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
      const response = await fetch(`${BASE_URL}/visits/check-in/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer_id: parseInt(customerId),
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        }),
      });

      const data = await response.json();
      console.log(data);

      if (data.success) {
        Toast.show({
          type: "success",
          text1: "Check-In Successful",
          text2: `Distance: ${data.distance} meters`,
        });
        setCustomerId("");
        setSelectedCustomerName("");
        setLatitude("");
        setLongitude("");
      } else {
        Toast.show({
          type: "error",
          text1: "Check-In Denied",
          text2: data.message,
        });
      }
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: "Network Error",
        text2: "Unable to connect to server",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} nestedScrollEnabled={true}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>GPS Check-In</Text>
          <Text style={styles.cardSubtitle}>Validate representative physical location</Text>

          <View style={styles.form}>
            {/* Customer Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select Customer</Text>
              <TouchableOpacity
                style={styles.dropdownSelector}
                onPress={() => setIsOpen(!isOpen)}
              >
                <Text style={styles.dropdownSelectorText}>
                  {selectedCustomerName || "Choose a Store / Customer"}
                </Text>
                <Text style={styles.dropdownArrow}>{isOpen ? "▲" : "▼"}</Text>
              </TouchableOpacity>

              {isOpen && (
                <View style={styles.dropdownListContainer}>
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
                    {customers.map((item) => (
                      <TouchableOpacity
                        key={item.id.toString()}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setCustomerId(item.id.toString());
                          setSelectedCustomerName(item.name);
                          setIsOpen(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{item.name}</Text>
                      </TouchableOpacity>
                    ))}
                    {customers.length === 0 && (
                      <View style={styles.dropdownEmpty}>
                        <Text style={styles.dropdownEmptyText}>No customers registered</Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Latitude</Text>
              <TextInput
                placeholder="Current Latitude"
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
                placeholder="Current Longitude"
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
              onPress={checkIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Check In</Text>
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
  dropdownSelector: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#334155",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownSelectorText: {
    fontSize: 16,
    color: "#f8fafc",
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#94a3b8",
  },
  dropdownListContainer: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    marginTop: 4,
    maxHeight: 180,
    overflow: "hidden",
  },
  dropdownList: {
    maxHeight: 180,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  dropdownItemText: {
    fontSize: 15,
    color: "#f8fafc",
  },
  dropdownEmpty: {
    padding: 16,
    alignItems: "center",
  },
  dropdownEmptyText: {
    color: "#64748b",
    fontSize: 14,
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
