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
import { getLoginMethods } from "../../services/authApi";
import { ScreenContainer } from "../../components/common/ScreenContainer";
import { getApiErrorMessage } from "../../utils/apiError";
import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const [identifier, setIdentifier] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleContinue = async () => {
    const value = identifier.trim();

    if (!value) {
      setErrorMessage("Vui lòng nhập số điện thoại hoặc email.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      const methods = await getLoginMethods(value);

      navigation.navigate(methods.pinEnabled ? "PinLogin" : "PasswordLogin", {
        identifier: value
      } as never);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Không thể kiểm tra tài khoản."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>⚡</Text>
          </View>
          <Text style={styles.brandName}>TRẠM SẠC</Text>
        </View>
        <Text style={styles.title}>Chào mừng bạn đến với Trạm Sạc</Text>
        <Text style={styles.subtitle}>
          Nhập số điện thoại hoặc email để tiếp tục đăng nhập.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Số điện thoại hoặc email</Text>
          <TextInput
            style={styles.input}
            placeholder="Số điện thoại hoặc email"
            autoCapitalize="none"
            value={identifier}
            onChangeText={setIdentifier}
            onSubmitEditing={handleContinue}
          />
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          <Pressable
            style={[styles.primaryButton, submitting && styles.disabledButton]}
            onPress={handleContinue}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>Tiếp theo</Text>
            )}
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate("Register")}>
            <Text style={styles.secondaryButtonText}>Chưa có tài khoản? Đăng ký</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 24
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 26
  },
  logoCircle: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "#a6d51d"
  },
  logoText: {
    fontSize: 24,
    color: "#17355c"
  },
  brandName: {
    marginLeft: 10,
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#17355c"
  },
  title: {
    textAlign: "center",
    fontSize: 23,
    fontWeight: "700",
    color: "#17355c"
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 20,
    textAlign: "center",
    color: "#60738d",
    lineHeight: 21
  },
  card: {
    padding: 20,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dce5f0"
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
    color: "#c43d3d",
    lineHeight: 19
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
    fontSize: 16,
    fontWeight: "700"
  },
  secondaryButton: {
    alignItems: "center",
    marginTop: 16
  },
  secondaryButtonText: {
    color: "#6ca800",
    fontWeight: "700"
  }
});
