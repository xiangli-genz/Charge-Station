import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { loginCustomerByPin } from "../../services/authApi";
import { setApiAuthToken } from "../../services/api/client";
import { ScreenContainer } from "../../components/common/ScreenContainer";
import { useAuthStore } from "../../store/authStore";
import { saveIdentifier, saveToken } from "../../services/storage/tokenStorage";
import { getApiErrorMessage } from "../../utils/apiError";
import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "PinLogin">;

export function PinLoginScreen({ route, navigation }: Props) {
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const setSession = useAuthStore((state) => state.setSession);

  const handleLogin = async () => {
    if (!/^\d{6}$/.test(pin)) {
      setErrorMessage("Mã PIN phải gồm 6 chữ số.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");

      const result = await loginCustomerByPin({
        identifier: route.params.identifier,
        pin
      });

      await Promise.all([
        saveToken(result.token),
        saveIdentifier(route.params.identifier)
      ]);
      setApiAuthToken(result.token);
      setSession(result.token, result.user);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Đăng nhập bằng mã PIN thất bại."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Nhập mã PIN</Text>
          <Text style={styles.subtitle}>Mã PIN đã được đăng ký với tài khoản này.</Text>
          <Text style={styles.identifier}>{route.params.identifier}</Text>

          <TextInput
            style={styles.pinInput}
            placeholder="••••••"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            value={pin}
            onChangeText={(value) => setPin(value.replace(/\D/g, ""))}
            onSubmitEditing={handleLogin}
          />

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <Pressable
            style={[styles.primaryButton, submitting && styles.disabledButton]}
            onPress={handleLogin}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>Đăng nhập</Text>
            )}
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("ForgotPin", { identifier: route.params.identifier })}
          >
            <Text style={styles.secondaryText}>Quên mã PIN?</Text>
          </Pressable>

          <Pressable
            style={styles.altButton}
            onPress={() => navigation.navigate("PasswordLogin", { identifier: route.params.identifier })}
          >
            <Text style={styles.altText}>Dùng mật khẩu</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: "center"
  },
  card: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dce5f0"
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: "#17355c"
  },
  subtitle: {
    marginTop: 8,
    textAlign: "center",
    color: "#60738d",
    lineHeight: 21
  },
  identifier: {
    marginTop: 10,
    marginBottom: 18,
    textAlign: "center",
    color: "#6ca800",
    fontWeight: "700"
  },
  pinInput: {
    textAlign: "center",
    letterSpacing: 12,
    fontSize: 24,
    borderWidth: 1,
    borderColor: "#d8e1ec",
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: "#f9fbfd"
  },
  errorText: {
    marginTop: 10,
    textAlign: "center",
    color: "#c43d3d"
  },
  primaryButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    marginTop: 18,
    borderRadius: 12,
    backgroundColor: "#1d5fbf"
  },
  disabledButton: {
    opacity: 0.7
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16
  },
  secondaryButton: {
    alignItems: "center",
    marginTop: 16
  },
  secondaryText: {
    color: "#6ca800",
    fontWeight: "700"
  },
  altButton: {
    alignItems: "center",
    marginTop: 12
  },
  altText: {
    color: "#17355c",
    fontWeight: "600"
  }
});
