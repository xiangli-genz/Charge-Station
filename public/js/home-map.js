const appConfig = window.TRAM_SAC_CONFIG || {};
const storageKeys = {
  theme: "tram_sac_theme",
  language: "tram_sac_language",
  publicProfile: "tram_sac_public_profile",
  adminProfile: "tram_sac_admin_profile",
  adminToken: "tram_sac_admin_token"
};

const translations = {
  vi: {
    map: "Ban do",
    stations: "Tram sac",
    swap: "Tram doi pin",
    notifications: "Thong bao",
    admin: "Quan tri admin",
    eyebrow: "BAN DO TRAM SAC",
    title: "Tim tram sac gan ban",
    searchLabel: "Tim kiem",
    typeLabel: "Loai tram",
    availabilityLabel: "Trang thai",
    statStations: "Tram dang hien thi",
    statPoints: "Cong sac kha dung",
    statPower: "Tong cong suat",
    nearby: "DIEM GAN BAN",
    locate: "Vi tri cua toi",
    refresh: "Lam moi",
    all: "Tat ca",
    charging: "Tram sac",
    swapOnly: "Tram doi pin",
    available: "Con cho",
    maintenance: "Bao tri",
    listTitleAll: "Danh sach tram",
    listTitleCharging: "Danh sach tram sac",
    listTitleSwap: "Danh sach tram doi pin",
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
    swap: "Battery Swap",
    notifications: "Notifications",
    admin: "Admin Panel",
    eyebrow: "CHARGING MAP",
    title: "Find nearby charging points",
    searchLabel: "Search",
    typeLabel: "Station type",
    availabilityLabel: "Availability",
    statStations: "Visible stations",
    statPoints: "Available points",
    statPower: "Total power",
    nearby: "NEARBY",
    locate: "My location",
    refresh: "Refresh",
    all: "All",
    charging: "Charging",
    swapOnly: "Swap",
    available: "Available",
    maintenance: "Maintenance",
    listTitleAll: "Station list",
    listTitleCharging: "Charging stations",
    listTitleSwap: "Swap stations",
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
    availableUnits: 4,
    totalUnits: 8,
    powerKw: 240,
    detail: "CCS2"
  },
  {
    id: "demo-sw-1",
    type: "swap",
    name: "Tram Doi Pin VinFast Tay Ho",
    address: "Xuan Dieu, Tay Ho, Ha Noi",
    lat: 21.0665,
    lng: 105.8304,
    status: "active",
    availableUnits: 12,
    totalUnits: 20,
    powerKw: 0,
    detail: "VinFast | Evo200, Feliz S"
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
  stationType: document.getElementById("stationType"),
  availabilityFilter: document.getElementById("availabilityFilter"),
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
  profileUsername: document.getElementById("profileUsername"),
  profileFullName: document.getElementById("profileFullName"),
  profileEmail: document.getElementById("profileEmail"),
  profilePhone: document.getElementById("profilePhone"),
  navItems: Array.from(document.querySelectorAll(".nav-item"))
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
  notifications: []
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
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
    fullName: "Nguyen Ke Anh",
    email: "user@tramsac.local",
    phone: "Chua cap nhat",
    walletBalance: 56014355
  };

  try {
    if (publicProfile) {
      return { ...baseProfile, ...JSON.parse(publicProfile) };
    }
  } catch {}

  try {
    if (adminProfile) {
      const parsed = JSON.parse(adminProfile);
      return {
        ...baseProfile,
        fullName: parsed.fullName || parsed.email || baseProfile.fullName,
        email: parsed.email || baseProfile.email,
        phone: parsed.phone || baseProfile.phone,
        walletBalance: parsed.walletBalance || baseProfile.walletBalance
      };
    }
  } catch {}

  return baseProfile;
}

function saveProfile(profile) {
  localStorage.setItem(storageKeys.publicProfile, JSON.stringify(profile));
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
    els.profileUsername.value = profile.email.split("@")[0];
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
    els.stationType.options[2].text = getText("swapOnly");
  }

  if (els.availabilityFilter) {
    els.availabilityFilter.options[0].text = getText("all");
    els.availabilityFilter.options[1].text = getText("available");
    els.availabilityFilter.options[2].text = getText("maintenance");
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
  const totalPower = points.reduce((sum, point) => sum + Number(point.powerKw || 0), 0);

  return {
    id: item.id || item._id,
    type: "charging",
    name: item.name,
    address: item.address,
    lat: item.location?.lat,
    lng: item.location?.lng,
    status: item.status,
    availableUnits: Number(item.availableChargingPoints || 0),
    totalUnits: Number(item.totalChargingPoints || 0),
    powerKw: totalPower,
    detail: points.map((point) => `${point.code} | ${point.connectorType} | ${point.powerKw}kW`).slice(0, 3).join(" | ")
  };
}

