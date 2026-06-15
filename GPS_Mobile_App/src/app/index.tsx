import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useAuth } from "./_layout";
import { BASE_URL } from "../../config";

export default function HomeScreen() {
  const { user, token, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  const fetchStats = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${BASE_URL}/sales-representatives/dashboard-stats/`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.log("Error fetching stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [token]);

  if (!user) return null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563eb"]} />
      }
    >
      <View style={styles.contentWrapper}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user.name || "User"}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={[styles.roleBadge, isAdmin ? styles.adminBadge : styles.repBadge]}>
              <Text style={[styles.roleText, isAdmin ? styles.adminText : styles.repText]}>
                {isAdmin ? "Administrator" : "Sales Representative"}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Dashboard Summary</Text>
          {statsLoading && !refreshing ? (
            <View style={styles.statsLoader}>
              <ActivityIndicator size="small" color="#2563eb" />
            </View>
          ) : (
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>👥</Text>
                <Text style={styles.statValue}>{stats?.total_customers ?? 0}</Text>
                <Text style={styles.statLabel}>Customers</Text>
              </View>

              {isAdmin ? (
                <View style={styles.statCard}>
                  <Text style={styles.statIcon}>💼</Text>
                  <Text style={styles.statValue}>{stats?.total_reps ?? 0}</Text>
                  <Text style={styles.statLabel}>Sales Reps</Text>
                </View>
              ) : null}

              <View style={styles.statCard}>
                <Text style={styles.statIcon}>📍</Text>
                <Text style={styles.statValue}>{stats?.total_visits ?? 0}</Text>
                <Text style={styles.statLabel}>{isAdmin ? "Total Visits" : "My Visits"}</Text>
              </View>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Navigation Menu</Text>

        {/* Menu Options */}
        <View style={styles.menuContainer}>
          {/* Everyone can create Customers */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => router.push("/customer")}
          >
            <Text style={styles.menuIcon}>👤</Text>
            <Text style={styles.menuLabel}>Customers</Text>
            <Text style={styles.menuDesc}>Create and register new store locations</Text>
          </TouchableOpacity>

          {/* Admins only can create Sales Reps */}
          {isAdmin && (
            <TouchableOpacity
              style={styles.menuCard}
              onPress={() => router.push("/sales-representative")}
            >
              <Text style={styles.menuIcon}>💼</Text>
              <Text style={styles.menuLabel}>Sales Reps</Text>
              <Text style={styles.menuDesc}>Create new sales representative accounts</Text>
            </TouchableOpacity>
          )}

          {/* Sales Representatives only can Check In */}
          {!isAdmin && (
            <TouchableOpacity
              style={styles.menuCard}
              onPress={() => router.push("/check-in")}
            >
              <Text style={styles.menuIcon}>📍</Text>
              <Text style={styles.menuLabel}>Check In</Text>
              <Text style={styles.menuDesc}>Perform location validation & check-in</Text>
            </TouchableOpacity>
          )}

          {/* Everyone can view Visit History */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => router.push("/visit-history")}
          >
            <Text style={styles.menuIcon}>📋</Text>
            <Text style={styles.menuLabel}>Visit History</Text>
            <Text style={styles.menuDesc}>
              {isAdmin ? "View all reps' visit records" : "View your logged visits"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc", // Cool gray background
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
  },
  contentWrapper: {
    width: "100%",
    maxWidth: 600,
  },
  profileHeader: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statsSection: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 12,
  },
  statsLoader: {
    paddingVertical: 10,
    alignItems: "center",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
    fontWeight: "600",
    textAlign: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  profileInfo: {
    flex: 1,
    justifyContent: "center",
  },
  welcomeText: {
    fontSize: 12,
    color: "#64748b",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  userEmail: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 6,
  },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  adminBadge: {
    backgroundColor: "rgba(220, 38, 38, 0.1)", // soft red
  },
  adminText: {
    color: "#dc2626",
    fontSize: 11,
    fontWeight: "600",
  },
  repBadge: {
    backgroundColor: "rgba(37, 99, 235, 0.1)", // soft blue
  },
  repText: {
    color: "#2563eb",
    fontSize: 11,
    fontWeight: "600",
  },
  roleText: {
    fontSize: 11,
    fontWeight: "600",
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#475569",
    marginBottom: 12,
    paddingLeft: 4,
  },
  menuContainer: {
    flex: 1,
    gap: 16,
  },
  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "column",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  menuIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
  },
  menuDesc: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: "#ef4444", // Red button
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});