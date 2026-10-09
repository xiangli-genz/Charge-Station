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
import { registerCustomer } from "../../services/authApi";
import { ScreenContainer } from "../../components/common/ScreenContainer";
import { getApiErrorMessage } from "../../utils/apiError";
import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const handleRegister = async () => {
    if (!fullName.trim() || !phone.trim() || !email.trim() || password.length < 6) {
      setErrorMessage("Vui lòng nhập đầy đủ thông tin và mật khẩu từ 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận chưa khớp.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      setEmailError("");
      setPhoneError("");

      const result = await registerCustomer({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password,
        verificationChannel: "email"
      });

      navigation.navigate("RegisterVerify", {
        userId: result.userId,
        channel: result.channel,
        target: result.target,
        identifier: phone.trim() || email.trim(),
        devCode: result.devCode
      });
    } catch (error) {
      const message = getApiErrorMessage(error, "Đăng ký thất bại.");
      const normalizedMessage = message.toLowerCase();

      if (normalizedMessage.includes("email")) {
        setEmailError(message);
      }

      if (normalizedMessage.includes("so dien thoai") || normalizedMessage.includes("số điện thoại")) {
        setPhoneError(message);
      }

      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Tạo tài khoản người dùng</Text>
          <Text style={styles.subtitle}>
            Hệ thống sẽ gửi OTP xác minh để chắc chắn email hoặc số điện thoại thuộc chính chủ.
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập họ và tên"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(value) => {
                setPhone(value);
                setPhoneError("");
              }}
            />
            {phoneError ? <Text style={styles.fieldError}>{phoneError}</Text> : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập email"
              autoCapitalize="none"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setEmailError("");
              }}
            />
            {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Mật khẩu</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Xác nhận mật khẩu</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập lại mật khẩu"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <Pressable
            style={[styles.primaryButton, submitting && styles.disabledButton]}
            onPress={handleRegister}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>Gửi mã OTP</Text>
            )}
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.secondaryButtonText}>Đã có tài khoản? Quay lại đăng nhập</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
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
    fontSize: 26,
    fontWeight: "700",
    color: "#17355c"
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 20,
    fontSize: 14,
    lineHeight: 21,
    color: "#60738d"
  },
  fieldGroup: {
    marginBottom: 14
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#17355c"
  },
  input: {
    borderWidth: 1,
    borderColor: "#d8e1ec",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#f9fbfd"
  },
  errorText: {
    marginBottom: 14,
    color: "#c43d3d"
  },
  fieldError: {
    marginTop: 5,
    color: "#c43d3d",
    fontSize: 12
  },
  primaryButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
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
    marginTop: 14,
    alignItems: "center"
  },
  secondaryButtonText: {
    color: "#1d5fbf",
    fontWeight: "600"
  }
});
