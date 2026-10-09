import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import type { Region } from "react-native-maps";
import * as Location from "expo-location";
import { ScreenContainer } from "../../components/common/ScreenContainer";
import { getStations } from "../../services/stationApi";
import {
  getChargingPointStatusLabel,
  getStationStatusLabel
} from "../../utils/format";
import type { RootStackParamList } from "../../navigation/types";
import type { StationItem, StationStatus } from "../../types/api";

type Props = NativeStackScreenProps<RootStackParamList, "StationList">;

type Coordinates = {
  latitude: number;
  longitude: number;
};

const DEFAULT_CENTER: Coordinates = {
  latitude: 21.0285,
  longitude: 105.8542
};

const statusOptions: Array<{ label: string; value?: StationStatus }> = [
  { label: "Tất cả" },
  { label: "Sẵn sàng", value: "active" },
  { label: "Chưa hoạt động", value: "inactive" },
  { label: "Bảo trì", value: "maintenance" },
  { label: "Đóng cửa", value: "closed" }
];

const connectorOptions = ["Tất cả", "AC_Type2", "CCS2", "CHAdeMO", "GB_T"];

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

function getStationMarkerColor(status: StationStatus) {
  switch (status) {
    case "maintenance":
      return "#e5ae39";
    case "inactive":
    case "closed":
      return "#8799a1";
    case "active":
    default:
      return "#42a8be";
  }
}

function getStationAddress(station: StationItem) {
  return [station.address, station.city].filter(Boolean).join(", ");
}

