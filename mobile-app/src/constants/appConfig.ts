import { Platform } from "react-native";

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;

const defaultApiBaseUrl =
  Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

export const appConfig = {
  appName: "Tram Sac Mobile",
  apiBaseUrl: env?.EXPO_PUBLIC_API_BASE_URL || defaultApiBaseUrl
};
