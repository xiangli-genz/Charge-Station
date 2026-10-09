import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
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
import { getBookingHistory } from "../../services/bookingApi";
import { getProfile } from "../../services/profileApi";
import { getStations } from "../../services/stationApi";
import { useAuthStore } from "../../store/authStore";
import {
  formatCurrency,
  formatBookingTimeRange,
  getBookingStatusLabel,
  getStationStatusLabel
} from "../../utils/format";
import type { RootStackParamList } from "../../navigation/types";
import type { BookingItem, StationItem } from "../../types/api";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

type Coordinates = {
  latitude: number;
  longitude: number;
};

function distanceInKm(from: Coordinates, station: StationItem) {
  const earthRadius = 6371;
  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (station.location.lat * Math.PI) / 180;
  const deltaLat = ((station.location.lat - from.latitude) * Math.PI) / 180;
  const deltaLng = ((station.location.lng - from.longitude) * Math.PI) / 180;
  const value =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function getFirstBooking(bookings: BookingItem[]) {
  return [...bookings]
    .filter((booking) => booking.status !== "cancelled")
    .sort(
      (first, second) =>
        new Date(first.startTime).getTime() - new Date(second.startTime).getTime()
    )[0];
}

function getGeolocation() {
  return (
    globalThis as typeof globalThis & {
      navigator?: {
        geolocation?: {
          getCurrentPosition: (
            success: (position: {
              coords: { latitude: number; longitude: number };
            }) => void,
            error: () => void,
            options?: {
              enableHighAccuracy?: boolean;
              timeout?: number;
              maximumAge?: number;
            }
          ) => void;
        };
      };
    }
  ).navigator?.geolocation;
}

function getVehicleTypeIcon(type?: string) {
  switch (type) {
    case "car":
      return "🚗";
    case "truck":
      return "🚚";
    case "other":
      return "🚙";
    case "motorbike":
    default:
      return "🛵";
  }
}

function getVehicleTypeLabel(type?: string) {
  switch (type) {
    case "car":
      return "Ô tô";
    case "truck":
      return "Xe tải";
    case "other":
      return "Phương tiện khác";
    case "motorbike":
    default:
      return "Xe máy điện";
  }
}

function shortenBookingAddress(address: string, city?: string) {
  const normalizedAddress = address.replace(/\s+/g, " ").trim();
  const normalizedCity = city?.replace(/\s+/g, " ").trim();

  if (!normalizedAddress || !normalizedCity) {
    return normalizedAddress;
  }

  const cityIndex = normalizedAddress.toLocaleLowerCase("vi-VN").lastIndexOf(
    normalizedCity.toLocaleLowerCase("vi-VN")
  );

  if (cityIndex < 0) {
    return normalizedAddress;
  }

  return `${normalizedAddress.slice(0, cityIndex).replace(/[,\s]+$/, "")}, ${normalizedAddress.slice(
    cityIndex,
    cityIndex + normalizedCity.length
  )}`;
}

export function HomeScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile
  });
  const bookingQuery = useQuery({
    queryKey: ["bookings", "home"],
    queryFn: () => getBookingHistory({ limit: 10 })
  });
  const stationQuery = useQuery({
    queryKey: ["stations", "home", keyword],
    queryFn: () => getStations({ keyword: keyword || undefined, limit: 12 })
  });

  useEffect(() => {
    if (profileQuery.data) {
      setUser(profileQuery.data);
    }
  }, [profileQuery.data, setUser]);

  useEffect(() => {
    const geolocation = getGeolocation();

    if (!geolocation) {
      return;
    }

    setLocationLoading(true);
    geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationLoading(false);
      },
      () => setLocationLoading(false),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60_000 }
    );
  }, []);

  const latestBooking = useMemo(
    () => getFirstBooking(bookingQuery.data?.items || []),
    [bookingQuery.data?.items]
  );
  const stations = useMemo(() => {
    const items = stationQuery.data?.items || [];

    if (!coordinates) {
      return items;
    }

    return [...items].sort(
      (first, second) =>
        distanceInKm(coordinates, first) - distanceInKm(coordinates, second)
    );
  }, [coordinates, stationQuery.data?.items]);

  const displayName = profileQuery.data?.fullName || user?.fullName || "bạn";
  const locationLabel = coordinates
    ? `${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`
    : "Chưa xác định vị trí";

  const requestLocation = () => {
    const geolocation = getGeolocation();

    if (!geolocation) {
      Alert.alert(
        "Chưa có quyền vị trí",
        "Hãy bật quyền vị trí cho ứng dụng. Có thể cài expo-location để lấy GPS đầy đủ."
      );
      return;
    }

    setLocationLoading(true);
    geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationLoading(false);
      },
      () => {
        setLocationLoading(false);
        Alert.alert("Không lấy được vị trí", "Hãy kiểm tra quyền vị trí của máy ảo Android.");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleSearch = () => {
    setKeyword(keywordInput.trim());
  };

  const handleQrLookup = () => {
    const value = qrValue.trim();

    if (!value) {
      return;
    }

    const normalizedValue = value.toLowerCase();
    const station = (stationQuery.data?.items || []).find((item) =>
      [item._id, item.imei, item.name, item.address].some((field) =>
        field.toLowerCase().includes(normalizedValue)
      )
    );

    setQrModalVisible(false);
    setQrValue("");

    if (station) {
      navigation.navigate("StationDetail", { station });
      return;
    }

    if (normalizedValue.startsWith("booking:")) {
      navigation.navigate("BookingHistory");
      return;
    }

    Alert.alert(
      "Không tìm thấy dữ liệu QR",
      "Mã QR cần chứa mã trạm, IMEI, tên trạm hoặc bắt đầu bằng booking:."
    );
  };

  const refreshHome = () => {
    void Promise.all([
      profileQuery.refetch(),
      bookingQuery.refetch(),
      stationQuery.refetch()
    ]);
  };

  return (
    <ScreenContainer>
      <View style={styles.page}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={
                profileQuery.isFetching ||
                bookingQuery.isFetching ||
                stationQuery.isFetching
              }
              onRefresh={refreshHome}
              tintColor="#4caebe"
            />
          }
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <View style={styles.headerTopRow}>
              <View style={styles.greetingBlock}>
                <Text style={styles.dateText}>Trạm sạc xe điện</Text>
                <Text style={styles.greeting}>Chào buổi sáng, {displayName}</Text>
              </View>
              <Pressable
                style={styles.avatarButton}
                onPress={() => navigation.navigate("Profile")}
              >
                <Text style={styles.avatarText}>
                  {displayName.slice(0, 1).toUpperCase()}
                </Text>
              </Pressable>
            </View>

            <Pressable style={styles.locationRow} onPress={requestLocation}>
              <Text style={styles.locationIcon}>⌖</Text>
              <Text style={styles.locationText} numberOfLines={1}>
                Vị trí hiện tại: {locationLabel}
              </Text>
              {locationLoading ? (
                <ActivityIndicator size="small" color="#5f9f63" />
              ) : (
                <Text style={styles.locationAction}>Cập nhật</Text>
              )}
            </Pressable>

            <View style={styles.searchRow}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm trạm theo địa chỉ..."
                placeholderTextColor="#7b8c83"
                value={keywordInput}
                onChangeText={setKeywordInput}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              <Pressable
                style={styles.filterButton}
                onPress={() => navigation.navigate("StationList")}
              >
                <Text style={styles.filterIcon}>☷</Text>
              </Pressable>
              <Pressable style={styles.qrButton} onPress={() => setQrModalVisible(true)}>
                <Text style={styles.qrIcon}>▦</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.content}>
            <SectionHeader
              title="Đặt chỗ của tôi"
              action="Xem tất cả"
              onPress={() => navigation.navigate("BookingHistory")}
            />

            {bookingQuery.isLoading ? (
              <LoadingCard />
            ) : latestBooking ? (
              <BookingCard
                booking={latestBooking}
                onDetails={() => navigation.navigate("BookingHistory")}
                onRepeat={() => navigation.navigate("StationList")}
              />
            ) : (
              <EmptyCard
                title="Bạn chưa có lịch đặt"
                description="Chọn một trạm gần bạn để bắt đầu đặt lịch sạc."
                action="Tìm trạm sạc"
                onPress={() => navigation.navigate("StationList")}
              />
            )}

            <SectionHeader
              title="Gần tôi"
              action="Xem tất cả"
              onPress={() => navigation.navigate("StationList")}
            />

            {stationQuery.isLoading ? (
              <LoadingCard />
            ) : stations.length ? (
              stations.slice(0, 5).map((station) => (
                <StationCard
                  key={station._id}
                  station={station}
                  coordinates={coordinates}
                  onPress={() => navigation.navigate("StationDetail", { station })}
                />
              ))
            ) : (
              <EmptyCard
                title="Chưa có trạm phù hợp"
                description="Thử nhập tên trạm hoặc địa chỉ khác."
                action="Mở danh sách trạm"
                onPress={() => navigation.navigate("StationList")}
              />
            )}
          </View>
        </ScrollView>

        <View style={styles.bottomNav}>
          <BottomNavItem label="Trang chủ" icon="⌂" active onPress={() => undefined} />
          <BottomNavItem
            label="Bản đồ"
            icon="⌖"
            onPress={() => navigation.navigate("StationList")}
          />
          <BottomNavItem
            label="Yêu thích"
            icon="♡"
            onPress={() => navigation.navigate("Favorites")}
          />
          <BottomNavItem
            label="Tài khoản"
            icon="♙"
            onPress={() => navigation.navigate("Profile")}
          />
        </View>
      </View>

      <Modal
        visible={qrModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Quét mã QR</Text>
            <Text style={styles.modalDescription}>
              Tạm thời nhập mã trạm hoặc mã booking. Camera QR sẽ được bật sau khi cài
              expo-camera.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ví dụ: IMEI hoặc booking:..."
              value={qrValue}
              onChangeText={setQrValue}
              autoCapitalize="none"
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => setQrModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Đóng</Text>
              </Pressable>
              <Pressable style={styles.modalConfirmButton} onPress={handleQrLookup}>
                <Text style={styles.modalConfirmText}>Mở thông tin</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

function SectionHeader(props: { title: string; action: string; onPress: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{props.title}</Text>
      <Pressable onPress={props.onPress}>
        <Text style={styles.sectionAction}>{props.action}</Text>
      </Pressable>
    </View>
  );
}

function BookingCard(props: {
  booking: BookingItem;
  onDetails: () => void;
  onRepeat: () => void;
}) {
  const { booking } = props;
  const stationName = booking.chargingPoint.station?.name || "Trạm sạc";
  const address = shortenBookingAddress(
    booking.chargingPoint.station?.address || "Chưa có địa chỉ",
    booking.chargingPoint.station?.city
  );
  const statusColor = booking.status === "completed" ? "#58a85d" : "#f1a33c";
  const bookingTimeLabel = formatBookingTimeRange(booking.startTime, booking.endTime);
  const vehicle = booking.vehicle;
  const vehicleLabel = vehicle?.name || getVehicleTypeLabel(vehicle?.type);
  const kwhConsumed = Number(booking.chargingSummary?.kwhConsumed || 0);
  const chargingAmount = Number(booking.chargingSummary?.amount || 0);
  const handleOpenDirections = async () => {
    const station = booking.chargingPoint.station;
    const destination = station?.location
      ? `${station.location.lat},${station.location.lng}`
      : encodeURIComponent(address);
    const url = station?.location
      ? `https://www.google.com/maps/dir/?api=1&destination=${destination}`
      : `https://www.google.com/maps/search/?api=1&query=${destination}`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Không thể mở Google Maps", "Vui lòng kiểm tra ứng dụng bản đồ trên thiết bị.");
    }
  };

  return (
    <View style={styles.bookingCard}>
      <View style={styles.bookingSummary}>
        <View style={styles.bookingSummaryContent}>
          <View style={styles.statusPill}>
            <Text style={[styles.statusPillText, { color: statusColor }]}>
              {getBookingStatusLabel(booking.status)}
            </Text>
          </View>
          <Text style={styles.bookingDate}>{bookingTimeLabel}</Text>
        </View>
        <View style={styles.bookingVehicle}>
          {vehicle?.imageUrl ? (
            <Image
              source={{ uri: vehicle.imageUrl }}
              style={styles.bookingVehicleImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.bookingVehicleIcon}>{getVehicleTypeIcon(vehicle?.type)}</Text>
          )}
        </View>
      </View>
      <Text style={styles.bookingTitle}>{stationName}</Text>
      <Text style={styles.bookingVehicleLabel}>{vehicleLabel}</Text>
      <Text style={styles.bookingMeta} numberOfLines={2}>
        ⌖ {address}
      </Text>
      <View style={styles.bookingDivider} />
      <View style={styles.bookingStats}>
        <BookingStat label="Cổng sạc" value={booking.chargingPoint.code} />
        <BookingStat label="Loại cổng" value={booking.chargingPoint.connectorType} />
        <BookingStat label="Trạng thái" value={booking.chargingPoint.status} />
      </View>
      <View style={styles.bookingUsage}>
        <BookingStat label="Ổ cắm" value={booking.chargingPoint.connectorType || "--"} />
        <BookingStat label="Điện năng" value={`${kwhConsumed.toFixed(1)} kWh`} />
        <BookingStat label="Tiền sạc" value={formatCurrency(chargingAmount)} />
      </View>
      <View style={styles.bookingActions}>
        <Pressable style={styles.secondaryButton} onPress={props.onDetails}>
          <Text style={styles.secondaryButtonText}>Xem chi tiết</Text>
        </Pressable>
        <Pressable style={styles.primarySmallButton} onPress={props.onRepeat}>
          <Text style={styles.primarySmallButtonText}>Đặt lại</Text>
        </Pressable>
        <Pressable
          style={styles.directionSmallButton}
          onPress={handleOpenDirections}
          accessibilityRole="button"
          accessibilityLabel="Chỉ đường đến trạm sạc"
        >
          <Text style={styles.directionSmallButtonText}>Chỉ đường</Text>
        </Pressable>
      </View>
    </View>
  );
}

