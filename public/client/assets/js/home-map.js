const appConfig = window.TRAM_SAC_CONFIG || {};
const storageKeys = {
  theme: "tram_sac_theme",
  language: "tram_sac_language",
  publicProfile: "tram_sac_public_profile",
  adminProfile: "tram_sac_admin_profile",
  adminToken: "tram_sac_admin_token",
  favoriteStations: "tram_sac_favorite_stations",
  stationImages: "tram_sac_station_images"
};

const translations = {
  vi: {
    map: "Ban do",
    stations: "Tram sac",
    notifications: "Thong bao",
    admin: "Quan tri admin",
    eyebrow: "BAN DO TRAM SAC",
    title: "Tim tram sac gan ban",
    searchLabel: "Tim kiem",
    cityLabel: "Thanh pho/Tinh",
    districtLabel: "Quan/Huyen",
    connectorLabel: "Loai cong sac",
    typeLabel: "Loai tram",
    statusLabel: "Trang thai tram",
    statusReady: "San sang",
    statusFull: "Day",
    statusMaintenance: "Bao tri",
    statusInactive: "Chua hoat dong",
    statusClosed: "Dong cua",
    statStations: "Tram dang hien thi",
    statPoints: "Cong sac kha dung",
    statPower: "Tong cong suat",
    nearby: "DIEM GAN BAN",
    locate: "Vi tri cua toi",
    refresh: "Lam moi",
    all: "Tat ca",
    charging: "Tram sac",
    available: "Con cho",
    maintenance: "Bao tri",
    listTitleAll: "Danh sach tram",
    listTitleCharging: "Danh sach tram sac",
    mapLoading: "Dang tai ban do...",
    mapReady: "Da cap nhat du lieu ban do.",
    empty: "Khong co tram phu hop voi bo loc hien tai.",
    notificationEmpty: "Chua co thong bao moi.",
    profile: "Ho so ca nhan",
    logout: "Dang xuat",
    save: "Luu thay doi",
    cancel: "Huy",
    searchPlaceholder: "Tim tram, dia chi...",
    filterPlaceholder: "Ten tram hoac dia chi",
    connected: "Da dong bo du lieu.",
    connecting: "Dang ket noi du lieu...",
    noKey: "Thieu LocationIQ API key.",
    searchButton: "Search",
    bellButton: "Bell",
    menuButton: "Menu"
  },
  en: {
    map: "Map",
    stations: "Charging Stations",
    notifications: "Notifications",
    admin: "Admin Panel",
    eyebrow: "CHARGING MAP",
    title: "Find nearby charging points",
    searchLabel: "Search",
    cityLabel: "City/Province",
    districtLabel: "District",
    connectorLabel: "Connector type",
    typeLabel: "Station type",
    statusLabel: "Station status",
    statusReady: "Ready",
    statusFull: "Full",
    statusMaintenance: "Maintenance",
    statusInactive: "Inactive",
    statusClosed: "Closed",
    statStations: "Visible stations",
    statPoints: "Available points",
    statPower: "Total power",
    nearby: "NEARBY",
    locate: "My location",
    refresh: "Refresh",
    all: "All",
    charging: "Charging",
    available: "Available",
    maintenance: "Maintenance",
    listTitleAll: "Station list",
    listTitleCharging: "Charging stations",
    mapLoading: "Loading map...",
    mapReady: "Map data updated.",
    empty: "No stations match the current filters.",
    notificationEmpty: "No new notifications.",
    profile: "Profile",
    logout: "Log out",
    save: "Save changes",
    cancel: "Cancel",
    searchPlaceholder: "Search by station or address...",
    filterPlaceholder: "Station name or address",
    connected: "Data synchronized.",
    connecting: "Connecting data...",
    noKey: "LocationIQ API key is missing.",
    searchButton: "Search",
    bellButton: "Bell",
    menuButton: "Menu"
  }
};

const fallbackStations = [
  {
    id: "demo-st-1",
    type: "charging",
    name: "Tram Sac Hoan Kiem",
    address: "58 Ly Thai To, Hoan Kiem, Ha Noi",
    lat: 21.0283,
    lng: 105.8535,
    status: "active",
    statusKey: "ready",
    city: "Ha Noi",
    district: "Hoan Kiem",
    connectorTypes: ["CCS2", "AC_Type2"],
    availableUnits: 6,
    totalUnits: 10,
    powerKw: 360,
    detail: "CCS2, AC Type2"
  },
  {
    id: "demo-st-2",
    type: "charging",
    name: "Tram Sac Long Bien",
    address: "Nguyen Van Cu, Long Bien, Ha Noi",
    lat: 21.0438,
    lng: 105.8897,
    status: "active",
    statusKey: "ready",
    city: "Ha Noi",
    district: "Long Bien",
    connectorTypes: ["CCS2"],
    availableUnits: 4,
    totalUnits: 8,
    powerKw: 240,
    detail: "CCS2"
  },
  {
    id: "demo-st-3",
    type: "charging",
    name: "Tram Sac My Dinh",
    address: "Pham Hung, Nam Tu Liem, Ha Noi",
    lat: 21.0288,
    lng: 105.7796,
    status: "active",
    statusKey: "full",
    city: "Ha Noi",
    district: "Nam Tu Liem",
    availableUnits: 0,
    totalUnits: 8,
    powerKw: 320,
    connectorTypes: ["CCS2"],
    detail: "CCS2 | 320kW"
  },
  {
    id: "demo-st-4",
    type: "charging",
    name: "Tram Sac Cau Giay",
    address: "Tran Thai Tong, Cau Giay, Ha Noi",
    lat: 21.0368,
    lng: 105.7905,
    status: "maintenance",
    statusKey: "maintenance",
    city: "Ha Noi",
    district: "Cau Giay",
    availableUnits: 0,
    totalUnits: 4,
    powerKw: 160,
    connectorTypes: ["AC_Type2"],
    detail: "AC_Type2 | Dang bao tri"
  },
  {
    id: "demo-st-5",
    type: "charging",
    name: "Tram Sac Dong Da",
    address: "Lang Ha, Dong Da, Ha Noi",
    lat: 21.0125,
    lng: 105.8158,
    status: "inactive",
    statusKey: "inactive",
    city: "Ha Noi",
    district: "Dong Da",
    availableUnits: 0,
    totalUnits: 6,
    powerKw: 180,
    connectorTypes: ["CHAdeMO"],
    detail: "CHAdeMO | Chua hoat dong"
  },
  {
    id: "demo-st-6",
    type: "charging",
    name: "Tram Sac Ba Dinh",
    address: "Doi Can, Ba Dinh, Ha Noi",
    lat: 21.0373,
    lng: 105.8214,
    status: "closed",
    statusKey: "closed",
    city: "Ha Noi",
    district: "Ba Dinh",
    availableUnits: 0,
    totalUnits: 5,
    powerKw: 200,
    connectorTypes: ["GB_T"],
    detail: "GB_T | Dong cua"
  }
];

