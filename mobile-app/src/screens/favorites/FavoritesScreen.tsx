import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ScreenContainer } from "../../components/common/ScreenContainer";
import { getFavoriteStations, removeFavoriteStation } from "../../services/favoriteApi";
import { getApiErrorMessage } from "../../utils/apiError";
import { getStationStatusLabel } from "../../utils/format";
import type { RootStackParamList } from "../../navigation/types";
import type { FavoriteStationItem, StationItem, StationStatus } from "../../types/api";

type Props = NativeStackScreenProps<RootStackParamList, "Favorites">;

export function FavoritesScreen({ navigation }: Props) {
  const queryClient = useQueryClient();
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["favorites"],
    queryFn: getFavoriteStations
  });

  const removeMutation = useMutation({
    mutationFn: removeFavoriteStation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["favorites"] });
      await queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
    }
  });

  const handleRemove = async (stationId: string) => {
    try {
      await removeMutation.mutateAsync(stationId);
    } catch (error) {
      Alert.alert("Không thể xóa yêu thích", getApiErrorMessage(error));
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
            <Text style={styles.title}>Trạm yêu thích</Text>
            <Text style={styles.subtitle}>Danh sách này lấy trực tiếp từ backend người dùng.</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Chưa có trạm yêu thích</Text>
            <Text style={styles.emptyText}>Bạn có thể thêm từ màn hình chi tiết trạm sạc.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const station = item.station;

          return (
            <View style={styles.card}>
              <Pressable
                onPress={() =>
                  navigation.navigate("StationDetail", {
                    station: mapFavoriteStationToStationItem(station)
                  })
                }
              >
                <Text style={styles.cardTitle}>{station.name}</Text>
                <Text style={styles.cardMeta}>{station.address}</Text>
                <Text style={styles.cardMeta}>
                  {station.district || "--"}, {station.city || "--"}
                </Text>
                <Text style={styles.cardMeta}>Trạng thái: {getStationStatusLabel(station.status)}</Text>
              </Pressable>

              <Pressable
                style={styles.removeButton}
                onPress={() => handleRemove(station.id)}
                disabled={removeMutation.isPending}
              >
                <Text style={styles.removeButtonText}>Xóa khỏi yêu thích</Text>
              </Pressable>
            </View>
          );
        }}
        contentContainerStyle={styles.contentContainer}
      />
    </ScreenContainer>
  );
}

function mapFavoriteStationToStationItem(station: FavoriteStationItem["station"]): StationItem {
  return {
    _id: station.id,
    imei: "",
    name: station.name,
    address: station.address,
    city: station.city,
    district: station.district,
    location: station.location,
    status: normalizeStationStatus(station.status),
    open24_7: station.open24_7,
    totalChargingPoints: station.totalChargingPoints,
    availableChargingPoints: station.availableChargingPoints,
    matchingChargingPoints: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function normalizeStationStatus(status: string): StationStatus {
  if (status === "active" || status === "inactive" || status === "maintenance" || status === "closed") {
    return status;
  }

  return "active";
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#17355c"
  },
  cardMeta: {
    marginTop: 8,
    color: "#60738d"
  },
  removeButton: {
    marginTop: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d8e1ec"
  },
  removeButtonText: {
    color: "#17355c",
    fontWeight: "700"
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
