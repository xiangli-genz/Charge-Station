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
import { loginCustomer } from "../../services/authApi";
import { setApiAuthToken } from "../../services/api/client";
import { ScreenContainer } from "../../components/common/ScreenContainer";
import { useAuthStore } from "../../store/authStore";
import { saveIdentifier, saveToken } from "../../services/storage/tokenStorage";
import { getApiErrorMessage } from "../../utils/apiError";
import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "PasswordLogin">;

export function PasswordLoginScreen({ route, navigation }: Props) {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const setSession = useAuthStore((state) => state.setSession);

  const handleLogin = async () => {
    if (!password) {
      setErrorMessage("Vui lòng nhập mật khẩu.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");

      const result = await loginCustomer({
        identifier: route.params.identifier,
        password
      });

      await Promise.all([
        saveToken(result.token),
        saveIdentifier(route.params.identifier)
      ]);
      setApiAuthToken(result.token);
      setSession(result.token, result.user);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Đăng nhập bằng mật khẩu thất bại."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Đăng nhập bằng mật khẩu</Text>
          <Text style={styles.subtitle}>
            Tài khoản chưa có mã PIN hoặc bạn chọn đăng nhập lại bằng mật khẩu.
          </Text>
          <Text style={styles.identifier}>{route.params.identifier}</Text>

          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
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
    color: "#17355c"
  },
  subtitle: {
    marginTop: 8,
    color: "#60738d",
    lineHeight: 21
  },
  identifier: {
    marginTop: 10,
    marginBottom: 18,
    color: "#6ca800",
    fontWeight: "700"
  },
  label: {
    marginBottom: 7,
    fontWeight: "600",
    color: "#17355c"
  },
  input: {
    borderWidth: 1,
    borderColor: "#d8e1ec",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: "#f9fbfd"
  },
  errorText: {
    marginTop: 10,
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
  }
});