const els = {
  body: document.body,
  sidebarToggle: document.getElementById("sidebarToggle"),
  themeToggle: document.getElementById("themeToggle"),
  themeLabel: document.getElementById("themeLabel"),
  searchToggle: document.getElementById("searchToggle"),
  headerSearchWrap: document.querySelector(".header-search-wrap"),
  headerSearch: document.getElementById("headerSearch"),
  notificationToggle: document.getElementById("notificationToggle"),
  notificationMenu: document.getElementById("notificationMenu"),
  notificationEmpty: document.getElementById("notificationEmpty"),
  languageToggle: document.getElementById("languageToggle"),
  profileToggle: document.getElementById("profileToggle"),
  profileMenu: document.getElementById("profileMenu"),
  profileAction: document.getElementById("profileAction"),
  logoutAction: document.getElementById("logoutAction"),
  avatarInitials: document.getElementById("avatarInitials"),
  profileName: document.getElementById("profileName"),
  profileWallet: document.getElementById("profileWallet"),
  profileMenuName: document.getElementById("profileMenuName"),
  stationSearch: document.getElementById("stationSearch"),
  cityFilter: document.getElementById("cityFilter"),
  districtFilter: document.getElementById("districtFilter"),
  connectorTypeFilter: document.getElementById("connectorTypeFilter"),
  stationType: document.getElementById("stationType"),
  statusFilterList: document.getElementById("statusFilterList"),
  locateMeBtn: document.getElementById("locateMeBtn"),
  refreshMapBtn: document.getElementById("refreshMapBtn"),
  resultsTitle: document.getElementById("resultsTitle"),
  resultsCount: document.getElementById("resultsCount"),
  stationList: document.getElementById("stationList"),
  stationCount: document.getElementById("stationCount"),
  availablePointCount: document.getElementById("availablePointCount"),
  totalPower: document.getElementById("totalPower"),
  mapMessage: document.getElementById("mapMessage"),
  mapConnectionStatus: document.getElementById("mapConnectionStatus"),
  profileModal: document.getElementById("profileModal"),
  closeProfileModal: document.getElementById("closeProfileModal"),
  cancelProfileBtn: document.getElementById("cancelProfileBtn"),
  saveProfileBtn: document.getElementById("saveProfileBtn"),
  profileTabs: Array.from(document.querySelectorAll(".profile-tab")),
  profilePanels: Array.from(document.querySelectorAll(".profile-panel")),
  profileUsername: document.getElementById("profileUsername"),
  profileFullName: document.getElementById("profileFullName"),
  profileEmail: document.getElementById("profileEmail"),
  profilePhone: document.getElementById("profilePhone"),
  profileDescription: document.getElementById("profileDescription"),
  profileAddress: document.getElementById("profileAddress"),
  profileLandingPage: document.getElementById("profileLandingPage"),
  profileRoleValue: document.getElementById("profileRoleValue"),
  profileWalletValue: document.getElementById("profileWalletValue"),
  profileLanguageValue: document.getElementById("profileLanguageValue"),
  profileThemeValue: document.getElementById("profileThemeValue"),
  profileVisibleStationsValue: document.getElementById("profileVisibleStationsValue"),
  profileDeviceValue: document.getElementById("profileDeviceValue"),
  stationDetailPanel: document.getElementById("stationDetailPanel"),
  closeStationDetail: document.getElementById("closeStationDetail"),
  stationDetailImage: document.getElementById("stationDetailImage"),
  stationDetailStatus: document.getElementById("stationDetailStatus"),
  stationDetailType: document.getElementById("stationDetailType"),
  stationDetailName: document.getElementById("stationDetailName"),
  stationDetailAddress: document.getElementById("stationDetailAddress"),
  stationDetailCurrentType: document.getElementById("stationDetailCurrentType"),
  stationDetailPorts: document.getElementById("stationDetailPorts"),
  stationDetailPricing: document.getElementById("stationDetailPricing"),
  stationDetailStatusText: document.getElementById("stationDetailStatusText"),
  stationDetailOpen247: document.getElementById("stationDetailOpen247"),
  favoriteStationBtn: document.getElementById("favoriteStationBtn"),
  uploadStationImageBtn: document.getElementById("uploadStationImageBtn"),
  directionsBtn: document.getElementById("directionsBtn"),
  stationImageInput: document.getElementById("stationImageInput"),
  nearbyStationList: document.getElementById("nearbyStationList"),
  chargingPointList: document.getElementById("chargingPointList"),
  bookStationBtn: document.getElementById("bookStationBtn"),
  bookingModal: document.getElementById("bookingModal"),
  closeBookingModal: document.getElementById("closeBookingModal"),
  bookingFormPanel: document.getElementById("bookingFormPanel"),
  bookingSuccessPanel: document.getElementById("bookingSuccessPanel"),
  bookingResultStep: document.getElementById("bookingResultStep"),
  bookingPointList: document.getElementById("bookingPointList"),
  bookingDate: document.getElementById("bookingDate"),
  bookingDuration: document.getElementById("bookingDuration"),
  bookingSlotList: document.getElementById("bookingSlotList"),
  bookingStartTime: document.getElementById("bookingStartTime"),
  bookingEndTime: document.getElementById("bookingEndTime"),
  bookingStatusInline: document.getElementById("bookingStatusInline"),
  bookingConfirmBtn: document.getElementById("bookingConfirmBtn"),
  bookingBackBtn: document.getElementById("bookingBackBtn"),
  bookingNewBtn: document.getElementById("bookingNewBtn"),
  bookingSummaryPoint: document.getElementById("bookingSummaryPoint"),
  bookingSummaryAddress: document.getElementById("bookingSummaryAddress"),
  bookingSummaryTime: document.getElementById("bookingSummaryTime"),
  bookingSummaryDuration: document.getElementById("bookingSummaryDuration"),
  bookingSummaryPrice: document.getElementById("bookingSummaryPrice"),
  bookingSummaryMinutePrice: document.getElementById("bookingSummaryMinutePrice"),
  bookingSummaryEstimate: document.getElementById("bookingSummaryEstimate"),
  bookingSummaryCurrent: document.getElementById("bookingSummaryCurrent"),
  bookingSummaryCreatedAt: document.getElementById("bookingSummaryCreatedAt"),
  navItems: Array.from(document.querySelectorAll(".nav-item[data-view]"))
};

