import { ActivityIndicator, StyleSheet, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import { PasswordLoginScreen } from "../screens/auth/PasswordLoginScreen";
import { PinLoginScreen } from "../screens/auth/PinLoginScreen";
import { RegisterVerifyScreen } from "../screens/auth/RegisterVerifyScreen";
import { SetPinScreen } from "../screens/auth/SetPinScreen";
import { ForgotPinScreen } from "../screens/auth/ForgotPinScreen";
import { HomeScreen } from "../screens/home/HomeScreen";
import { MapScreen } from "../screens/station/MapScreen";
import { StationDetailScreen } from "../screens/station/StationDetailScreen";
import { BookingHistoryScreen } from "../screens/booking/BookingHistoryScreen";
import { FavoritesScreen } from "../screens/favorites/FavoritesScreen";
import { ActivityLogsScreen } from "../screens/activity/ActivityLogsScreen";
import { ProfileScreen } from "../screens/profile/ProfileScreen";
import { useAuthStore } from "../store/authStore";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthStore((state) => state.hydrated);
  const pinSetupRequired = useAuthStore((state) => state.pinSetupRequired);

  if (!hydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      key={token ? (pinSetupRequired ? "pin-setup" : "app") : "guest"}
      screenOptions={{
        contentStyle: { backgroundColor: "#f4f7fb" }
      }}
    >
      {token && pinSetupRequired ? (
        <Stack.Screen name="SetPin" component={SetPinScreen} options={{ title: "Tạo mã PIN" }} />
      ) : token ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Trang chủ" }} />
          <Stack.Screen name="SetPin" component={SetPinScreen} options={{ title: "Đổi mã PIN" }} />
          <Stack.Screen
            name="StationList"
            component={MapScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="StationDetail"
            component={StationDetailScreen}
            options={{ title: "Chi tiết trạm" }}
          />
          <Stack.Screen
            name="BookingHistory"
            component={BookingHistoryScreen}
            options={{ title: "Lịch sử đặt lịch" }}
          />
          <Stack.Screen
            name="Favorites"
            component={FavoritesScreen}
            options={{ title: "Trạm yêu thích" }}
          />
          <Stack.Screen
            name="ActivityLogs"
            component={ActivityLogsScreen}
            options={{ title: "Lịch sử hoạt động" }}
          />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Hồ sơ" }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Đăng nhập" }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Đăng ký" }} />
          <Stack.Screen
            name="PasswordLogin"
            component={PasswordLoginScreen}
            options={{ title: "Mật khẩu" }}
          />
          <Stack.Screen name="PinLogin" component={PinLoginScreen} options={{ title: "Mã PIN" }} />
          <Stack.Screen
            name="RegisterVerify"
            component={RegisterVerifyScreen}
            options={{ title: "Xác minh OTP" }}
          />
          <Stack.Screen name="ForgotPin" component={ForgotPinScreen} options={{ title: "Quên mã PIN" }} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});
