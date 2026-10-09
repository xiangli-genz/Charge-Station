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
import {
  requestPinResetOtp,
  resetPinWithOtp,
  resetPinWithPassword
} from "../../services/authApi";
import { setApiAuthToken } from "../../services/api/client";
import { ScreenContainer } from "../../components/common/ScreenContainer";
import { useAuthStore } from "../../store/authStore";
import { saveIdentifier, saveToken } from "../../services/storage/tokenStorage";
import { getApiErrorMessage } from "../../utils/apiError";
import type { RootStackParamList } from "../../navigation/types";

type Mode = "password" | "otp";
type Props = NativeStackScreenProps<RootStackParamList, "ForgotPin">;

export function ForgotPinScreen({ route }: Props) {
  const [identifier, setIdentifier] = useState(route.params?.identifier || "");
  const [mode, setMode] = useState<Mode>("password");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [devCode, setDevCode] = useState("");
  const [otpTarget, setOtpTarget] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const setSession = useAuthStore((state) => state.setSession);

  const validatePin = () => {
    if (!/^\d{6}$/.test(pin)) {
      setErrorMessage("Mã PIN phải gồm 6 chữ số.");
      return false;
    }

    if (pin !== confirmPin) {
      setErrorMessage("Mã PIN xác nhận chưa khớp.");
      return false;
    }

    return true;
  };

  const handleResetWithPassword = async () => {
    if (!identifier.trim() || !password) {
      setErrorMessage("Vui lòng nhập tài khoản và mật khẩu.");
      return;
    }

    if (!validatePin()) {
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      const result = await resetPinWithPassword({
        identifier: identifier.trim(),
        password,
        pin
      });

      await Promise.all([saveToken(result.token), saveIdentifier(identifier.trim())]);
      setApiAuthToken(result.token);
      setSession(result.token, result.user);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Không thể đặt lại mã PIN bằng mật khẩu."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestOtp = async () => {
    if (!identifier.trim()) {
      setErrorMessage("Vui lòng nhập số điện thoại hoặc email.");
      return;
    }

    try {
      setRequestingOtp(true);
      setErrorMessage("");
      const result = await requestPinResetOtp({
        identifier: identifier.trim(),
        channel: "email"
      });

      setOtpTarget(result.target);
      setDevCode(result.devCode || "");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Không gửi được mã OTP."));
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleResetWithOtp = async () => {
    if (!identifier.trim() || !/^\d{6}$/.test(code)) {
      setErrorMessage("Vui lòng nhập tài khoản và mã OTP 6 số.");
      return;
    }

    if (!validatePin()) {
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      const result = await resetPinWithOtp({
        identifier: identifier.trim(),
        channel: "email",
        code,
        pin
      });

      await Promise.all([saveToken(result.token), saveIdentifier(identifier.trim())]);
      setApiAuthToken(result.token);
      setSession(result.token, result.user);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Không thể đặt lại mã PIN bằng OTP."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Quên mã PIN</Text>
          <Text style={styles.subtitle}>
            Bạn có thể xác nhận bằng mật khẩu hoặc gửi OTP qua email để đặt lại mã PIN.
          </Text>

          <View style={styles.modeRow}>
            <Pressable
              style={[styles.modeButton, mode === "password" && styles.modeButtonActive]}
              onPress={() => setMode("password")}
            >
              <Text style={[styles.modeText, mode === "password" && styles.modeTextActive]}>
                Dùng mật khẩu
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeButton, mode === "otp" && styles.modeButtonActive]}
              onPress={() => setMode("otp")}
            >
              <Text style={[styles.modeText, mode === "otp" && styles.modeTextActive]}>
                Gửi OTP email
              </Text>
            </Pressable>
          </View>

          <Text style={styles.label}>Số điện thoại hoặc email</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập số điện thoại hoặc email"
            autoCapitalize="none"
            value={identifier}
            onChangeText={setIdentifier}
          />

          {mode === "password" ? (
            <>
              <Text style={[styles.label, styles.sectionLabel]}>Mật khẩu</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </>
          ) : (
            <>
              <Pressable
                style={[styles.secondaryAction, requestingOtp && styles.disabledButton]}
                onPress={handleRequestOtp}
                disabled={requestingOtp}
              >
                {requestingOtp ? (
                  <ActivityIndicator color="#17355c" />
                ) : (
                  <Text style={styles.secondaryActionText}>Gửi OTP email</Text>
                )}
              </Pressable>

              {otpTarget ? <Text style={styles.helperText}>OTP đã gửi tới {otpTarget}</Text> : null}
              {devCode ? <Text style={styles.devHint}>Mã OTP dev: {devCode}</Text> : null}

              <Text style={[styles.label, styles.sectionLabel]}>Mã OTP</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập mã OTP"
                keyboardType="number-pad"
                maxLength={6}
                value={code}
                onChangeText={(value) => setCode(value.replace(/\D/g, ""))}
              />
            </>
          )}

          <Text style={[styles.label, styles.sectionLabel]}>Mã PIN mới</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            value={pin}
            onChangeText={(value) => setPin(value.replace(/\D/g, ""))}
          />

          <Text style={[styles.label, styles.sectionLabel]}>Nhập lại mã PIN</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            value={confirmPin}
            onChangeText={(value) => setConfirmPin(value.replace(/\D/g, ""))}
          />

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <Pressable
            style={[styles.primaryButton, submitting && styles.disabledButton]}
            onPress={mode === "password" ? handleResetWithPassword : handleResetWithOtp}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>Đặt lại mã PIN</Text>
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
    marginBottom: 18,
    color: "#60738d",
    lineHeight: 21
  },
  modeRow: {
    flexDirection: "row",
    marginBottom: 16
  },
  modeButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#d8e1ec",
    backgroundColor: "#f9fbfd"
  },
  modeButtonActive: {
    backgroundColor: "#17355c",
    borderColor: "#17355c"
  },
  modeText: {
    color: "#60738d",
    fontWeight: "600"
  },
  modeTextActive: {
    color: "#ffffff"
  },
  label: {
    marginBottom: 7,
    fontWeight: "600",
    color: "#17355c"
  },
  sectionLabel: {
    marginTop: 14
  },
  input: {
    borderWidth: 1,
    borderColor: "#d8e1ec",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: "#f9fbfd"
  },
  secondaryAction: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d8e1ec",
    backgroundColor: "#f9fbfd"
  },
  secondaryActionText: {
    color: "#17355c",
    fontWeight: "700"
  },
  helperText: {
    marginTop: 8,
    color: "#60738d"
  },
  devHint: {
    marginTop: 6,
    color: "#6ca800",
    fontWeight: "700"
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
  }
});