const state = {
  language: localStorage.getItem(storageKeys.language) || "vi",
  theme: localStorage.getItem(storageKeys.theme) || "light",
  map: null,
  tileLayer: null,
  userMarker: null,
  stations: [],
  filteredStations: [],
  markers: new Map(),
  selectedStationId: "",
  statusFilter: "all",
  notifications: [],
  booking: {
    pointId: "",
    slotStart: "",
    slotEnd: "",
    result: null
  }
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getText(key) {
  const bundle = translations[state.language] || translations.vi;
  return bundle[key] || key;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN").format(Number(value || 0));
}

function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateTimeDisplay(value) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function isMongoObjectId(value) {
  return /^[a-f0-9]{24}$/i.test(String(value || ""));
}

function toTimeString(date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function parseDateAndTime(dateValue, timeValue) {
  return new Date(`${dateValue}T${timeValue}:00`);
}

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function splitAddress(address) {
  const parts = String(address || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    city: parts.at(-1) || "Chua xac dinh",
    district: parts.length > 1 ? parts.at(-2) : "Chua xac dinh"
  };
}

function deriveStationStatus(rawStatus, availableUnits, totalUnits) {
  if (rawStatus === "closed") {
    return "closed";
  }

  if (rawStatus === "inactive") {
    return "inactive";
  }

  if (rawStatus === "maintenance") {
    return "maintenance";
  }

  if (totalUnits > 0 && availableUnits <= 0) {
    return "full";
  }

  return "ready";
}

function getStatusLabel(statusKey) {
  const labels = {
    ready: "statusReady",
    full: "statusFull",
    maintenance: "statusMaintenance",
    inactive: "statusInactive",
    closed: "statusClosed"
  };

  return getText(labels[statusKey] || "statusReady");
}

function getStatusClass(statusKey) {
  return ["ready", "full", "maintenance", "inactive", "closed"].includes(statusKey)
    ? statusKey
    : "ready";
}

function getStationById(stationId) {
  return state.stations.find((station) => station.id === stationId);
}

function getChargingPointStatus(point) {
  if (point.status === "available") {
    return { key: "ready", label: "San sang" };
  }

  if (point.status === "maintenance") {
    return { key: "maintenance", label: "Bao tri" };
  }

  return { key: "charging", label: "Dang sac" };
}

function getStationChargingPoints(station) {
  if (station.type !== "charging") {
    return [];
  }

  if (Array.isArray(station.chargingPoints) && station.chargingPoints.length) {
    return station.chargingPoints;
  }

  const defaultStatus =
    station.statusKey === "maintenance"
      ? "maintenance"
      : station.statusKey === "full"
        ? "occupied"
        : station.statusKey === "ready"
          ? "available"
          : "maintenance";

  return Array.from({ length: station.totalUnits || 0 }, (_, index) => ({
    id: `${station.id}-point-${index + 1}`,
    code: `CP-${String(index + 1).padStart(2, "0")}`,
    connectorType: station.connectorTypes?.[index % Math.max(station.connectorTypes.length, 1)] || "CCS2",
    powerKw: Math.round((station.powerKw || 0) / Math.max(station.totalUnits || 1, 1)),
    status: index < station.availableUnits ? "available" : defaultStatus,
    pricing: {
      name: "Gia dich vu mac dinh",
      pricePerKwh: 3500,
      pricePerMinute: 0
    }
  }));
}

function getCurrentType(station) {
  const connectorTypes = station.connectorTypes || [];

  if (!connectorTypes.length) {
    return station.currentType || "--";
  }

  const currentTypes = new Set(
    connectorTypes.map((connectorType) => (connectorType === "AC_Type2" ? "AC" : "DC"))
  );

  return `${[...currentTypes].join(" / ")} (${connectorTypes.join(", ")})`;
}

function getStationPricing(station) {
  const pricings = getStationChargingPoints(station)
    .map((point) => point.pricing)
    .filter(Boolean);

  if (!pricings.length) {
    return "Chua cap nhat";
  }

  const pricing = pricings[0];
  const perKwh = Number(pricing.pricePerKwh || 0);
  const perMinute = Number(pricing.pricePerMinute || 0);
  const minuteText = perMinute ? ` + ${formatCurrency(perMinute)} VND/phut` : "";

  return `${formatCurrency(perKwh)} VND/kWh${minuteText}`;
}

function getFavoriteStationIds() {
  try {
    const ids = JSON.parse(localStorage.getItem(storageKeys.favoriteStations) || "[]");
    return Array.isArray(ids) ? new Set(ids) : new Set();
  } catch {
    return new Set();
  }
}

function saveFavoriteStationIds(ids) {
  localStorage.setItem(storageKeys.favoriteStations, JSON.stringify([...ids]));
}

function getStationImages() {
  try {
    const images = JSON.parse(localStorage.getItem(storageKeys.stationImages) || "{}");
    return images && typeof images === "object" ? images : {};
  } catch {
    return {};
  }
}

function saveStationImages(images) {
  localStorage.setItem(storageKeys.stationImages, JSON.stringify(images));
}

function getStationImage(stationId) {
  return getStationImages()[stationId] || "/images/station-placeholder.svg";
}

function calculateDistanceKm(from, to) {
  const earthRadius = 6371;
  const toRadians = (value) => (value * Math.PI) / 180;
  const latDiff = toRadians(to.lat - from.lat);
  const lngDiff = toRadians(to.lng - from.lng);
  const value =
    Math.sin(latDiff / 2) ** 2 +
    Math.cos(toRadians(from.lat)) *
      Math.cos(toRadians(to.lat)) *
      Math.sin(lngDiff / 2) ** 2;

  return Number((earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))).toFixed(1));
}

function getNearbyStations(station) {
  return state.stations
    .filter((item) => item.id !== station.id)
    .map((item) => ({
      ...item,
      distanceKm: calculateDistanceKm(station, item)
    }))
    .sort((left, right) => left.distanceKm - right.distanceKm)
    .slice(0, 3);
}

function renderStationDetail() {
  const station = getStationById(state.selectedStationId);

  if (!station || !els.stationDetailPanel) {
    return;
  }

  const favoriteIds = getFavoriteStationIds();
  const statusClass = getStatusClass(station.statusKey);
  const stationType = "Tram sac";

  els.stationDetailPanel.hidden = false;
  els.stationDetailPanel.classList.add("open");

  if (els.stationDetailImage) {
    els.stationDetailImage.src = getStationImage(station.id);
    els.stationDetailImage.alt = `Hinh anh ${station.name}`;
  }

  if (els.stationDetailStatus) {
    els.stationDetailStatus.className = `station-status-badge ${statusClass}`;
    els.stationDetailStatus.textContent = getStatusLabel(station.statusKey);
  }

  if (els.stationDetailType) {
    els.stationDetailType.textContent = stationType;
  }

  if (els.stationDetailName) {
    els.stationDetailName.textContent = station.name;
  }

  if (els.stationDetailAddress) {
    els.stationDetailAddress.textContent = station.address;
  }

  if (els.stationDetailCurrentType) {
    els.stationDetailCurrentType.textContent = getCurrentType(station);
  }

  if (els.stationDetailPorts) {
    els.stationDetailPorts.textContent = `${station.availableUnits}/${station.totalUnits} kha dung`;
  }

  if (els.stationDetailPricing) {
    els.stationDetailPricing.textContent = getStationPricing(station);
  }

  if (els.stationDetailStatusText) {
    els.stationDetailStatusText.textContent = getStatusLabel(station.statusKey);
  }

  if (els.stationDetailOpen247) {
    els.stationDetailOpen247.textContent = station.open24_7 ? "Co" : "Khong";
  }

  if (els.favoriteStationBtn) {
    const isFavorite = favoriteIds.has(station.id);
    els.favoriteStationBtn.classList.toggle("active", isFavorite);
    els.favoriteStationBtn.textContent = isFavorite ? "Da danh dau" : "Danh dau";
  }

  if (els.bookStationBtn) {
    const canBook = getStationChargingPoints(station).length > 0;
    els.bookStationBtn.disabled = !canBook;
    els.bookStationBtn.textContent = canBook ? "Dat lich" : "Chua ho tro";
  }

  if (els.nearbyStationList) {
    const nearbyStations = getNearbyStations(station);
    els.nearbyStationList.innerHTML = nearbyStations.length
      ? nearbyStations
          .map(
            (nearbyStation) => `
              <button class="nearby-station-item" type="button" data-nearby-station-id="${escapeHtml(
                nearbyStation.id
              )}">
                <strong>${escapeHtml(nearbyStation.name)}</strong>
                <span>${escapeHtml(nearbyStation.distanceKm)} km | ${escapeHtml(
                  getStatusLabel(nearbyStation.statusKey)
                )}</span>
              </button>
            `
          )
          .join("")
      : '<p class="detail-empty">Chua co tram lan can.</p>';

    els.nearbyStationList.querySelectorAll("[data-nearby-station-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const stationId = button.dataset.nearbyStationId;
        if (stationId) {
          focusStation(stationId);
        }
      });
    });
  }

  if (els.chargingPointList) {
    const points = getStationChargingPoints(station);
    els.chargingPointList.innerHTML = points.length
      ? points
          .map((point) => {
            const pointStatus = getChargingPointStatus(point);

            return `
              <article class="charging-point-card ${pointStatus.key}">
                <strong>${escapeHtml(point.code)}</strong>
                <span>${escapeHtml(point.connectorType)} | ${escapeHtml(point.powerKw)} kW</span>
                <small>${escapeHtml(pointStatus.label)}</small>
              </article>
            `;
          })
          .join("")
      : '<p class="detail-empty">Tram sac khong co cong sac.</p>';
  }
}

function closeStationDetail() {
  if (els.stationDetailPanel) {
    els.stationDetailPanel.classList.remove("open");
    els.stationDetailPanel.hidden = true;
  }
}

function getBookableChargingPoints(station) {
  return getStationChargingPoints(station).filter((point) => point.status !== "maintenance");
}

function getBookingStation() {
  return getStationById(state.selectedStationId);
}

function getBookingPoint() {
  const station = getBookingStation();
  if (!station) {
    return null;
  }

  return getBookableChargingPoints(station).find((point) => point.id === state.booking.pointId) || null;
}

function setBookingStatus(message, isError = false) {
  if (!els.bookingStatusInline) {
    return;
  }

  els.bookingStatusInline.textContent = message;
  els.bookingStatusInline.className = isError ? "status-box error" : "status-box";
}

