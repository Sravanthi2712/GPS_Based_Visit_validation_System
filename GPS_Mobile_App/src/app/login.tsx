import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import Toast from "react-native-toast-message";
import { BASE_URL } from "../../config";
import { useAuth } from "./_layout";

export default function LoginScreen() {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false); // Default to Sales Rep Mode
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fill in all fields",
      });
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? "/sales-representatives/login/" : "/sales-representatives/register/";
      const role = isAdminMode ? "ADMIN" : "SALES_REP";
      const body = isLogin
        ? { email, password }
        : { email, password, name, role };

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          Toast.show({
            type: "success",
            text1: "Welcome Back!",
            text2: "Logged in successfully",
          });
          login(data.token, data.user);
        } else {
          // Registration completed successfully -> do NOT login automatically.
          // Show toast, switch to Login tab, and clear signup fields.
          Toast.show({
            type: "success",
            text1: "Registration Successful",
            text2: "Please login with your new credentials",
          });
          setIsLogin(true); // Switch to login screen
          setName(""); // Clear name field
        }
      } else {
        Toast.show({
          type: "error",
          text1: "Authentication Failed",
          text2: data.error || data.message || "Invalid credentials",
        });
      }
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: "Connection Error",
        text2: "Unable to connect to the server",
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Top Toggle Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.adminToggleBtn}
            onPress={() => {
              setIsAdminMode(!isAdminMode);
              setIsLogin(true); // Default to login on mode switch
              setEmail("");
              setPassword("");
              setName("");
            }}
          >
            <Text style={styles.adminToggleBtnText}>
              {isAdminMode ? "⬅️ Sales Rep Portal" : "⚙️ Admin Portal"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>FieldTrack</Text>
          <Text style={[styles.subtitle, isAdminMode ? styles.adminText : styles.repText]}>
            {isAdminMode ? "Administrator Portal" : "Sales Representative Portal"}
          </Text>

          {/* Tab Bar */}
          {isAdminMode && (
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, isLogin && styles.activeTab]}
                onPress={() => setIsLogin(true)}
              >
                <Text style={[styles.tabText, isLogin && styles.activeTabText]}>
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, !isLogin && styles.activeTab]}
                onPress={() => setIsLogin(false)}
              >
                <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>
                  Register
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor="#94a3b8"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isAdminMode && styles.adminSubmitButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isLogin ? "Sign In" : "Sign Up"}
                </Text>
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
  topBar: {
    paddingTop: Platform.OS === "ios" ? 10 : 0,
    paddingHorizontal: 0,
    flexDirection: "row",
    justifyContent: "flex-start",
    width: "100%",
    maxWidth: 450,
    marginBottom: 16,
  },
  adminToggleBtn: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  adminToggleBtnText: {
    color: "#38bdf8",
    fontSize: 13,
    fontWeight: "bold",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    paddingTop: 10,
  },
  card: {
    width: "100%",
    maxWidth: 450,
    backgroundColor: "#1e293b", // Slate card
    borderRadius: 24,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#f8fafc",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 28,
    marginTop: 4,
    fontWeight: "600",
  },
  adminText: {
    color: "#f87171", // soft red for admin
  },
  repText: {
    color: "#38bdf8", // soft blue for sales rep
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#2563eb", // Primary blue
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
  },
  activeTabText: {
    color: "#f8fafc",
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
  submitButton: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  adminSubmitButton: {
    backgroundColor: "#dc2626", // Red button for admin submit
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f8fafc",
  },
});

