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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ScreenContainer } from "../../components/common/ScreenContainer";
import { setCustomerPin } from "../../services/authApi";
import { useAuthStore } from "../../store/authStore";
import { getApiErrorMessage } from "../../utils/apiError";

export function SetPinScreen() {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const setPinSetupRequired = useAuthStore((state) => state.setPinSetupRequired);

  const mutation = useMutation({
    mutationFn: setCustomerPin,
    onSuccess: async (user) => {
      setUser(user);
      setPinSetupRequired(false);
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  });

  const handleSubmit = async () => {
    if (!/^\d{6}$/.test(pin)) {
      setErrorMessage("Mã PIN phải gồm 6 chữ số.");
      return;
    }

    if (pin !== confirmPin) {
      setErrorMessage("Mã PIN xác nhận chưa khớp.");
      return;
    }

    try {
      setErrorMessage("");
      await mutation.mutateAsync(pin);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Không thể tạo mã PIN."));
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Thiết lập mã PIN</Text>
          <Text style={styles.subtitle}>
            Sau lần đăng nhập mật khẩu đầu tiên, bạn có thể dùng mã PIN 6 số để vào nhanh.
          </Text>

          <Text style={styles.label}>Mã PIN mới</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            value={pin}
            onChangeText={(value) => setPin(value.replace(/\D/g, ""))}
          />

          <Text style={[styles.label, styles.secondLabel]}>Nhập lại mã PIN</Text>
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
            style={[styles.primaryButton, mutation.isPending && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>Lưu mã PIN</Text>
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
  label: {
    marginBottom: 7,
    fontWeight: "600",
    color: "#17355c"
  },
  secondLabel: {
    marginTop: 14
  },
  input: {
    borderWidth: 1,
    borderColor: "#d8e1ec",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: "#f9fbfd",
    textAlign: "center",
    letterSpacing: 10,
    fontSize: 20
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
