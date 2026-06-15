import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { BASE_URL } from "../../config";
import { useAuth } from "./_layout";

export default function VisitHistoryScreen() {
  const { token } = useAuth();
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/visits/`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setVisits(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <Text style={styles.title}>Visit Records</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchVisits}>
            <Text style={styles.refreshText}>🔄 Refresh</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Fetching logs...</Text>
          </View>
        ) : visits.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyText}>No visit logs found</Text>
          </View>
        ) : (
          <FlatList
            data={visits}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => {
              const distance = Math.round(item.distance_in_meters);
              const isNear = distance <= 200;

              return (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.customerName}>{item.customer_name}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        isNear ? styles.successBadge : styles.failBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          isNear ? styles.successText : styles.failText,
                        ]}
                      >
                        {isNear ? "Verified" : "Invalid"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.details}>
                    <View style={styles.row}>
                      <Text style={styles.label}>Sales Rep:</Text>
                      <Text style={styles.value}>{item.sales_rep_name}</Text>
                    </View>

                    <View style={styles.row}>
                      <Text style={styles.label}>Distance:</Text>
                      <Text
                        style={[
                          styles.value,
                          isNear ? styles.nearText : styles.farText,
                        ]}
                      >
                        {distance} meters
                      </Text>
                    </View>

                    <View style={styles.row}>
                      <Text style={styles.label}>Latitude:</Text>
                      <Text style={styles.value}>{item.checkin_latitude}</Text>
                    </View>

                    <View style={styles.row}>
                      <Text style={styles.label}>Longitude:</Text>
                      <Text style={styles.value}>{item.checkin_longitude}</Text>
                    </View>
                  </View>

                  <Text style={styles.time}>
                    🕒 {new Date(item.checkin_time).toLocaleString()}
                  </Text>
                </View>
              );
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a", // Sleek dark slate
    alignItems: "center",
    padding: 16,
  },
  contentWrapper: {
    width: "100%",
    maxWidth: 600,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f8fafc",
  },
  refreshButton: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  refreshText: {
    color: "#38bdf8",
    fontSize: 13,
    fontWeight: "600",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#64748b",
    fontSize: 14,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyText: {
    color: "#64748b",
    fontSize: 16,
  },
  listContainer: {
    gap: 14,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#1e293b", // Slate card
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    paddingBottom: 10,
    marginBottom: 12,
  },
  customerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f8fafc",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  successBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
  },
  successText: {
    color: "#4ade80",
    fontSize: 11,
    fontWeight: "bold",
  },
  failBadge: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
  },
  failText: {
    color: "#f87171",
    fontSize: 11,
    fontWeight: "bold",
  },
  details: {
    gap: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 14,
    color: "#94a3b8",
  },
  value: {
    fontSize: 14,
    color: "#f8fafc",
    fontWeight: "600",
  },
  nearText: {
    color: "#4ade80",
  },
  farText: {
    color: "#f87171",
  },
  time: {
    marginTop: 14,
    fontSize: 12,
    color: "#64748b",
  },
});