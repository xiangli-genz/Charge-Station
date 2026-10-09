import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { ScreenContainer } from "../../components/common/ScreenContainer";
import { getActivityLogs } from "../../services/activityLogApi";
import { formatDateTime } from "../../utils/format";

export function ActivityLogsScreen() {
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["activity-logs"],
    queryFn: () =>
      getActivityLogs({
        limit: 30
      })
  });

  return (
    <ScreenContainer>
      <FlatList
        data={data?.items || []}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Lịch sử hoạt động</Text>
            <Text style={styles.subtitle}>
              Gồm các thao tác đăng nhập, đăng ký, thêm yêu thích và tạo hoặc hủy booking.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Chưa có dữ liệu hoạt động</Text>
            <Text style={styles.emptyText}>Khi người dùng thao tác trên app, log sẽ xuất hiện ở đây.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.message || item.action}</Text>
            <Text style={styles.cardMeta}>Action: {item.action}</Text>
            <Text style={styles.cardMeta}>Đối tượng: {item.entityType || "--"}</Text>
            <Text style={styles.cardMeta}>Thời gian: {formatDateTime(item.createdAt)}</Text>
          </View>
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
    marginBottom: 14,
    color: "#60738d",
    lineHeight: 21
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
    fontSize: 17,
    fontWeight: "700",
    color: "#17355c"
  },
  cardMeta: {
    marginTop: 8,
    color: "#60738d"
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
