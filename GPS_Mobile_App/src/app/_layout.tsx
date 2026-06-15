import { Stack, router, useSegments } from "expo-router";
import Toast from "react-native-toast-message";
import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "SALES_REP";
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  login: () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

function NavigationGuard({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    const inAuthGroup = segments[0] === "login";

    if (!token && !inAuthGroup) {
      router.replace("/login");
    } else if (token && inAuthGroup) {
      router.replace("/");
    }
  }, [token, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      <NavigationGuard>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "#2563eb",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        >
          <Stack.Screen name="index" options={{ title: "Dashboard" }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="customer" options={{ title: "Create Customer" }} />
          <Stack.Screen name="sales-representative" options={{ title: "Create Sales Rep" }} />
          <Stack.Screen name="check-in" options={{ title: "Visit Check-In" }} />
          <Stack.Screen name="visit-history" options={{ title: "Visit History" }} />
        </Stack>
        <Toast />
      </NavigationGuard>
    </AuthContext.Provider>
  );
}