function buildBookingSlots() {
  const durationHours = Number(els.bookingDuration?.value || 2);
  const slots = [];

  for (let hour = 6; hour <= 21; hour += 1) {
    const start = new Date(2026, 7, 6, hour, 0, 0, 0);
    const end = addHours(start, durationHours);

    if (end.getHours() > 23 || (end.getHours() === 23 && end.getMinutes() > 0)) {
      continue;
    }

    slots.push({
      start: toTimeString(start),
      end: toTimeString(end)
    });
  }

  return slots;
}

function updateBookingTimeInputs(startValue, endValue) {
  if (els.bookingStartTime) {
    els.bookingStartTime.value = startValue;
  }

  if (els.bookingEndTime) {
    els.bookingEndTime.value = endValue;
  }
}

function renderBookingPointList() {
  const station = getBookingStation();

  if (!station || !els.bookingPointList) {
    return;
  }

  const points = getStationChargingPoints(station);

  els.bookingPointList.innerHTML = points
    .map((point) => {
      const status = getChargingPointStatus(point);
      const isDisabled = point.status === "maintenance";
      const isActive = state.booking.pointId === point.id;

      return `
        <button class="booking-point-card ${status.key} ${isActive ? "active" : ""} ${
          isDisabled ? "maintenance" : ""
        }" type="button" data-booking-point-id="${escapeHtml(point.id)}" ${isDisabled ? "disabled" : ""}>
          <strong>${escapeHtml(point.code)}</strong>
          <span>${escapeHtml(point.connectorType)}</span>
          <small>${escapeHtml(status.label)}</small>
        </button>
      `;
    })
    .join("");

  els.bookingPointList.querySelectorAll("[data-booking-point-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.booking.pointId = button.dataset.bookingPointId || "";
      renderBookingPointList();
      setBookingStatus("Da chon cong sac. Tiep tuc chon ngay va khung gio.");
    });
  });
}

function renderBookingSlotList() {
  if (!els.bookingSlotList) {
    return;
  }

  const slots = buildBookingSlots();
  els.bookingSlotList.innerHTML = slots
    .map((slot) => {
      const isActive = state.booking.slotStart === slot.start && state.booking.slotEnd === slot.end;
      return `
        <button class="booking-slot-btn ${isActive ? "active" : ""}" type="button" data-slot-start="${slot.start}" data-slot-end="${slot.end}">
          <strong>${escapeHtml(slot.start)} - ${escapeHtml(slot.end)}</strong>
        </button>
      `;
    })
    .join("");

  els.bookingSlotList.querySelectorAll("[data-slot-start]").forEach((button) => {
    button.addEventListener("click", () => {
      state.booking.slotStart = button.dataset.slotStart || "";
      state.booking.slotEnd = button.dataset.slotEnd || "";
      updateBookingTimeInputs(state.booking.slotStart, state.booking.slotEnd);
      renderBookingSlotList();
      setBookingStatus("Da chon khung gio. Ban co the dieu chinh lai neu can.");
    });
  });
}

function resetBookingForm() {
  const today = new Date("2026-08-06T09:00:00+07:00");
  const defaultDate = formatDateForInput(today);

  state.booking.pointId = "";
  state.booking.slotStart = "";
  state.booking.slotEnd = "";
  state.booking.result = null;

  if (els.bookingDate) {
    els.bookingDate.min = defaultDate;
    els.bookingDate.value = defaultDate;
  }

  if (els.bookingDuration) {
    els.bookingDuration.value = "2";
  }

  updateBookingTimeInputs("", "");
  renderBookingPointList();
  renderBookingSlotList();
  setBookingStatus("Chon cong sac, ngay va khung gio de dat lich.");
}

function openBookingModal() {
  const station = getBookingStation();

  if (!station || !els.bookingModal) {
    return;
  }

  els.bookingModal.classList.add("open");
  els.bookingModal.setAttribute("aria-hidden", "false");
  els.bookingFormPanel.classList.add("active");
  els.bookingFormPanel.hidden = false;
  els.bookingSuccessPanel.classList.remove("active");
  els.bookingSuccessPanel.hidden = true;
  els.bookingResultStep.classList.remove("active");
  resetBookingForm();
}

function closeBookingModal() {
  if (!els.bookingModal) {
    return;
  }

  els.bookingModal.classList.remove("open");
  els.bookingModal.setAttribute("aria-hidden", "true");
}

function getBookingEstimate(point, durationHours) {
  const pricing = point.pricing || { pricePerKwh: 3500, pricePerMinute: 0 };
  const estimatedKwh = Math.round(point.powerKw * durationHours * 0.6 * 10) / 10;
  const energyCost = estimatedKwh * Number(pricing.pricePerKwh || 0);
  const minuteCost = durationHours * 60 * Number(pricing.pricePerMinute || 0);

  return {
    estimatedKwh,
    total: Math.round(energyCost + minuteCost),
    pricing
  };
}

function renderBookingSuccess(result) {
  if (!els.bookingFormPanel || !els.bookingSuccessPanel) {
    return;
  }

  els.bookingFormPanel.classList.remove("active");
  els.bookingFormPanel.hidden = true;
  els.bookingSuccessPanel.classList.add("active");
  els.bookingSuccessPanel.hidden = false;
  els.bookingResultStep.classList.add("active");

  if (els.bookingSummaryPoint) {
    els.bookingSummaryPoint.textContent = result.pointName;
  }
  if (els.bookingSummaryAddress) {
    els.bookingSummaryAddress.textContent = result.address;
  }
  if (els.bookingSummaryTime) {
    els.bookingSummaryTime.textContent = `${result.startTime} - ${result.endTime}`;
  }
  if (els.bookingSummaryDuration) {
    els.bookingSummaryDuration.textContent = `${result.durationHours} gio`;
  }
  if (els.bookingSummaryPrice) {
    els.bookingSummaryPrice.textContent = formatCurrency(result.pricePerKwh);
  }
  if (els.bookingSummaryMinutePrice) {
    els.bookingSummaryMinutePrice.textContent = formatCurrency(result.pricePerMinute * 60);
  }
  if (els.bookingSummaryEstimate) {
    els.bookingSummaryEstimate.textContent = formatCurrency(result.estimateTotal);
  }
  if (els.bookingSummaryCurrent) {
    els.bookingSummaryCurrent.textContent = result.currentType;
  }
  if (els.bookingSummaryCreatedAt) {
    els.bookingSummaryCreatedAt.textContent = result.createdAt;
  }
}