function BookingStat(props: { label: string; value: string }) {
  return (
    <View style={styles.bookingStat}>
      <Text style={styles.bookingStatLabel}>{props.label}</Text>
      <Text style={styles.bookingStatValue} numberOfLines={1}>
        {props.value}
      </Text>
    </View>
  );
}

function StationCard(props: {
  station: StationItem;
  coordinates: Coordinates | null;
  onPress: () => void;
}) {
  const distance = props.coordinates
    ? `${distanceInKm(props.coordinates, props.station).toFixed(1)} km`
    : "Chưa có GPS";
  const statusColor = props.station.status === "active" ? "#62b367" : "#e1a840";

  return (
    <Pressable style={styles.stationCard} onPress={props.onPress}>
      <View style={styles.stationImage}>
        <Text style={styles.stationImageText}>EV</Text>
      </View>
      <View style={styles.stationBody}>
        <View style={styles.stationTitleRow}>
          <Text style={styles.stationTitle} numberOfLines={1}>
            {props.station.name}
          </Text>
          <View style={[styles.stationStatus, { backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.stationStatusText, { color: statusColor }]}>
              {getStationStatusLabel(props.station.status)}
            </Text>
          </View>
        </View>
        <Text style={styles.stationAddress} numberOfLines={1}>
          ⌖ {props.station.address}
        </Text>
        <Text style={styles.stationSubAddress} numberOfLines={1}>
          {props.station.district || "Quận/Huyện"},{" "}
          {props.station.city || "Tỉnh/Thành phố"}
        </Text>
        <View style={styles.stationDivider} />
        <View style={styles.stationStats}>
          <StationStat
            label="Cổng trống"
            value={`${props.station.availableChargingPoints}/${props.station.totalChargingPoints}`}
          />
          <StationStat label="Khoảng cách" value={distance} />
        </View>
      </View>
    </Pressable>
  );
}

function StationStat(props: { label: string; value: string }) {
  return (
    <View style={styles.stationStat}>
      <Text style={styles.stationStatLabel}>{props.label}</Text>
      <Text style={styles.stationStatValue}>{props.value}</Text>
    </View>
  );
}

function EmptyCard(props: {
  title: string;
  description: string;
  action: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>{props.title}</Text>
      <Text style={styles.emptyDescription}>{props.description}</Text>
      <Pressable style={styles.emptyAction} onPress={props.onPress}>
        <Text style={styles.emptyActionText}>{props.action}</Text>
      </Pressable>
    </View>
  );
}

function LoadingCard() {
  return (
    <View style={styles.loadingCard}>
      <ActivityIndicator color="#4aaebe" />
      <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
    </View>
  );
}

function BottomNavItem(props: {
  label: string;
  icon: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.bottomNavItem} onPress={props.onPress}>
      <Text style={[styles.bottomNavIcon, props.active && styles.bottomNavIconActive]}>
        {props.icon}
      </Text>
      <Text style={[styles.bottomNavLabel, props.active && styles.bottomNavLabelActive]}>
        {props.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    marginHorizontal: -16,
    marginTop: -16,
    backgroundColor: "#f3fafb"
  },
  scrollContent: {
    paddingBottom: 86
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    backgroundColor: "#cceff3",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  greetingBlock: {
    flex: 1,
    paddingRight: 12
  },
  dateText: {
    color: "#327c8b",
    fontSize: 12,
    fontWeight: "700"
  },
  greeting: {
    marginTop: 5,
    color: "#164e63",
    fontSize: 17,
    fontWeight: "800"
  },
  avatarButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: "#71c4d0"
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800"
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12
  },
  locationIcon: {
    marginRight: 6,
    color: "#438e9e",
    fontSize: 17,
    fontWeight: "700"
  },
  locationText: {
    flex: 1,
    color: "#3d7380",
    fontSize: 12
  },
  locationAction: {
    marginLeft: 8,
    color: "#2e94a5",
    fontSize: 11,
    fontWeight: "800"
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 13,
    paddingHorizontal: 12,
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: "#ffffff"
  },
  searchIcon: {
    marginRight: 7,
    color: "#4aaabd",
    fontSize: 22
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    color: "#214f62",
    fontSize: 13
  },
  filterButton: {
    width: 30,
    alignItems: "center",
    justifyContent: "center"
  },
  filterIcon: {
    color: "#55a9b8",
    fontSize: 22
  },
  qrButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: "#59b7c6"
  },
  qrIcon: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800"
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 15
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 9
  },
  sectionTitle: {
    color: "#214f62",
    fontSize: 15,
    fontWeight: "800"
  },
  sectionAction: {
    color: "#6d858d",
    fontSize: 11
  },
  bookingCard: {
    marginBottom: 20,
    padding: 11,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e6ebe5",
    shadowColor: "#2f4837",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3
  },
  bookingSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 83,
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#eef0ef"
  },
  bookingSummaryContent: {
    flex: 1,
    paddingRight: 10
  },
  statusPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#e5f6f8"
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "800"
  },
  bookingDate: {
    marginTop: 5,
    color: "#596661",
    fontSize: 10
  },
  bookingVehicle: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 29,
    backgroundColor: "#ffffff"
  },
  bookingVehicleIcon: {
    color: "#6d746c",
    fontSize: 27
  },
  bookingVehicleImage: {
    width: 48,
    height: 48
  },
  bookingTitle: {
    marginTop: 7,
    color: "#214d60",
    fontSize: 14,
    fontWeight: "800"
  },
  bookingVehicleLabel: {
    marginTop: 2,
    color: "#789098",
    fontSize: 10,
    fontWeight: "600"
  },
  bookingMeta: {
    marginTop: 6,
    color: "#627b83",
    fontSize: 10,
    lineHeight: 16
  },
  bookingDivider: {
    height: 1,
    marginVertical: 8,
    backgroundColor: "#dfe6e3"
  },
  bookingStats: {
    flexDirection: "row"
  },
  bookingUsage: {
    flexDirection: "row",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#edf1ef"
  },
  bookingStat: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 2
  },
  bookingStatLabel: {
    color: "#91a8ae",
    fontSize: 9,
    textAlign: "center"
  },
  bookingStatValue: {
    marginTop: 3,
    color: "#3e606d",
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center"
  },
  bookingActions: {
    flexDirection: "row",
    marginTop: 11
  },
  secondaryButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 35,
    marginRight: 6,
    borderRadius: 9,
    backgroundColor: "#42a8be"
  },
  secondaryButtonText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800"
  },
  primarySmallButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 35,
    marginRight: 6,
    borderRadius: 9,
    backgroundColor: "#42a8be"
  },
  primarySmallButtonText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800"
  },
  directionSmallButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 35,
    borderRadius: 9,
    backgroundColor: "#42a8be"
  },
  directionSmallButtonText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800"
  },
  stationCard: {
    flexDirection: "row",
    marginBottom: 10,
    padding: 8,
    borderRadius: 13,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dcecef",
    shadowColor: "#2f4837",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  stationImage: {
    width: 66,
    minHeight: 78,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: "#d5f0f2"
  },
  stationImageText: {
    color: "#438b9b",
    fontSize: 19,
    fontWeight: "900"
  },
  stationBody: {
    flex: 1,
    paddingLeft: 9
  },
  stationTitleRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  stationTitle: {
    flex: 1,
    color: "#224f60",
    fontSize: 13,
    fontWeight: "800"
  },
  stationStatus: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5
  },
  stationStatusText: {
    fontSize: 9,
    fontWeight: "800"
  },
  stationAddress: {
    marginTop: 5,
    color: "#607b84",
    fontSize: 10
  },
  stationSubAddress: {
    marginTop: 3,
    color: "#7b9299",
    fontSize: 10
  },
  stationDivider: {
    height: 1,
    marginVertical: 7,
    backgroundColor: "#edf1ed"
  },
  stationStats: {
    flexDirection: "row"
  },
  stationStat: {
    flex: 1
  },
  stationStatLabel: {
    color: "#94aab0",
    fontSize: 9
  },
  stationStatValue: {
    marginTop: 2,
    color: "#466b77",
    fontSize: 10,
    fontWeight: "800"
  },
  emptyCard: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 13,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e4eae3"
  },
  emptyTitle: {
    color: "#285666",
    fontSize: 14,
    fontWeight: "800"
  },
  emptyDescription: {
    marginTop: 5,
    color: "#718b93",
    fontSize: 11,
    lineHeight: 17
  },
  emptyAction: {
    alignSelf: "flex-start",
    marginTop: 11,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#a9e2e8"
  },
  emptyActionText: {
    color: "#18586b",
    fontSize: 11,
    fontWeight: "800"
  },
  loadingCard: {
    minHeight: 84,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderRadius: 13,
    backgroundColor: "#ffffff"
  },
  loadingText: {
    marginTop: 8,
    color: "#7a877e",
    fontSize: 11
  },
  bottomNav: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 8,
    paddingBottom: 9,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e4eae3"
  },
  bottomNavItem: {
    alignItems: "center",
    minWidth: 65
  },
  bottomNavIcon: {
    color: "#8fa7ae",
    fontSize: 21
  },
  bottomNavIconActive: {
    color: "#36a5b5"
  },
  bottomNavLabel: {
    marginTop: 2,
    color: "#8fa7ae",
    fontSize: 9
  },
  bottomNavLabelActive: {
    color: "#36a5b5",
    fontWeight: "800"
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(11, 49, 63, 0.4)"
  },
  modalCard: {
    padding: 20,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: "#ffffff"
  },
  modalTitle: {
    color: "#1f5364",
    fontSize: 20,
    fontWeight: "800"
  },
  modalDescription: {
    marginTop: 7,
    color: "#6f878e",
    fontSize: 12,
    lineHeight: 18
  },
  modalInput: {
    marginTop: 15,
    paddingHorizontal: 13,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#d6e9ed",
    borderRadius: 11,
    color: "#1f5364",
    backgroundColor: "#f8fbf7"
  },
  modalActions: {
    flexDirection: "row",
    marginTop: 15
  },
  modalCancelButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    marginRight: 8,
    borderRadius: 10,
    backgroundColor: "#eef2ee"
  },
  modalCancelText: {
    color: "#5f6f64",
    fontWeight: "700"
  },
  modalConfirmButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: "#4db3c1"
  },
  modalConfirmText: {
    color: "#ffffff",
    fontWeight: "800"
  }
});
