import { useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { ScreenContainer } from "../../components/common/ScreenContainer";
import { getStations } from "../../services/stationApi";
import { formatNumber, getStationStatusLabel } from "../../utils/format";
import type { RootStackParamList } from "../../navigation/types";
import type { StationStatus } from "../../types/api";

type Props = NativeStackScreenProps<RootStackParamList, "StationList">;

const statusOptions: Array<{ label: string; value?: StationStatus }> = [
  { label: "Tất cả" },
  { label: "Hoạt động", value: "active" },
  { label: "Chưa hoạt động", value: "inactive" },
  { label: "Bảo trì", value: "maintenance" },
  { label: "Đóng cửa", value: "closed" }
];

export function StationListScreen({ navigation }: Props) {
  const [draftKeyword, setDraftKeyword] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<StationStatus | undefined>();

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["stations", keyword, status],
    queryFn: () =>
      getStations({
        keyword: keyword || undefined,
        status,
        limit: 30
      })
  });

  return (
    <ScreenContainer>
      <FlatList
        data={data?.items || []}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Danh sách trạm sạc</Text>
            <Text style={styles.subtitle}>Tìm theo tên trạm, địa chỉ hoặc imei.</Text>

            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Nhập từ khóa tìm kiếm"
                value={draftKeyword}
                onChangeText={setDraftKeyword}
                onSubmitEditing={() => setKeyword(draftKeyword.trim())}
              />
              <Pressable style={styles.searchButton} onPress={() => setKeyword(draftKeyword.trim())}>
                <Text style={styles.searchButtonText}>Tìm</Text>
              </Pressable>
            </View>

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

            <Text style={styles.resultText}>
              {data?.pagination.total ?? 0} trạm phù hợp với bộ lọc hiện tại
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Chưa có trạm phù hợp</Text>
            <Text style={styles.emptyText}>Hãy đổi từ khóa hoặc bộ lọc để thử lại.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate("StationDetail", { station: item })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{getStationStatusLabel(item.status)}</Text>
              </View>
            </View>
            <Text style={styles.cardMeta}>{item.address}</Text>
            <Text style={styles.cardMeta}>
              {item.district || "--"}, {item.city || "--"}
            </Text>
            <Text style={styles.cardMeta}>
              IMEI: {item.imei || "--"} | Cổng trống: {formatNumber(item.availableChargingPoints)}/
              {formatNumber(item.totalChargingPoints)}
            </Text>
            <Text style={styles.cardMeta}>Mở 24/7: {item.open24_7 ? "Có" : "Không"}</Text>
          </Pressable>
        )}
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
    marginBottom: 16,
    color: "#60738d"
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d8e1ec",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#ffffff"
  },
  searchButton: {
    marginLeft: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#1d5fbf"
  },
  searchButtonText: {
    color: "#ffffff",
    fontWeight: "700"
  },
  filters: {
    marginTop: 14,
    marginBottom: 10
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
  resultText: {
    marginBottom: 14,
    color: "#60738d"
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
    marginRight: 10,
    fontSize: 18,
    fontWeight: "700",
    color: "#17355c"
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#eff4fb"
  },
  statusText: {
    color: "#17355c",
    fontWeight: "600",
    fontSize: 12
  },
  cardMeta: {
    marginTop: 8,
    color: "#60738d",
    lineHeight: 20
  },
  emptyState: {
    padding: 24,
    marginTop: 12,
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
    marginTop: 6,
    color: "#60738d"
  }
});