async function confirmBooking() {
  const station = getBookingStation();
  const point = getBookingPoint();
  const dateValue = els.bookingDate?.value || "";
  const startValue = els.bookingStartTime?.value || "";
  const endValue = els.bookingEndTime?.value || "";
  const durationHours = Number(els.bookingDuration?.value || 0);

  if (!station || !point) {
    setBookingStatus("Ban can chon cong sac truoc.", true);
    return;
  }

  if (!dateValue || !startValue || !endValue || !durationHours) {
    setBookingStatus("Vui long chon day du ngay, so gio va khung gio.", true);
    return;
  }

  const todayValue = formatDateForInput(new Date("2026-08-06T00:00:00+07:00"));
  if (dateValue < todayValue) {
    setBookingStatus("Khong the dat lich truoc ngay Thursday, August 6, 2026.", true);
    return;
  }

  const startDate = parseDateAndTime(dateValue, startValue);
  const endDate = parseDateAndTime(dateValue, endValue);

  if (!(startDate < endDate)) {
    setBookingStatus("Thoi gian ket thuc phai sau thoi gian bat dau.", true);
    return;
  }

  const profile = loadProfile();
  const estimate = getBookingEstimate(point, durationHours);
  setBookingStatus("Dang xu ly dat lich...");

  let createdAt = formatDateTimeDisplay(new Date().toISOString());

  if (isMongoObjectId(point.id) && localStorage.getItem(storageKeys.adminToken)) {
    try {
      const response = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(storageKeys.adminToken)}`
        },
        body: JSON.stringify({
          chargingPointId: point.id,
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          status: "pending",
          customer: {
            fullName: profile.fullName,
            phone: profile.phone === "Chua cap nhat" ? "0900000000" : profile.phone,
            email: profile.email
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Khong the dat lich");
      }

      createdAt = formatDateTimeDisplay(data.item?.createdAt || new Date().toISOString());
      addNotification(`Da tao booking cho ${station.name}.`);
    } catch (error) {
      setBookingStatus(error.message || "Khong the dat lich.", true);
      return;
    }
  } else {
    addNotification(`Da tao lich hen demo cho ${station.name}.`);
  }

  state.booking.result = {
    pointName: point.code,
    address: station.address,
    startTime: startValue,
    endTime: endValue,
    durationHours,
    pricePerKwh: estimate.pricing.pricePerKwh || 0,
    pricePerMinute: estimate.pricing.pricePerMinute || 0,
    estimateTotal: estimate.total,
    currentType: getCurrentType(station),
    createdAt
  };

  renderBookingSuccess(state.booking.result);
  setBookingStatus("Dat lich thanh cong.");
}

function setMapMessage(message, hidden = false) {
  if (!els.mapMessage) {
    return;
  }

  els.mapMessage.textContent = message;
  els.mapMessage.classList.toggle("hidden", hidden);
}

function setConnectionStatus(message) {
  if (els.mapConnectionStatus) {
    els.mapConnectionStatus.textContent = message;
  }
}

function addNotification(message) {
  state.notifications.unshift({
    id: `${Date.now()}-${Math.random()}`,
    message,
    createdAt: new Date()
  });

  state.notifications = state.notifications.slice(0, 6);
  renderNotifications();
}

function renderNotifications() {
  if (!els.notificationMenu) {
    return;
  }

  const items = state.notifications
    .map((item) => {
      const time = new Intl.DateTimeFormat(state.language === "vi" ? "vi-VN" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit"
      }).format(item.createdAt);

      return `<p>${escapeHtml(item.message)}<br><small>${escapeHtml(time)}</small></p>`;
    })
    .join("");

  els.notificationMenu.innerHTML = `<strong>${escapeHtml(getText("notifications"))}</strong>${
    items || `<p>${escapeHtml(getText("notificationEmpty"))}</p>`
  }`;
}

function loadProfile() {
  const adminProfile = localStorage.getItem(storageKeys.adminProfile);
  const publicProfile = localStorage.getItem(storageKeys.publicProfile);
  const baseProfile = {
    username: "admin",
    fullName: "Nguyen Ke Anh",
    email: "user@tramsac.local",
    phone: "Chua cap nhat",
    walletBalance: 56014355,
    description: "",
    address: "",
    landingPage: "map",
    role: "admin"
  };

  let localProfile = {};

  try {
    if (publicProfile) {
      localProfile = JSON.parse(publicProfile);
    }
  } catch {}

  try {
    if (adminProfile) {
      const parsed = JSON.parse(adminProfile);
      return {
        ...baseProfile,
        description: localProfile.description || baseProfile.description,
        address: localProfile.address || baseProfile.address,
        landingPage: localProfile.landingPage || baseProfile.landingPage,
        username: parsed.username || parsed.email?.split("@")[0] || baseProfile.username,
        fullName: parsed.fullName || parsed.email || baseProfile.fullName,
        email: parsed.email || baseProfile.email,
        phone: parsed.phone || baseProfile.phone,
        walletBalance: parsed.walletBalance || baseProfile.walletBalance,
        role: parsed.role || baseProfile.role
      };
    }
  } catch {}

  return { ...baseProfile, ...localProfile };
}

function saveProfile(profile) {
  localStorage.setItem(
    storageKeys.publicProfile,
    JSON.stringify({
      description: profile.description || "",
      address: profile.address || "",
      landingPage: profile.landingPage || "map"
    })
  );
}

function renderProfile() {
  const profile = loadProfile();
  const fullName = profile.fullName || profile.email || "Nguoi dung";
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase() || "")
    .join("") || "TS";

  if (els.avatarInitials) {
    els.avatarInitials.textContent = initials;
  }

  if (els.profileName) {
    els.profileName.textContent = fullName;
  }

  if (els.profileWallet) {
    els.profileWallet.textContent = `So du: ${formatCurrency(profile.walletBalance)} VND`;
  }

  if (els.profileMenuName) {
    els.profileMenuName.textContent = fullName;
  }

  if (els.profileUsername) {
    els.profileUsername.value = profile.username || profile.email.split("@")[0];
  }

  if (els.profileFullName) {
    els.profileFullName.value = profile.fullName;
  }

  if (els.profileEmail) {
    els.profileEmail.value = profile.email;
  }

  if (els.profilePhone) {
    els.profilePhone.value = profile.phone;
  }

  if (els.profileDescription) {
    els.profileDescription.value = profile.description || "";
  }

  if (els.profileAddress) {
    els.profileAddress.value = profile.address || "";
  }

  if (els.profileLandingPage) {
    els.profileLandingPage.value = profile.landingPage || "map";
  }

  if (els.profileRoleValue) {
    els.profileRoleValue.textContent = profile.role || "admin";
  }

  if (els.profileWalletValue) {
    els.profileWalletValue.textContent = `${formatCurrency(profile.walletBalance)} VND`;
  }

  if (els.profileLanguageValue) {
    els.profileLanguageValue.textContent = state.language.toUpperCase();
  }

  if (els.profileThemeValue) {
    els.profileThemeValue.textContent = state.theme === "dark" ? "Dark" : "Light";
  }

  if (els.profileVisibleStationsValue) {
    els.profileVisibleStationsValue.textContent = String(state.filteredStations.length || 0);
  }

  if (els.profileDeviceValue) {
    els.profileDeviceValue.textContent = window.innerWidth <= 820 ? "Mobile" : "Desktop";
  }
}

function applyTheme() {
  els.body.classList.toggle("theme-dark", state.theme === "dark");
  if (els.themeLabel) {
    els.themeLabel.textContent = state.theme === "dark" ? "Dark" : "Light";
  }
  localStorage.setItem(storageKeys.theme, state.theme);
}

function setButtonLabels() {
  if (els.searchToggle) {
    els.searchToggle.textContent = getText("searchButton");
  }

  if (els.notificationToggle) {
    els.notificationToggle.textContent = getText("bellButton");
  }

  if (els.sidebarToggle) {
    els.sidebarToggle.textContent = getText("menuButton");
  }
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    element.textContent = getText(key);
  });

  if (els.stationType) {
    els.stationType.options[0].text = getText("all");
    els.stationType.options[1].text = getText("charging");
  }

  [els.cityFilter, els.districtFilter, els.connectorTypeFilter].forEach((select) => {
    if (select?.options[0]) {
      select.options[0].text = getText("all");
    }
  });

  if (els.statusFilterList) {
    const statusLabels = {
      all: "all",
      ready: "statusReady",
      full: "statusFull",
      maintenance: "statusMaintenance",
      inactive: "statusInactive",
      closed: "statusClosed"
    };

    els.statusFilterList.querySelectorAll("[data-status-label]").forEach((label) => {
      label.textContent = getText(statusLabels[label.dataset.statusLabel] || "all");
    });
  }

  if (els.headerSearch) {
    els.headerSearch.placeholder = getText("searchPlaceholder");
  }

  if (els.stationSearch) {
    els.stationSearch.placeholder = getText("filterPlaceholder");
  }

  if (els.locateMeBtn) {
    els.locateMeBtn.textContent = getText("locate");
  }

  if (els.refreshMapBtn) {
    els.refreshMapBtn.textContent = getText("refresh");
  }

  if (els.profileAction) {
    els.profileAction.textContent = getText("profile");
  }

  if (els.logoutAction) {
    els.logoutAction.textContent = getText("logout");
  }

  if (els.saveProfileBtn) {
    els.saveProfileBtn.textContent = getText("save");
  }

  if (els.cancelProfileBtn) {
    els.cancelProfileBtn.textContent = getText("cancel");
  }

  if (els.languageToggle) {
    els.languageToggle.textContent = state.language.toUpperCase();
  }

  setButtonLabels();
  renderNotifications();
}

function createTileLayer() {
  if (!appConfig.locationiqKey) {
    return null;
  }

  return L.tileLayer(
    `https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${encodeURIComponent(
      appConfig.locationiqKey
    )}`,
    {
      attribution: '&copy; <a href="https://www.locationiq.com/">LocationIQ</a> &copy; OpenStreetMap contributors',
      maxZoom: 19
    }
  );
}

function initializeMap() {
  state.map = L.map("map", {
    zoomControl: true
  }).setView([21.0285, 105.8542], 12);

  state.tileLayer = createTileLayer();

  if (state.tileLayer) {
    state.tileLayer.addTo(state.map);
    setConnectionStatus(getText("connecting"));
  } else {
    setMapMessage(getText("noKey"));
    setConnectionStatus(getText("noKey"));
  }
}

function normalizeChargingStation(item) {
  const points = Array.isArray(item.matchingChargingPoints) ? item.matchingChargingPoints : [];
  const chargingPoints = points.map((point) => ({
    id: point.id || point._id,
    code: point.code,
    connectorType: point.connectorType,
    powerKw: Number(point.powerKw || 0),
    status: point.status,
    pricing: point.pricing || null
  }));
  const totalPower = points.reduce((sum, point) => sum + Number(point.powerKw || 0), 0);
  const availableUnits = Number(item.availableChargingPoints || 0);
  const totalUnits = Number(item.totalChargingPoints || 0);
  const addressParts = splitAddress(item.address);

  return {
    id: item.id || item._id,
    type: "charging",
    name: item.name,
    address: item.address,
    lat: item.location?.lat,
    lng: item.location?.lng,
    status: item.status,
    statusKey: deriveStationStatus(item.status, availableUnits, totalUnits),
    city: item.city || addressParts.city,
    district: item.district || addressParts.district,
    open24_7: Boolean(item.open24_7),
    availableUnits,
    totalUnits,
    powerKw: totalPower,
    chargingPoints,
    connectorTypes: [...new Set(points.map((point) => point.connectorType).filter(Boolean))],
    detail: points
      .map((point) => `${point.code} | ${point.connectorType} | ${point.powerKw}kW`)
      .slice(0, 3)
      .join(" | ")
  };
}

async function fetchStations() {
  const chargingResponse = await fetch("/api/stations?limit=50");

  if (!chargingResponse.ok) {
    throw new Error("Khong the dong bo du lieu tram.");
  }

  const chargingData = await chargingResponse.json();

  return (Array.isArray(chargingData.items) ? chargingData.items.map(normalizeChargingStation) : [])
    .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng));
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((left, right) =>
    String(left).localeCompare(String(right), state.language)
  );
}

function setSelectOptions(select, values, selectedValue = "all") {
  if (!select) {
    return;
  }

  select.innerHTML = `<option value="all">${escapeHtml(getText("all"))}</option>${values
    .map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
    .join("")}`;

  select.value = values.includes(selectedValue) ? selectedValue : "all";
}

function populateDistrictOptions(city, selectedDistrict = "all") {
  const districts = uniqueSorted(
    state.stations
      .filter((station) => city === "all" || station.city === city)
      .map((station) => station.district)
  );

  setSelectOptions(els.districtFilter, districts, selectedDistrict);
}

function populateFilterOptions() {
  const selectedCity = els.cityFilter?.value || "all";
  const selectedDistrict = els.districtFilter?.value || "all";
  const selectedConnector = els.connectorTypeFilter?.value || "all";

  setSelectOptions(
    els.cityFilter,
    uniqueSorted(state.stations.map((station) => station.city)),
    selectedCity
  );
  populateDistrictOptions(els.cityFilter?.value || "all", selectedDistrict);
  setSelectOptions(
    els.connectorTypeFilter,
    uniqueSorted(state.stations.flatMap((station) => station.connectorTypes || [])),
    selectedConnector
  );
}

function getFilteredStations() {
  const query = (els.stationSearch?.value || "").trim().toLowerCase();
  const type = els.stationType?.value || "all";
  const city = els.cityFilter?.value || "all";
  const district = els.districtFilter?.value || "all";
  const connectorType = els.connectorTypeFilter?.value || "all";

  return state.stations.filter((station) => {
    const matchesQuery =
      !query ||
      `${station.name} ${station.address} ${station.detail}`.toLowerCase().includes(query);
    const matchesType = type === "all" || station.type === type;
    const matchesCity = city === "all" || station.city === city;
    const matchesDistrict = district === "all" || station.district === district;
    const matchesConnector =
      connectorType === "all" ||
      (station.connectorTypes || []).includes(connectorType);
    const matchesStatus =
      state.statusFilter === "all" || station.statusKey === state.statusFilter;

    return (
      matchesQuery &&
      matchesType &&
      matchesCity &&
      matchesDistrict &&
      matchesConnector &&
      matchesStatus
    );
  });
}

function buildPopupHtml(station) {
  const badgeClass = "";
  const unitLabel = "cong sac";
  const statusClass = getStatusClass(station.statusKey);

  return `
    <div class="popup-card">
      <strong>${escapeHtml(station.name)}</strong>
      <p>${escapeHtml(station.address)}</p>
      <p><span class="station-badge ${badgeClass}">${escapeHtml(getText("charging"))}</span></p>
      <p><span class="station-status-badge ${statusClass}">${escapeHtml(
        getStatusLabel(station.statusKey)
      )}</span></p>
      <p>${escapeHtml(station.availableUnits)}/${escapeHtml(station.totalUnits)} ${escapeHtml(
        unitLabel
      )}</p>
      <p>${escapeHtml(station.detail || "--")}</p>
    </div>
  `;
}

function clearMarkers() {
  state.markers.forEach((marker) => marker.remove());
  state.markers.clear();
}

function focusStation(stationId, zoom = 15) {
  const station = state.filteredStations.find((item) => item.id === stationId);
  const marker = state.markers.get(stationId);

  if (!station || !marker || !state.map) {
    return;
  }

  state.selectedStationId = stationId;
  state.map.flyTo([station.lat, station.lng], zoom, { duration: 0.8 });
  marker.openPopup();
  renderStationList();
  renderStationDetail();
}

function renderMarkers() {
  clearMarkers();

  state.filteredStations.forEach((station) => {
    const marker = L.marker([station.lat, station.lng], {
      icon: L.divIcon({
        className: "",
        html: `<div class="marker-pin ${getStatusClass(station.statusKey)}"><span>EV</span></div>`,
        iconSize: [30, 30],
        iconAnchor: [14, 30],
        popupAnchor: [0, -24]
      })
    })
      .addTo(state.map)
      .bindPopup(buildPopupHtml(station));

    marker.on("click", () => {
      state.selectedStationId = station.id;
      renderStationList();
      renderStationDetail();
    });

    state.markers.set(station.id, marker);
  });
}

function renderStationList() {
  if (!els.stationList) {
    return;
  }

  if (els.resultsCount) {
    els.resultsCount.textContent = String(state.filteredStations.length);
  }

  if (els.resultsTitle) {
    const currentType = els.stationType?.value || "all";
    els.resultsTitle.textContent =
      currentType === "charging" ? getText("listTitleCharging") : getText("listTitleAll");
  }

  if (!state.filteredStations.length) {
    els.stationList.innerHTML = `<div class="station-card"><p>${escapeHtml(getText("empty"))}</p></div>`;
    return;
  }

  els.stationList.innerHTML = state.filteredStations
    .map((station) => {
      const isSelected = station.id === state.selectedStationId;
      const typeLabel = getText("charging");
      const typeClass = "";
      const statusClass = getStatusClass(station.statusKey);

      return `
        <article class="station-card ${isSelected ? "selected" : ""}" data-station-id="${escapeHtml(
          station.id
        )}">
          <div class="station-card-head">
            <strong>${escapeHtml(station.name)}</strong>
            <div class="station-badge-group">
              <span class="station-badge ${typeClass}">${escapeHtml(typeLabel)}</span>
              <span class="station-status-badge ${statusClass}">${escapeHtml(
                getStatusLabel(station.statusKey)
              )}</span>
            </div>
          </div>
          <p>${escapeHtml(station.address)}</p>
          <p>${escapeHtml(station.availableUnits)}/${escapeHtml(station.totalUnits)} point | ${escapeHtml(station.powerKw)} kW</p>
          <p>${escapeHtml(station.detail || "--")}</p>
        </article>
      `;
    })
    .join("");

  els.stationList.querySelectorAll("[data-station-id]").forEach((card) => {
    card.addEventListener("click", () => {
      const stationId = card.dataset.stationId;
      if (stationId) {
        focusStation(stationId);
      }
    });
  });
}

function renderStats() {
  const stationCount = state.filteredStations.length;
  const availablePointCount = state.filteredStations.reduce(
    (sum, station) => sum + Number(station.availableUnits || 0),
    0
  );
  const totalPower = state.filteredStations.reduce(
    (sum, station) => sum + Number(station.powerKw || 0),
    0
  );

  if (els.stationCount) {
    els.stationCount.textContent = String(stationCount);
  }

  if (els.availablePointCount) {
    els.availablePointCount.textContent = String(availablePointCount);
  }

  if (els.totalPower) {
    els.totalPower.textContent = `${totalPower} kW`;
  }
}

function fitMapToStations() {
  if (!state.map || !state.filteredStations.length) {
    return;
  }

  const bounds = L.latLngBounds(state.filteredStations.map((station) => [station.lat, station.lng]));
  state.map.fitBounds(bounds.pad(0.16));
}

function applyFilters(options = {}) {
  state.filteredStations = getFilteredStations();

  if (!state.filteredStations.find((item) => item.id === state.selectedStationId)) {
    state.selectedStationId = state.filteredStations[0]?.id || "";
  }

  renderMarkers();
  renderStationList();
  renderStats();
  renderProfile();

  if (els.stationDetailPanel?.classList.contains("open") && state.selectedStationId) {
    renderStationDetail();
  }

  if (!options.preserveView) {
    fitMapToStations();
  }
}

async function hydrateStations() {
  try {
    setMapMessage(getText("mapLoading"));
    setConnectionStatus(getText("connecting"));
    state.stations = await fetchStations();

    if (!state.stations.length) {
      state.stations = fallbackStations;
      addNotification("Dang hien thi du lieu mau vi chua co ban ghi trong he thong.");
    } else {
      addNotification(`Da tai ${state.stations.length} diem tram tu he thong.`);
    }

    populateFilterOptions();
    applyFilters();
    setConnectionStatus(getText("connected"));
    setMapMessage(getText("mapReady"), true);
  } catch (error) {
    state.stations = fallbackStations;
    populateFilterOptions();
    applyFilters();
    setConnectionStatus("Dang hien thi du lieu mau.");
    setMapMessage(error.message || "Khong the tai du lieu.", false);
    addNotification("Khong ket noi duoc API, da chuyen sang du lieu mau.");
  }
}

function toggleMenu(menu, open) {
  if (!menu) {
    return;
  }

  menu.classList.toggle("open", open);
}

function closeFloatingMenus() {
  toggleMenu(els.notificationMenu, false);
  toggleMenu(els.profileMenu, false);
}

function activateProfileTab(tab) {
  const panelId = tab === "stats" ? "profilePanelStats" : "profilePanelBasic";

  els.profileTabs.forEach((button) => {
    const isActive = button.dataset.tab === tab;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  els.profilePanels.forEach((panel) => {
    const isActive = panel.id === panelId;
    panel.classList.toggle("active", isActive);
    panel.hidden = !isActive;
  });
}

function openProfileModal() {
  if (els.profileModal) {
    els.profileModal.classList.add("open");
    els.profileModal.setAttribute("aria-hidden", "false");
  }

  activateProfileTab("basic");
  renderProfile();
}

function closeProfileModal() {
  if (els.profileModal) {
    els.profileModal.classList.remove("open");
    els.profileModal.setAttribute("aria-hidden", "true");
  }
}

function syncSearchInputs(value) {
  if (els.headerSearch && els.headerSearch.value !== value) {
    els.headerSearch.value = value;
  }

  if (els.stationSearch && els.stationSearch.value !== value) {
    els.stationSearch.value = value;
  }
}

function bindEvents() {
  if (els.sidebarToggle) {
    els.sidebarToggle.addEventListener("click", () => {
      if (window.innerWidth <= 820) {
        els.body.classList.toggle("sidebar-open");
      } else {
        els.body.classList.toggle("sidebar-collapsed");
      }
    });
  }

  if (els.themeToggle) {
    els.themeToggle.addEventListener("click", () => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      applyTheme();
    });
  }

  if (els.languageToggle) {
    els.languageToggle.addEventListener("click", () => {
      state.language = state.language === "vi" ? "en" : "vi";
      localStorage.setItem(storageKeys.language, state.language);
      applyTranslations();
      renderProfile();
      applyFilters({ preserveView: true });
    });
  }

  if (els.searchToggle && els.headerSearchWrap) {
    els.searchToggle.addEventListener("click", () => {
      els.headerSearchWrap.classList.toggle("open");
      if (els.headerSearchWrap.classList.contains("open")) {
        els.headerSearch?.focus();
      }
    });
  }

  if (els.headerSearch) {
    els.headerSearch.addEventListener("input", () => {
      syncSearchInputs(els.headerSearch.value);
      applyFilters({ preserveView: true });
    });
  }

  if (els.stationSearch) {
    els.stationSearch.addEventListener("input", () => {
      syncSearchInputs(els.stationSearch.value);
      applyFilters({ preserveView: true });
    });
  }

  if (els.stationType) {
    els.stationType.addEventListener("change", () => {
      applyFilters();
    });
  }

  if (els.cityFilter) {
    els.cityFilter.addEventListener("change", () => {
      populateDistrictOptions(els.cityFilter.value);
      applyFilters();
    });
  }

  if (els.districtFilter) {
    els.districtFilter.addEventListener("change", () => {
      applyFilters();
    });
  }

  if (els.connectorTypeFilter) {
    els.connectorTypeFilter.addEventListener("change", () => {
      applyFilters();
    });
  }

  if (els.statusFilterList) {
    els.statusFilterList.querySelectorAll(".status-filter-btn").forEach((button) => {
      button.addEventListener("click", () => {
        state.statusFilter = button.dataset.status || "all";
        els.statusFilterList.querySelectorAll(".status-filter-btn").forEach((item) => {
          item.classList.toggle("active", item === button);
        });
        applyFilters();
      });
    });
  }

  if (els.closeStationDetail) {
    els.closeStationDetail.addEventListener("click", closeStationDetail);
  }

  if (els.favoriteStationBtn) {
    els.favoriteStationBtn.addEventListener("click", () => {
      const station = getStationById(state.selectedStationId);

      if (!station) {
        return;
      }

      const favoriteIds = getFavoriteStationIds();

      if (favoriteIds.has(station.id)) {
        favoriteIds.delete(station.id);
        addNotification(`Da bo danh dau ${station.name}.`);
      } else {
        favoriteIds.add(station.id);
        addNotification(`Da danh dau ${station.name}.`);
      }

      saveFavoriteStationIds(favoriteIds);
      renderStationDetail();
    });
  }

  if (els.bookStationBtn) {
    els.bookStationBtn.addEventListener("click", openBookingModal);
  }

  if (els.uploadStationImageBtn && els.stationImageInput) {
    els.uploadStationImageBtn.addEventListener("click", () => {
      els.stationImageInput.click();
    });

    els.stationImageInput.addEventListener("change", () => {
      const station = getStationById(state.selectedStationId);
      const file = els.stationImageInput.files?.[0];

      if (!station || !file) {
        return;
      }

      if (!file.type.startsWith("image/") || file.size > 1024 * 1024) {
        addNotification("Chi ho tro anh duoi 1 MB.");
        els.stationImageInput.value = "";
        return;
      }

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const stationImages = getStationImages();
        stationImages[station.id] = String(reader.result || "");
        saveStationImages(stationImages);
        els.stationImageInput.value = "";
        renderStationDetail();
        addNotification(`Da cap nhat anh cho ${station.name}.`);
      });
      reader.readAsDataURL(file);
    });
  }

  if (els.directionsBtn) {
    els.directionsBtn.addEventListener("click", () => {
      const station = getStationById(state.selectedStationId);

      if (!station) {
        return;
      }

      const destination = encodeURIComponent(`${station.lat},${station.lng}`);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, "_blank");
    });
  }

  if (els.closeBookingModal) {
    els.closeBookingModal.addEventListener("click", closeBookingModal);
  }

  if (els.bookingModal) {
    els.bookingModal.addEventListener("click", (event) => {
      if (event.target === els.bookingModal) {
        closeBookingModal();
      }
    });
  }

  if (els.bookingDuration) {
    els.bookingDuration.addEventListener("change", () => {
      state.booking.slotStart = "";
      state.booking.slotEnd = "";
      updateBookingTimeInputs("", "");
      renderBookingSlotList();
      setBookingStatus("Da cap nhat so gio sac. Vui long chon lai khung gio.");
    });
  }

  if (els.bookingStartTime) {
    els.bookingStartTime.addEventListener("change", () => {
      if (!els.bookingDate?.value || !els.bookingStartTime.value || !els.bookingDuration?.value) {
        return;
      }

      const startDate = parseDateAndTime(els.bookingDate.value, els.bookingStartTime.value);
      const endDate = addHours(startDate, Number(els.bookingDuration.value));
      state.booking.slotStart = els.bookingStartTime.value;
      state.booking.slotEnd = toTimeString(endDate);
      if (els.bookingEndTime) {
        els.bookingEndTime.value = state.booking.slotEnd;
      }
      renderBookingSlotList();
    });
  }

  if (els.bookingEndTime) {
    els.bookingEndTime.addEventListener("change", () => {
      state.booking.slotEnd = els.bookingEndTime.value;
    });
  }

  if (els.bookingConfirmBtn) {
    els.bookingConfirmBtn.addEventListener("click", confirmBooking);
  }

  if (els.bookingBackBtn) {
    els.bookingBackBtn.addEventListener("click", closeBookingModal);
  }

  if (els.bookingNewBtn) {
    els.bookingNewBtn.addEventListener("click", () => {
      els.bookingResultStep.classList.remove("active");
      els.bookingSuccessPanel.classList.remove("active");
      els.bookingSuccessPanel.hidden = true;
      els.bookingFormPanel.classList.add("active");
      els.bookingFormPanel.hidden = false;
      resetBookingForm();
    });
  }

  if (els.refreshMapBtn) {
    els.refreshMapBtn.addEventListener("click", hydrateStations);
  }

  if (els.locateMeBtn) {
    els.locateMeBtn.addEventListener("click", () => {
      if (!navigator.geolocation) {
        addNotification("Trinh duyet khong ho tro geolocation.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = [position.coords.latitude, position.coords.longitude];

          if (state.userMarker) {
            state.userMarker.remove();
          }

          state.userMarker = L.circleMarker(coords, {
            radius: 8,
            weight: 3,
            color: "#1d4ed8",
            fillColor: "#60a5fa",
            fillOpacity: 0.9
          })
            .addTo(state.map)
            .bindPopup("Vi tri cua ban");

          state.map.flyTo(coords, 14, { duration: 0.8 });
          addNotification("Da cap nhat vi tri hien tai cua ban tren ban do.");
        },
        () => {
          addNotification("Khong lay duoc vi tri hien tai.");
        }
      );
    });
  }

  if (els.notificationToggle) {
    els.notificationToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const shouldOpen = !els.notificationMenu.classList.contains("open");
      closeFloatingMenus();
      toggleMenu(els.notificationMenu, shouldOpen);
    });
  }

  if (els.profileToggle) {
    els.profileToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const shouldOpen = !els.profileMenu.classList.contains("open");
      closeFloatingMenus();
      toggleMenu(els.profileMenu, shouldOpen);
    });
  }

  if (els.profileAction) {
    els.profileAction.addEventListener("click", () => {
      closeFloatingMenus();
      openProfileModal();
    });
  }

  if (els.logoutAction) {
    els.logoutAction.addEventListener("click", () => {
      localStorage.removeItem(storageKeys.adminToken);
      localStorage.removeItem(storageKeys.adminProfile);
      localStorage.removeItem(storageKeys.publicProfile);
      closeFloatingMenus();
      window.location.href = "/admin/login";
    });
  }

  if (els.closeProfileModal) {
    els.closeProfileModal.addEventListener("click", closeProfileModal);
  }

  if (els.cancelProfileBtn) {
    els.cancelProfileBtn.addEventListener("click", closeProfileModal);
  }

  if (els.saveProfileBtn) {
    els.saveProfileBtn.addEventListener("click", () => {
      const current = loadProfile();
      const nextProfile = {
        ...current,
        username: els.profileUsername?.value.trim() || current.username,
        fullName: els.profileFullName?.value.trim() || current.fullName,
        email: els.profileEmail?.value.trim() || current.email,
        phone: els.profilePhone?.value.trim() || current.phone,
        description: els.profileDescription?.value.trim() || "",
        address: els.profileAddress?.value.trim() || "",
        landingPage: els.profileLandingPage?.value || "map"
      };

      saveProfile(nextProfile);
      renderProfile();
      closeProfileModal();
      addNotification("Da cap nhat thong tin ca nhan.");
    });
  }

  els.profileTabs.forEach((button) => {
    button.addEventListener("click", () => {
      activateProfileTab(button.dataset.tab || "basic");
    });
  });

  if (els.profileModal) {
    els.profileModal.addEventListener("click", (event) => {
      if (event.target === els.profileModal) {
        closeProfileModal();
      }
    });
  }

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (
      target instanceof Element &&
      !target.closest(".header-menu-wrap") &&
      !target.closest(".profile-wrap")
    ) {
      closeFloatingMenus();
    }
  });

  els.navItems.forEach((item) => {
    item.addEventListener("click", (event) => {
      if (item.tagName === "A") {
        return;
      }

      const view = item.dataset.view || "map";

      els.navItems.forEach((navItem) => navItem.classList.remove("active"));
      item.classList.add("active");

      if (view === "stations" && els.stationType) {
        els.stationType.value = "charging";
        applyFilters();
      } else if (view === "notifications") {
        event.preventDefault();
        const shouldOpen = !els.notificationMenu.classList.contains("open");
        closeFloatingMenus();
        toggleMenu(els.notificationMenu, shouldOpen);
      } else if (view === "map" && els.stationType) {
        els.stationType.value = "all";
        applyFilters();
      }
    });
  });
}

function bootstrap() {
  const initialView = window.TRAM_SAC_CONFIG?.initialView || "map";

  if (els.stationType) {
    if (initialView === "stations") {
      els.stationType.value = "charging";
    }
  }

  applyTheme();
  renderProfile();
  renderNotifications();
  applyTranslations();
  initializeMap();
  bindEvents();
  hydrateStations();
}

window.addEventListener("tram-sac:navigation", (event) => {
  const view = event.detail?.view;

  if (!els.stationType) {
    return;
  }

  if (view === "stations") {
    els.stationType.value = "charging";
    applyFilters();
  } else if (view === "map") {
    els.stationType.value = "all";
    applyFilters();
  }
});

bootstrap();
