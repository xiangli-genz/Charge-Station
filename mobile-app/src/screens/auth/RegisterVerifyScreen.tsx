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
import { verifyCustomerRegistration } from "../../services/authApi";
import { setApiAuthToken } from "../../services/api/client";
import { ScreenContainer } from "../../components/common/ScreenContainer";
import { useAuthStore } from "../../store/authStore";
import { saveIdentifier, saveToken } from "../../services/storage/tokenStorage";
import { getApiErrorMessage } from "../../utils/apiError";
import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "RegisterVerify">;

export function RegisterVerifyScreen({ route }: Props) {
  const [code, setCode] = useState(route.params.devCode || "");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const setSession = useAuthStore((state) => state.setSession);

  const handleVerify = async () => {
    if (!/^\d{6}$/.test(code)) {
      setErrorMessage("Mã OTP phải gồm 6 chữ số.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      const result = await verifyCustomerRegistration({
        userId: route.params.userId,
        channel: route.params.channel,
        code
      });

      await Promise.all([
        saveToken(result.token),
        saveIdentifier(route.params.identifier)
      ]);
      setApiAuthToken(result.token);
      setSession(result.token, result.user);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Xác minh OTP thất bại."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Xác minh tài khoản</Text>
          <Text style={styles.subtitle}>
            Nhập mã OTP đã gửi tới {route.params.target}.
          </Text>

          {route.params.devCode ? (
            <Text style={styles.devHint}>Mã OTP dev: {route.params.devCode}</Text>
          ) : null}

          <TextInput
            style={styles.otpInput}
            placeholder="123456"
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={(value) => setCode(value.replace(/\D/g, ""))}
            onSubmitEditing={handleVerify}
          />

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <Pressable
            style={[styles.primaryButton, submitting && styles.disabledButton]}
            onPress={handleVerify}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>Xác minh OTP</Text>
            )}
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
  devHint: {
    marginTop: 12,
    color: "#6ca800",
    fontWeight: "700"
  },
  otpInput: {
    marginTop: 18,
    textAlign: "center",
    letterSpacing: 10,
    fontSize: 22,
    borderWidth: 1,
    borderColor: "#d8e1ec",
    borderRadius: 14,
    paddingVertical: 14,
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
    fontSize: 16,
    fontWeight: "700"
  }
});