function normalizeSwapStation(item) {
  return {
    id: item.id || item._id,
    type: "swap",
    name: item.name,
    address: item.address,
    lat: item.location?.lat,
    lng: item.location?.lng,
    status: item.status,
    availableUnits: Number(item.availableBatterySlots || 0),
    totalUnits: Number(item.totalBatterySlots || 0),
    powerKw: 0,
    detail: `${item.provider || "VinFast"} | ${(item.supportedVehicleModels || []).join(", ")}`
  };
}

async function fetchStations() {
  const [chargingResponse, swapResponse] = await Promise.all([
    fetch("/api/stations?limit=50"),
    fetch("/api/swap-stations?limit=50")
  ]);

  if (!chargingResponse.ok || !swapResponse.ok) {
    throw new Error("Khong the dong bo du lieu tram.");
  }

  const chargingData = await chargingResponse.json();
  const swapData = await swapResponse.json();

  return [
    ...(Array.isArray(chargingData.items) ? chargingData.items.map(normalizeChargingStation) : []),
    ...(Array.isArray(swapData.items) ? swapData.items.map(normalizeSwapStation) : [])
  ].filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng));
}

function getFilteredStations() {
  const query = (els.stationSearch?.value || "").trim().toLowerCase();
  const type = els.stationType?.value || "all";
  const availability = els.availabilityFilter?.value || "all";

  return state.stations.filter((station) => {
    const matchesQuery =
      !query ||
      `${station.name} ${station.address} ${station.detail}`.toLowerCase().includes(query);
    const matchesType = type === "all" || station.type === type;
    const matchesAvailability =
      availability === "all" ||
      (availability === "available" && station.availableUnits > 0) ||
      (availability === "maintenance" && station.status === "maintenance");

    return matchesQuery && matchesType && matchesAvailability;
  });
}

function buildPopupHtml(station) {
  const badgeClass = station.type === "swap" ? "swap" : "";
  const unitLabel = station.type === "swap" ? "o pin" : "cong sac";

  return `
    <div class="popup-card">
      <strong>${escapeHtml(station.name)}</strong>
      <p>${escapeHtml(station.address)}</p>
      <p><span class="station-badge ${badgeClass}">${escapeHtml(
        station.type === "swap" ? getText("swapOnly") : getText("charging")
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
}

function renderMarkers() {
  clearMarkers();

  state.filteredStations.forEach((station) => {
    const marker = L.marker([station.lat, station.lng], {
      icon: L.divIcon({
        className: "",
        html: `<div class="marker-pin ${station.type === "swap" ? "swap" : ""}"><span>${
          station.type === "swap" ? "SW" : "EV"
        }</span></div>`,
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
      currentType === "charging"
        ? getText("listTitleCharging")
        : currentType === "swap"
          ? getText("listTitleSwap")
          : getText("listTitleAll");
  }

  if (!state.filteredStations.length) {
    els.stationList.innerHTML = `<div class="station-card"><p>${escapeHtml(getText("empty"))}</p></div>`;
    return;
  }

  els.stationList.innerHTML = state.filteredStations
    .map((station) => {
      const isSelected = station.id === state.selectedStationId;
      const typeLabel = station.type === "swap" ? getText("swapOnly") : getText("charging");
      const typeClass = station.type === "swap" ? "swap" : "";

      return `
        <article class="station-card ${isSelected ? "selected" : ""}" data-station-id="${escapeHtml(
          station.id
        )}">
          <div class="station-card-head">
            <strong>${escapeHtml(station.name)}</strong>
            <span class="station-badge ${typeClass}">${escapeHtml(typeLabel)}</span>
          </div>
          <p>${escapeHtml(station.address)}</p>
          <p>${escapeHtml(station.availableUnits)}/${escapeHtml(station.totalUnits)} ${
            station.type === "swap" ? "slot" : "point"
          } | ${escapeHtml(station.powerKw)} kW</p>
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

    applyFilters();
    setConnectionStatus(getText("connected"));
    setMapMessage(getText("mapReady"), true);
  } catch (error) {
    state.stations = fallbackStations;
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

function openProfileModal() {
  if (els.profileModal) {
    els.profileModal.classList.add("open");
    els.profileModal.setAttribute("aria-hidden", "false");
  }
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

  if (els.availabilityFilter) {
    els.availabilityFilter.addEventListener("change", () => {
      applyFilters();
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
      closeFloatingMenus();
      window.location.href = "/login";
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
        fullName: els.profileFullName?.value.trim() || current.fullName,
        email: els.profileEmail?.value.trim() || current.email,
        phone: els.profilePhone?.value.trim() || current.phone
      };

      saveProfile(nextProfile);
      renderProfile();
      closeProfileModal();
      addNotification("Da cap nhat thong tin ca nhan.");
    });
  }

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
      } else if (view === "swap" && els.stationType) {
        els.stationType.value = "swap";
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
  applyTheme();
  renderProfile();
  renderNotifications();
  applyTranslations();
  initializeMap();
  bindEvents();
  hydrateStations();
}

bootstrap();
