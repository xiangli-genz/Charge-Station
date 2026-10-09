import { useEffect, useState, type PropsWithChildren } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { getCurrentCustomer } from "../../services/authApi";
import { clearToken, getToken, saveToken } from "../../services/storage/tokenStorage";
import { setApiAuthToken } from "../../services/api/client";
import { useAuthStore } from "../../store/authStore";

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1
          }
        }
      })
  );
  const hydrated = useAuthStore((state) => state.hydrated);
  const token = useAuthStore((state) => state.token);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearToken);
  const markHydrated = useAuthStore((state) => state.markHydrated);

  useEffect(() => {
    setApiAuthToken(token);
  }, [token]);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const storedToken = await getToken();

        if (!storedToken) {
          setApiAuthToken(null);
          if (isMounted) {
            clearSession();
            markHydrated();
          }
          return;
        }

        setApiAuthToken(storedToken);
        const user = await getCurrentCustomer();
        await saveToken(storedToken);

        if (isMounted) {
          setSession(storedToken, user);
          markHydrated();
        }
      } catch {
        await clearToken();
        setApiAuthToken(null);

        if (isMounted) {
          clearSession();
          markHydrated();
        }
      }
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [clearSession, markHydrated, setSession]);

  if (!hydrated) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>{children}</NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f7fb"
  }
});
