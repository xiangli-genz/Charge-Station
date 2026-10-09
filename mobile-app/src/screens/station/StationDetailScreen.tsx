import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ScreenContainer } from "../../components/common/ScreenContainer";
import { addFavoriteStation, getFavoriteStations, removeFavoriteStation } from "../../services/favoriteApi";
import { createBooking } from "../../services/bookingApi";
import { getApiErrorMessage } from "../../utils/apiError";
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
  getChargingPointStatusLabel,
  getStationStatusLabel
} from "../../utils/format";
import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "StationDetail">;

function getDefaultBookingDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDefaultBookingTime() {
  const now = new Date();
  const hour = `${Math.min(now.getHours() + 1, 23)}`.padStart(2, "0");
  return `${hour}:00`;
}

export function StationDetailScreen({ route, navigation }: Props) {
  const station = route.params.station;
  const queryClient = useQueryClient();
  const [selectedPointId, setSelectedPointId] = useState("");
  const [bookingDate, setBookingDate] = useState(getDefaultBookingDate());
  const [startAt, setStartAt] = useState(getDefaultBookingTime());
  const [durationHours, setDurationHours] = useState("1");

  const favoritesQuery = useQuery({
    queryKey: ["favorites"],
    queryFn: getFavoriteStations
  });

  useEffect(() => {
    const firstBookable = station.matchingChargingPoints.find((item) => item.status !== "maintenance");

    if (firstBookable) {
      setSelectedPointId((current) => current || firstBookable._id);
    }
  }, [station.matchingChargingPoints]);

  const selectedPoint = station.matchingChargingPoints.find((item) => item._id === selectedPointId);
  const isFavorite = Boolean(
    favoritesQuery.data?.items.some((item) => item.station.id === station._id)
  );

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        return removeFavoriteStation(station._id);
      }

      return addFavoriteStation(station._id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["favorites"] });
      await queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
    }
  });

  const bookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
      await queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
      Alert.alert("Đặt lịch thành công", "Booking đã được tạo trên backend.");
      navigation.navigate("BookingHistory");
    }
  });

  const handleOpenMap = async () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${station.location.lat},${station.location.lng}`;
    await Linking.openURL(url);
  };

  const handleToggleFavorite = async () => {
    try {
      await favoriteMutation.mutateAsync();
    } catch (error) {
      Alert.alert("Không thể cập nhật yêu thích", getApiErrorMessage(error));
    }
  };

  const handleCreateBooking = async () => {
    if (!selectedPoint) {
      Alert.alert("Thiếu cổng sạc", "Vui lòng chọn cổng sạc trước khi đặt lịch.");
      return;
    }

    if (selectedPoint.status === "maintenance") {
      Alert.alert("Cổng đang bảo trì", "Vui lòng chọn cổng sạc khác.");
      return;
    }

    const duration = Number(durationHours);

    if (!bookingDate.trim() || !startAt.trim() || !Number.isFinite(duration) || duration <= 0) {
      Alert.alert("Thông tin chưa hợp lệ", "Vui lòng kiểm tra ngày, giờ và số giờ sạc.");
      return;
    }

    const startTime = new Date(`${bookingDate}T${startAt}:00`);
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);

    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      Alert.alert("Sai định dạng thời gian", "Ngày hoặc giờ chưa đúng định dạng.");
      return;
    }

    try {
      await bookingMutation.mutateAsync({
        chargingPointId: selectedPoint._id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      });
    } catch (error) {
      Alert.alert("Không thể đặt lịch", getApiErrorMessage(error));
    }
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroHeader}>
            <Text style={styles.heroTitle}>{station.name}</Text>
            <View style={styles.heroStatus}>
              <Text style={styles.heroStatusText}>{getStationStatusLabel(station.status)}</Text>
            </View>
          </View>
          <Text style={styles.heroMeta}>{station.address}</Text>
          <Text style={styles.heroMeta}>
            {station.district || "--"}, {station.city || "--"}
          </Text>
          <Text style={styles.heroMeta}>
            Cổng trống: {formatNumber(station.availableChargingPoints)}/
            {formatNumber(station.totalChargingPoints)}
          </Text>
          <Text style={styles.heroMeta}>Mở 24/7: {station.open24_7 ? "Có" : "Không"}</Text>
        </View>

        <View style={styles.actionsRow}>
          <Pressable style={styles.actionButton} onPress={handleOpenMap}>
            <Text style={styles.actionButtonText}>Chỉ đường</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={handleToggleFavorite}>
            {favoriteMutation.isPending ? (
              <ActivityIndicator color="#17355c" />
            ) : (
              <Text style={styles.actionButtonText}>
                {isFavorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
              </Text>
            )}
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh sách cổng sạc</Text>
          {station.matchingChargingPoints.length ? (
            station.matchingChargingPoints.map((point) => {
              const selected = point._id === selectedPointId;
              const disabled = point.status === "maintenance";

              return (
                <Pressable
                  key={point._id}
                  style={[styles.pointCard, selected && styles.pointCardSelected, disabled && styles.pointCardDisabled]}
                  onPress={() => {
                    if (!disabled) {
                      setSelectedPointId(point._id);
                    }
                  }}
                >
                  <View style={styles.pointHeader}>
                    <Text style={styles.pointTitle}>{point.code}</Text>
                    <Text style={styles.pointStatus}>{getChargingPointStatusLabel(point.status)}</Text>
                  </View>
                  <Text style={styles.pointMeta}>
                    Chuẩn sạc: {point.connectorType} | Công suất: {point.powerKw} kW
                  </Text>
                  <Text style={styles.pointMeta}>
                    Giá:{" "}
                    {point.pricing
                      ? `${formatCurrency(point.pricing.pricePerKwh)}/kWh`
                      : "Chưa có bảng giá"}
                  </Text>
                </Pressable>
              );
            })
          ) : (
            <Text style={styles.emptyText}>Trạm này chưa có dữ liệu cổng sạc phù hợp.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đặt lịch sạc</Text>
          <Text style={styles.sectionHint}>
            Chọn cổng sạc, nhập ngày, giờ bắt đầu và số giờ sạc để tạo booking thật trên backend.
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Cổng sạc đã chọn</Text>
            <Text style={styles.readOnlyValue}>
              {selectedPoint ? `${selectedPoint.code} - ${selectedPoint.connectorType}` : "Chưa chọn"}
            </Text>
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.fieldColumn}>
              <Text style={styles.label}>Ngày sạc</Text>
              <TextInput
                style={styles.input}
                value={bookingDate}
                onChangeText={setBookingDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View style={styles.fieldColumn}>
              <Text style={styles.label}>Giờ bắt đầu</Text>
              <TextInput
                style={styles.input}
                value={startAt}
                onChangeText={setStartAt}
                placeholder="HH:mm"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Số giờ sạc</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={durationHours}
              onChangeText={setDurationHours}
              placeholder="Ví dụ: 1.5"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Kết thúc dự kiến</Text>
            <Text style={styles.readOnlyValue}>
              {(() => {
                const startTime = new Date(`${bookingDate}T${startAt}:00`);
                const duration = Number(durationHours);

                if (Number.isNaN(startTime.getTime()) || !Number.isFinite(duration) || duration <= 0) {
                  return "--";
                }

                const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);
                return formatDateTime(endTime);
              })()}
            </Text>
          </View>

          <Pressable
            style={[styles.primaryButton, bookingMutation.isPending && styles.primaryButtonDisabled]}
            onPress={handleCreateBooking}
            disabled={bookingMutation.isPending}
          >
            {bookingMutation.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>Xác nhận đặt lịch</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dce5f0"
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  heroTitle: {
    flex: 1,
    marginRight: 12,
    fontSize: 24,
    fontWeight: "700",
    color: "#17355c"
  },
  heroStatus: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#eff4fb"
  },
  heroStatusText: {
    color: "#17355c",
    fontWeight: "700",
    fontSize: 12
  },
  heroMeta: {
    marginTop: 8,
    color: "#60738d",
    lineHeight: 21
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 14
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
    marginRight: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d8e1ec",
    backgroundColor: "#ffffff"
  },
  actionButtonText: {
    color: "#17355c",
    fontWeight: "700"
  },
  section: {
    marginTop: 16,
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dce5f0"
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#17355c"
  },
  sectionHint: {
    marginTop: 8,
    marginBottom: 16,
    color: "#60738d",
    lineHeight: 21
  },
  pointCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d8e1ec",
    backgroundColor: "#f9fbfd"
  },
  pointCardSelected: {
    borderColor: "#1d5fbf",
    backgroundColor: "#eef5ff"
  },
  pointCardDisabled: {
    opacity: 0.55
  },
  pointHeader: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  pointTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#17355c"
  },
  pointStatus: {
    color: "#60738d",
    fontWeight: "600"
  },
  pointMeta: {
    marginTop: 6,
    color: "#60738d",
    lineHeight: 20
  },
  fieldGroup: {
    marginBottom: 14
  },
  fieldRow: {
    flexDirection: "row",
    marginBottom: 14
  },
  fieldColumn: {
    flex: 1,
    marginRight: 10
  },
  label: {
    marginBottom: 6,
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
  readOnlyValue: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f3f6fb",
    color: "#17355c"
  },
  primaryButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "#1d5fbf"
  },
  primaryButtonDisabled: {
    opacity: 0.7
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700"
  },
  emptyText: {
    marginTop: 12,
    color: "#60738d"
  }
});
