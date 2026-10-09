import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ScreenContainer } from "../../components/common/ScreenContainer";
import { cancelBooking, getBookingHistory } from "../../services/bookingApi";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatDateTime, getBookingStatusLabel } from "../../utils/format";
import type { BookingStatus } from "../../types/api";

const statusOptions: Array<{ label: string; value?: BookingStatus }> = [
  { label: "Tất cả" },
  { label: "Chờ xác nhận", value: "pending" },
  { label: "Đã xác nhận", value: "confirmed" },
  { label: "Đã hủy", value: "cancelled" },
  { label: "Hoàn thành", value: "completed" }
];

export function BookingHistoryScreen() {
  const [status, setStatus] = useState<BookingStatus | undefined>();
  const queryClient = useQueryClient();
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["bookings", status],
    queryFn: () =>
      getBookingHistory({
        status,
        limit: 30
      })
  });

  const cancelMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
      await queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
    }
  });

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await cancelMutation.mutateAsync(bookingId);
      Alert.alert("Hủy booking thành công", "Lịch đặt đã được cập nhật trên hệ thống.");
    } catch (error) {
      Alert.alert("Không thể hủy booking", getApiErrorMessage(error));
    }
  };

  return (
    <ScreenContainer>
      <FlatList
        data={data?.items || []}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Lịch sử đặt lịch</Text>
            <Text style={styles.subtitle}>Xem và hủy các booking còn hợp lệ.</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
              {statusOptions.map((option) => {
                const active = option.value === status || (!option.value && !status);

                return (
                  <Pressable
                    key={option.label}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => setStatus(option.value)}
                  >
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Chưa có booking</Text>
            <Text style={styles.emptyText}>Bạn có thể tạo booking từ màn hình chi tiết trạm sạc.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const canCancel = item.status === "pending" || item.status === "confirmed";

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.chargingPoint.station?.name || "Trạm sạc"}</Text>
                <Text style={styles.statusText}>{getBookingStatusLabel(item.status)}</Text>
              </View>
              <Text style={styles.cardMeta}>Cổng sạc: {item.chargingPoint.code}</Text>
              <Text style={styles.cardMeta}>Loại cổng: {item.chargingPoint.connectorType}</Text>
              <Text style={styles.cardMeta}>Bắt đầu: {formatDateTime(item.startTime)}</Text>
              <Text style={styles.cardMeta}>Kết thúc: {formatDateTime(item.endTime)}</Text>
              <Text style={styles.cardMeta}>
                Địa chỉ: {item.chargingPoint.station?.address || "Chưa có địa chỉ"}
              </Text>

              {canCancel ? (
                <Pressable
                  style={[styles.cancelButton, cancelMutation.isPending && styles.disabledButton]}
                  onPress={() => handleCancelBooking(item.id)}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.cancelButtonText}>Hủy booking</Text>
                  )}
                </Pressable>
              ) : null}
            </View>
          );
        }}
        contentContainerStyle={styles.contentContainer}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 24
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#17355c"
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 12,
    color: "#60738d"
  },
  filters: {
    marginBottom: 14
  },
  filterChip: {
    marginRight: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d8e1ec"
  },
  filterChipActive: {
    backgroundColor: "#17355c",
    borderColor: "#17355c"
  },
  filterChipText: {
    color: "#60738d",
    fontWeight: "600"
  },
  filterChipTextActive: {
    color: "#ffffff"
  },
  card: {
    marginBottom: 12,
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dce5f0"
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  cardTitle: {
    flex: 1,
    marginRight: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#17355c"
  },
  statusText: {
    color: "#60738d",
    fontWeight: "700"
  },
  cardMeta: {
    marginTop: 8,
    color: "#60738d",
    lineHeight: 20
  },
  cancelButton: {
    marginTop: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#c43d3d"
  },
  cancelButtonText: {
    color: "#ffffff",
    fontWeight: "700"
  },
  disabledButton: {
    opacity: 0.7
  },
  emptyCard: {
    padding: 20,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dce5f0"
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#17355c"
  },
  emptyText: {
    marginTop: 8,
    color: "#60738d"
  }
});
