import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ScreenContainer } from "../../components/common/ScreenContainer";
import { getProfile, updateProfile } from "../../services/profileApi";
import { clearToken as clearStoredToken } from "../../services/storage/tokenStorage";
import { setApiAuthToken } from "../../services/api/client";
import { useAuthStore } from "../../store/authStore";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatDateOnly, formatNumber } from "../../utils/format";
import type { CustomerProfile } from "../../types/api";

export function ProfileScreen() {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearToken);
  const setUser = useAuthStore((state) => state.setUser);
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile
  });

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [vehicleType, setVehicleType] =
    useState<CustomerProfile["vehicleType"]>("motorbike");
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleImageUrl, setVehicleImageUrl] = useState("");

  useEffect(() => {
    if (!profile) {
      return;
    }

    setFullName(profile.fullName || "");
    setPhone(profile.phone || "");
    setEmail(profile.email || "");
    setAddress(profile.address || "");
    setDescription(profile.description || "");
    setVehicleType(profile.vehicleType || "motorbike");
    setVehicleName(profile.vehicleName || "");
    setVehicleImageUrl(profile.vehicleImageUrl || "");
    setUser(profile);
  }, [profile, setUser]);

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: async (nextProfile) => {
      setUser(nextProfile);
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      await queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
      Alert.alert("Cập nhật thành công", "Hồ sơ đã được lưu trên backend.");
    }
  });

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        description: description.trim(),
        vehicleType,
        vehicleName: vehicleName.trim(),
        vehicleImageUrl: vehicleImageUrl.trim()
      });
    } catch (error) {
      Alert.alert("Không thể cập nhật hồ sơ", getApiErrorMessage(error));
    }
  };

  const handleLogout = async () => {
    await clearStoredToken();
    setApiAuthToken(null);
    clearSession();
    queryClient.clear();
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>Hồ sơ cá nhân</Text>
          <Text style={styles.subtitle}>Thông tin này đang lấy và cập nhật trực tiếp qua `/api/app/profile`.</Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{formatNumber(profile?.walletBalance ?? 0)}</Text>
              <Text style={styles.summaryLabel}>Số dư ví</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{formatDateOnly(profile?.createdAt || new Date())}</Text>
              <Text style={styles.summaryLabel}>Ngày tham gia</Text>
            </View>
          </View>

          <Field label="Họ và tên" value={fullName} onChangeText={setFullName} />
          <Field label="Số điện thoại" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
          <Field label="Địa chỉ" value={address} onChangeText={setAddress} />
          <Field
            label="Mô tả"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.vehicleSectionTitle}>Phương tiện sử dụng</Text>
          <View style={styles.vehicleTypeRow}>
            {[
              { label: "Xe máy điện", value: "motorbike" },
              { label: "Ô tô", value: "car" },
              { label: "Xe tải", value: "truck" },
              { label: "Khác", value: "other" }
            ].map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.vehicleTypeButton,
                  vehicleType === option.value && styles.vehicleTypeButtonActive
                ]}
                onPress={() =>
                  setVehicleType(option.value as CustomerProfile["vehicleType"])
                }
              >
                <Text
                  style={[
                    styles.vehicleTypeText,
                    vehicleType === option.value && styles.vehicleTypeTextActive
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Field
            label="Tên xe"
            value={vehicleName}
            onChangeText={setVehicleName}
            placeholder="Ví dụ: VinFast Evo 200"
          />
          <Field
            label="Ảnh xe (URL file-manager)"
            value={vehicleImageUrl}
            onChangeText={setVehicleImageUrl}
            autoCapitalize="none"
            placeholder="https://..."
          />

          <Pressable
            style={[styles.primaryButton, updateMutation.isPending && styles.disabledButton]}
            onPress={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>Lưu thay đổi</Text>
            )}
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={handleLogout}>
            <Text style={styles.secondaryButtonText}>Đăng xuất</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        style={[styles.input, props.multiline && styles.multilineInput]}
        value={props.value}
        onChangeText={props.onChangeText}
        keyboardType={props.keyboardType}
        autoCapitalize={props.autoCapitalize}
        placeholder={props.placeholder}
        multiline={props.multiline}
        numberOfLines={props.numberOfLines}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
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
    marginTop: 6,
    marginBottom: 16,
    color: "#60738d",
    lineHeight: 21
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 16
  },
  summaryCard: {
    flex: 1,
    marginRight: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#f4f7fb"
  },
  summaryNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#17355c"
  },
  summaryLabel: {
    marginTop: 6,
    color: "#60738d"
  },
  fieldGroup: {
    marginBottom: 14
  },
  label: {
    marginBottom: 6,
    fontWeight: "600",
    color: "#17355c"
  },
  vehicleSectionTitle: {
    marginTop: 4,
    marginBottom: 9,
    fontWeight: "700",
    color: "#17355c"
  },
  vehicleTypeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 4
  },
  vehicleTypeButton: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d8e1ec",
    backgroundColor: "#f9fbfd"
  },
  vehicleTypeButtonActive: {
    borderColor: "#4db3c1",
    backgroundColor: "#dff4f6"
  },
  vehicleTypeText: {
    color: "#60738d",
    fontSize: 12,
    fontWeight: "600"
  },
  vehicleTypeTextActive: {
    color: "#1e7180",
    fontWeight: "800"
  },
  input: {
    borderWidth: 1,
    borderColor: "#d8e1ec",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#f9fbfd"
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: "top"
  },
  primaryButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "#1d5fbf"
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700"
  },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d8e1ec"
  },
  secondaryButtonText: {
    color: "#17355c",
    fontWeight: "700"
  },
  disabledButton: {
    opacity: 0.7
  }
});