export function MapScreen({ navigation }: Props) {
  const mapRef = useRef<MapView | null>(null);
  const [draftKeyword, setDraftKeyword] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<StationStatus | undefined>();
  const [connectorType, setConnectorType] = useState<string>();
  const [selectedStation, setSelectedStation] = useState<StationItem | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [satelliteMode, setSatelliteMode] = useState(false);
  const [trafficVisible, setTrafficVisible] = useState(true);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const stationQuery = useQuery({
    queryKey: ["stations", "map", keyword, status, connectorType],
    queryFn: () =>
      getStations({
        keyword: keyword || undefined,
        status,
        connectorType: connectorType as StationItem["matchingChargingPoints"][number]["connectorType"] | undefined,
        limit: 50
      })
  });

  const stations = stationQuery.data?.items || [];
  const initialRegion: Region = {
    latitude: coordinates?.latitude ?? stations[0]?.location.lat ?? DEFAULT_CENTER.latitude,
    longitude: coordinates?.longitude ?? stations[0]?.location.lng ?? DEFAULT_CENTER.longitude,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08
  };

  useEffect(() => {
    if (!selectedStation && stations.length) {
      setSelectedStation(stations[0]);
    }
  }, [selectedStation, stations]);

  const legacyRequestLocation = () => {
    const geolocation = getGeolocation();

    if (!geolocation) {
      Alert.alert(
        "Chưa có quyền vị trí",
        "Hãy bật quyền vị trí cho ứng dụng để tìm các trạm gần bạn."
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
        Alert.alert(
          "Không lấy được vị trí",
          "Hãy kiểm tra quyền vị trí trên máy ảo Android."
        );
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 }
    );
  };

  const requestLocation = async () => {
    setLocationLoading(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "\u0043\u0068\u01b0\u0061 \u0063\u00f3 \u0071\u0075\u0079\u1ec1\u006e \u0076\u1ecb \u0074\u0072\u00ed",
          "\u0048\u00e3y \u0062\u1ead\u0074 \u0071\u0075\u0079\u1ec1n \u0076\u1ecb \u0074\u0072\u00ed \u0063\u0068\u006f \u1ee9\u006e\u0067 \u0064\u1ee5\u006e\u0067 \u0111\u1ec3 \u0074\u00ec\u006d \u0063\u00e1\u0063 \u0074\u0072\u1ea1\u006d \u0067\u1ea7\u006e \u0062\u1ea1\u006e."
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      const nextCoordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      setCoordinates(nextCoordinates);
      mapRef.current?.animateToRegion({
        ...nextCoordinates,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08
      });
    } catch {
      Alert.alert(
        "Kh\u00f4ng l\u1ea5y \u0111\u01b0\u1ee3c v\u1ecb tr\u00ed",
        "H\u00e3y ki\u1ec3m tra quy\u1ec1n v\u1ecb tr\u00ed v\u00e0 d\u1ecbch v\u1ee5 GPS tr\u00ean m\u00e1y \u1ea3o Android."
      );
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    void requestLocation();
  }, []);

  useEffect(() => {
    if (!mapReady || coordinates || !stations.length) {
      return;
    }

    mapRef.current?.animateToRegion({
      latitude: stations[0].location.lat,
      longitude: stations[0].location.lng,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08
    });
  }, [mapReady, coordinates, stations]);

  const handleSearch = () => {
    setKeyword(draftKeyword.trim());
    setSelectedStation(null);
  };

  const handleQrLookup = () => {
    const value = qrValue.trim().toLowerCase();
    const station = stations.find((item) =>
      [item._id, item.imei, item.name, item.address].some((field) =>
        field.toLowerCase().includes(value)
      )
    );

    if (station) {
      setSelectedStation(station);
      setQrModalVisible(false);
      setQrValue("");
      return;
    }

    if (value.startsWith("booking:")) {
      setQrModalVisible(false);
      setQrValue("");
      navigation.navigate("BookingHistory");
      return;
    }

    Alert.alert(
      "Không tìm thấy dữ liệu QR",
      "Mã QR cần chứa mã trạm, IMEI, tên trạm hoặc bắt đầu bằng booking:."
    );
  };

  const openDirections = async (station: StationItem) => {
    const destination = `${station.location.lat},${station.location.lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        "Không thể mở Google Maps",
        "Vui lòng kiểm tra ứng dụng bản đồ trên thiết bị."
      );
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.page}>
        <View style={styles.topOverlay}>
          <View style={styles.searchRow}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm trạm sạc theo địa chỉ..."
              placeholderTextColor="#7b8c83"
              value={draftKeyword}
              onChangeText={setDraftKeyword}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <Pressable style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Tìm</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickFilters}
          >
            <Pressable
              style={[styles.quickChip, !status && styles.quickChipActive]}
              onPress={() => setStatus(undefined)}
            >
              <Text style={styles.quickChipIcon}>⌁</Text>
              <Text style={styles.quickChipText}>Tất cả</Text>
            </Pressable>
            <Pressable
              style={styles.quickChip}
              onPress={() => setStatus("active")}
            >
              <Text style={styles.quickChipIcon}>●</Text>
              <Text style={styles.quickChipText}>Sẵn sàng</Text>
            </Pressable>
            <Pressable style={styles.quickChip} onPress={() => setFiltersVisible(true)}>
              <Text style={styles.quickChipIcon}>☷</Text>
              <Text style={styles.quickChipText}>Bộ lọc nâng cao</Text>
            </Pressable>
            <Pressable style={styles.quickChip} onPress={() => setQrModalVisible(true)}>
              <Text style={styles.quickChipIcon}>▦</Text>
              <Text style={styles.quickChipText}>Quét QR</Text>
            </Pressable>
          </ScrollView>
        </View>

        <View style={[styles.mapSurface, satelliteMode && styles.mapSurfaceSatellite]}>
          <MapView
            ref={mapRef}
            style={styles.realMap}
            provider={PROVIDER_GOOGLE}
            mapType={satelliteMode ? "satellite" : "standard"}
            showsTraffic={trafficVisible}
            showsUserLocation={Boolean(coordinates)}
            showsMyLocationButton={false}
            initialRegion={initialRegion}
            onMapReady={() => setMapReady(true)}
          >
            {stations.map((station) => (
              <Marker
                key={station._id}
                coordinate={{
                  latitude: station.location.lat,
                  longitude: station.location.lng
                }}
                pinColor={getStationMarkerColor(station.status)}
                title={station.name}
                description={getStationAddress(station)}
                onPress={() => setSelectedStation(station)}
              />
            ))}
          </MapView>
          <View style={styles.waterArea} />
          <View style={styles.parkArea} />
          <View style={[styles.road, styles.roadOne]} />
          <View style={[styles.road, styles.roadTwo]} />
          <View style={[styles.road, styles.roadThree]} />
          <View style={[styles.road, styles.roadFour]} />
          {trafficVisible ? (
            <View style={[styles.trafficLine, styles.trafficOne]} />
          ) : null}
          <Text style={styles.mapLabel}>Khu vực trạm sạc</Text>
          <Text style={styles.mapLabelSecondary}>Bản đồ trực tiếp</Text>

          {stations.map((station, index) => {
            const left = 14 + ((index * 23) % 72);
            const top = 27 + ((index * 31) % 46);
            const selected = selectedStation?._id === station._id;
            const markerColor = getStationMarkerColor(station.status);

            return (
              <Pressable
                key={station._id}
                style={[
                  styles.marker,
                  { left: `${left}%`, top: `${top}%` },
                  selected && styles.markerSelected
                ]}
                onPress={() => setSelectedStation(station)}
                accessibilityRole="button"
                accessibilityLabel={`Mở trạm ${station.name}`}
              >
                <View style={[styles.markerDot, { backgroundColor: markerColor }]}>
                  <Text style={styles.markerIcon}>⚡</Text>
                </View>
                {selected ? <View style={[styles.markerTail, { borderTopColor: markerColor }]} /> : null}
              </Pressable>
            );
          })}

          <View style={styles.mapControls}>
            <Pressable style={styles.mapControl} onPress={() => setQrModalVisible(true)}>
              <Text style={styles.mapControlText}>▦</Text>
            </Pressable>
            <Pressable style={styles.mapControl} onPress={() => setSatelliteMode((value) => !value)}>
              <Text style={styles.mapControlText}>◇</Text>
            </Pressable>
            <Pressable style={styles.mapControl} onPress={() => setTrafficVisible((value) => !value)}>
              <Text style={[styles.mapControlText, trafficVisible && styles.mapControlActive]}>≋</Text>
            </Pressable>
            <Pressable style={styles.mapControl} onPress={requestLocation}>
              {locationLoading ? (
                <ActivityIndicator color="#a8d91c" size="small" />
              ) : (
                <Text style={styles.mapControlText}>●</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.modeHint}>
            <Text style={styles.modeHintText}>{satelliteMode ? "Vệ tinh" : "Thông thường"}</Text>
            <Text style={styles.modeHintDot}>•</Text>
            <Text style={styles.modeHintText}>{trafficVisible ? "Giao thông" : "Ẩn giao thông"}</Text>
          </View>

          <View
            style={[
              styles.userMarker,
              {
                left: coordinates ? "47%" : "52%",
                top: coordinates ? "52%" : "58%"
              }
            ]}
          >
            <View style={styles.userMarkerPulse} />
            <View style={styles.userMarkerDot} />
          </View>

          {stationQuery.isFetching ? (
            <View style={styles.loadingBadge}>
              <ActivityIndicator color="#42a8be" size="small" />
              <Text style={styles.loadingBadgeText}>Đang cập nhật trạm</Text>
            </View>
          ) : null}
        </View>

        {selectedStation ? (
          <View style={styles.stationCard}>
            <View style={styles.stationCardHeader}>
              <View style={styles.stationThumb}>
                <Text style={styles.stationThumbText}>EV</Text>
              </View>
              <View style={styles.stationCardHeading}>
                <Text style={styles.stationName} numberOfLines={1}>
                  {selectedStation.name}
                </Text>
                <View style={styles.stationStatusRow}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStationMarkerColor(selectedStation.status) }
                    ]}
                  />
                  <Text style={styles.stationStatus}>
                    {getStationStatusLabel(selectedStation.status)}
                  </Text>
                </View>
              </View>
              <Text style={styles.stationDistance}>
                {coordinates
                  ? `${distanceInKm(coordinates, selectedStation).toFixed(1)} km`
                  : "-- km"}
              </Text>
            </View>
            <Text style={styles.stationAddress} numberOfLines={1}>
              ⌖ {getStationAddress(selectedStation)}
            </Text>
            <View style={styles.stationMetaRow}>
              <MapMeta label="Kết nối" value={`${selectedStation.availableChargingPoints}/${selectedStation.totalChargingPoints}`} />
              <MapMeta
                label="Cổng sạc"
                value={selectedStation.matchingChargingPoints[0]?.connectorType || "--"}
              />
              <MapMeta
                label="Trạng thái"
                value={selectedStation.matchingChargingPoints[0]
                  ? getChargingPointStatusLabel(selectedStation.matchingChargingPoints[0].status)
                  : "--"}
              />
            </View>
            <View style={styles.stationActions}>
              <Pressable
                style={styles.stationActionPrimary}
                onPress={() => navigation.navigate("StationDetail", { station: selectedStation })}
              >
                <Text style={styles.stationActionPrimaryText}>Xem chi tiết</Text>
              </Pressable>
              <Pressable style={styles.stationActionDirection} onPress={() => openDirections(selectedStation)}>
                <Text style={styles.stationActionDirectionText}>Chỉ đường</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.emptyStationCard}>
            <Text style={styles.emptyStationText}>
              {stations.length ? "Chọn một marker để xem thông tin trạm." : "Chưa có trạm phù hợp."}
            </Text>
          </View>
        )}

        <View style={styles.bottomNav}>
          <MapNavItem label="Trang chủ" icon="⌂" onPress={() => navigation.navigate("Home")} />
          <MapNavItem label="Bản đồ" icon="◈" active onPress={() => undefined} />
          <MapNavItem label="Yêu thích" icon="♡" onPress={() => navigation.navigate("Favorites")} />
          <MapNavItem label="Tài khoản" icon="♙" onPress={() => navigation.navigate("Profile")} />
        </View>
      </View>

      <Modal
        visible={filtersVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFiltersVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.filterModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bộ lọc nâng cao</Text>
              <Pressable onPress={() => setFiltersVisible(false)}>
                <Text style={styles.modalClose}>×</Text>
              </Pressable>
            </View>
            <Text style={styles.filterLabel}>Trạng thái trạm</Text>
            <View style={styles.optionWrap}>
              {statusOptions.map((option) => {
                const active = option.value === status || (!option.value && !status);
                return (
                  <Pressable
                    key={option.label}
                    style={[styles.optionChip, active && styles.optionChipActive]}
                    onPress={() => setStatus(option.value)}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.filterLabel}>Loại cổng sạc</Text>
            <View style={styles.optionWrap}>
              {connectorOptions.map((option) => {
                const active = option === "Tất cả" ? !connectorType : connectorType === option;
                return (
                  <Pressable
                    key={option}
                    style={[styles.optionChip, active && styles.optionChipActive]}
                    onPress={() => setConnectorType(option === "Tất cả" ? undefined : option)}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable style={styles.applyButton} onPress={() => setFiltersVisible(false)}>
              <Text style={styles.applyButtonText}>Áp dụng bộ lọc</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={qrModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.filterModal}>
            <Text style={styles.modalTitle}>Quét mã QR</Text>
            <Text style={styles.modalDescription}>
              Nhập mã trạm hoặc mã booking để mở thông tin tương ứng.
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
              <Pressable style={styles.modalCancelButton} onPress={() => setQrModalVisible(false)}>
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

function MapMeta(props: { label: string; value: string }) {
  return (
    <View style={styles.mapMeta}>
      <Text style={styles.mapMetaLabel}>{props.label}</Text>
      <Text style={styles.mapMetaValue} numberOfLines={1}>{props.value}</Text>
    </View>
  );
}

function MapNavItem(props: {
  label: string;
  icon: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.navItem} onPress={props.onPress}>
      <Text style={[styles.navIcon, props.active && styles.navIconActive]}>{props.icon}</Text>
      <Text style={[styles.navLabel, props.active && styles.navLabelActive]}>{props.label}</Text>
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
  topOverlay: {
    position: "absolute",
    zIndex: 5,
    top: 12,
    left: 12,
    right: 12
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    paddingHorizontal: 13,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    shadowColor: "#285b67",
    shadowOpacity: 0.16,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5
  },
  searchIcon: {
    marginRight: 8,
    color: "#82c923",
    fontSize: 26
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    color: "#204e5f",
    fontSize: 13
  },
  searchButton: {
    paddingHorizontal: 8,
    paddingVertical: 6
  },
  searchButtonText: {
    color: "#75b91e",
    fontSize: 12,
    fontWeight: "800"
  },
  quickFilters: {
    paddingTop: 9,
    paddingBottom: 4
  },
  quickChip: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    shadowColor: "#285b67",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  quickChipActive: {
    backgroundColor: "#e5f6f8"
  },
  quickChipIcon: {
    marginRight: 5,
    color: "#78bd20",
    fontSize: 13,
    fontWeight: "800"
  },
  quickChipText: {
    color: "#285162",
    fontSize: 11,
    fontWeight: "700"
  },
  mapSurface: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#e7f0ed"
  },
  realMap: {
    ...StyleSheet.absoluteFill
  },
  mapSurfaceSatellite: {
    backgroundColor: "#849faa"
  },
  waterArea: {
    display: "none",
    position: "absolute",
    top: "18%",
    right: "-12%",
    width: "60%",
    height: "38%",
    borderRadius: 120,
    backgroundColor: "#a9d7e8",
    transform: [{ rotate: "-12deg" }]
  },
  parkArea: {
    display: "none",
    position: "absolute",
    bottom: "8%",
    left: "-10%",
    width: "54%",
    height: "30%",
    borderRadius: 100,
    backgroundColor: "#c9ebd1"
  },
  road: {
    display: "none",
    position: "absolute",
    height: 8,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d3dfdc"
  },
  roadOne: {
    width: "125%",
    top: "50%",
    left: "-12%",
    transform: [{ rotate: "-18deg" }]
  },
  roadTwo: {
    width: "120%",
    top: "71%",
    left: "-10%",
    transform: [{ rotate: "16deg" }]
  },
  roadThree: {
    width: "100%",
    top: "37%",
    left: "10%",
    transform: [{ rotate: "72deg" }]
  },
  roadFour: {
    width: "90%",
    top: "65%",
    left: "12%",
    transform: [{ rotate: "-58deg" }]
  },
  trafficLine: {
    display: "none",
    position: "absolute",
    height: 3,
    borderRadius: 3,
    backgroundColor: "#f2a33b"
  },
  trafficOne: {
    width: "115%",
    top: "51%",
    left: "-8%",
    transform: [{ rotate: "-18deg" }]
  },
  mapLabel: {
    display: "none",
    position: "absolute",
    top: "39%",
    left: "12%",
    color: "#6e9695",
    fontSize: 12,
    fontWeight: "700"
  },
  mapLabelSecondary: {
    display: "none",
    position: "absolute",
    top: "43%",
    left: "12%",
    color: "#8eaaa8",
    fontSize: 10
  },
  marker: {
    display: "none",
    position: "absolute",
    width: 42,
    height: 48,
    alignItems: "center"
  },
  markerSelected: {
    transform: [{ scale: 1.12 }]
  },
  markerDot: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    borderWidth: 3,
    borderColor: "#ffffff",
    shadowColor: "#1f5867",
    shadowOpacity: 0.22,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4
  },
  markerIcon: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900"
  },
  markerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent"
  },
  mapControls: {
    position: "absolute",
    top: "30%",
    right: 12,
    alignItems: "center"
  },
  mapControl: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
    borderRadius: 13,
    backgroundColor: "#193e45",
    shadowColor: "#173d44",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5
  },
  mapControlText: {
    color: "#a8d91c",
    fontSize: 21,
    fontWeight: "800"
  },
  mapControlActive: {
    color: "#55c7d7"
  },
  modeHint: {
    position: "absolute",
    top: "24%",
    right: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: "#ffffffcc"
  },
  modeHintText: {
    color: "#386775",
    fontSize: 9,
    fontWeight: "700"
  },
  modeHintDot: {
    marginHorizontal: 4,
    color: "#71b82c",
    fontSize: 12
  },
  userMarker: {
    display: "none",
    position: "absolute",
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center"
  },
  userMarkerPulse: {
    position: "absolute",
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#55c8db55"
  },
  userMarkerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#42a8be",
    borderWidth: 3,
    borderColor: "#ffffff"
  },
  loadingBadge: {
    position: "absolute",
    top: "16%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 15,
    backgroundColor: "#ffffffdd"
  },
  loadingBadgeText: {
    marginLeft: 6,
    color: "#356975",
    fontSize: 10,
    fontWeight: "700"
  },
  stationCard: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 62,
    padding: 12,
    borderRadius: 15,
    backgroundColor: "#ffffff",
    shadowColor: "#27535d",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6
  },
  stationCardHeader: {
    flexDirection: "row",
    alignItems: "center"
  },
  stationThumb: {
    width: 49,
    height: 49,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: "#d7f0ef"
  },
  stationThumbText: {
    color: "#3d8b99",
    fontSize: 15,
    fontWeight: "900"
  },
  stationCardHeading: {
    flex: 1,
    marginLeft: 9
  },
  stationName: {
    color: "#214f60",
    fontSize: 14,
    fontWeight: "900"
  },
  stationStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4
  },
  statusDot: {
    width: 7,
    height: 7,
    marginRight: 5,
    borderRadius: 4
  },
  stationStatus: {
    color: "#6d858d",
    fontSize: 10,
    fontWeight: "700"
  },
  stationDistance: {
    color: "#315b68",
    fontSize: 11,
    fontWeight: "800"
  },
  stationAddress: {
    marginTop: 8,
    color: "#5d777f",
    fontSize: 10
  },
  stationMetaRow: {
    flexDirection: "row",
    marginTop: 9,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#edf1ef"
  },
  mapMeta: {
    flex: 1,
    alignItems: "center"
  },
  mapMetaLabel: {
    color: "#91a8ae",
    fontSize: 9
  },
  mapMetaValue: {
    marginTop: 3,
    color: "#345f6c",
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center"
  },
  stationActions: {
    flexDirection: "row",
    marginTop: 10
  },
  stationActionPrimary: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 35,
    marginRight: 7,
    borderRadius: 9,
    backgroundColor: "#42a8be"
  },
  stationActionPrimaryText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800"
  },
  stationActionDirection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 35,
    borderRadius: 9,
    backgroundColor: "#a8d91c"
  },
  stationActionDirectionText: {
    color: "#294817",
    fontSize: 11,
    fontWeight: "800"
  },
  emptyStationCard: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 62,
    padding: 16,
    borderRadius: 15,
    backgroundColor: "#ffffff"
  },
  emptyStationText: {
    color: "#607d84",
    fontSize: 12,
    textAlign: "center"
  },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e0ebea"
  },
  navItem: {
    flex: 1,
    alignItems: "center"
  },
  navIcon: {
    color: "#7fa9a8",
    fontSize: 20
  },
  navIconActive: {
    color: "#a8d91c"
  },
  navLabel: {
    marginTop: 1,
    color: "#7fa0a4",
    fontSize: 9
  },
  navLabelActive: {
    color: "#73ac1b",
    fontWeight: "800"
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#173c4455"
  },
  filterModal: {
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#ffffff"
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  modalTitle: {
    color: "#214f60",
    fontSize: 20,
    fontWeight: "900"
  },
  modalClose: {
    color: "#709099",
    fontSize: 30,
    lineHeight: 30
  },
  modalDescription: {
    marginTop: 7,
    marginBottom: 14,
    color: "#6e858c",
    fontSize: 12,
    lineHeight: 18
  },
  filterLabel: {
    marginTop: 14,
    marginBottom: 8,
    color: "#315d69",
    fontSize: 12,
    fontWeight: "800"
  },
  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  optionChip: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "#f2f7f6",
    borderWidth: 1,
    borderColor: "#dce9e6"
  },
  optionChipActive: {
    backgroundColor: "#d9f1f2",
    borderColor: "#42a8be"
  },
  optionText: {
    color: "#66828a",
    fontSize: 11,
    fontWeight: "700"
  },
  optionTextActive: {
    color: "#277789"
  },
  applyButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: "#42a8be"
  },
  applyButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800"
  },
  modalInput: {
    minHeight: 46,
    paddingHorizontal: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d8e5e2",
    backgroundColor: "#f8fbfa",
    color: "#214f60"
  },
  modalActions: {
    flexDirection: "row",
    marginTop: 14
  },
  modalCancelButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    marginRight: 8,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#d8e5e2"
  },
  modalCancelText: {
    color: "#52727c",
    fontWeight: "800"
  },
  modalConfirmButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    borderRadius: 11,
    backgroundColor: "#42a8be"
  },
  modalConfirmText: {
    color: "#ffffff",
    fontWeight: "800"
  }
});
