(function initializeHomeManagement() {
  const managementPanels = new Set([
    "accounts",
    "station-map",
    "station-info",
    "manage-stations",
    "charging-points",
    "pricings",
    "report-summary",
    "station-distribution",
    "bookings",
    "roles",
    "permissions",
    "login-pages",
    "sim-types",
    "device-types",
    "connector-types"
  ]);

  const isAdminShell = window.TRAM_SAC_CONFIG?.shellRole === "admin";
  const viewPaths = {
    map: isAdminShell ? "/admin/dashboard" : "/",
    stations: "/stations",
    notifications: "/notifications",
    accounts: "/admin/accounts",
    "station-map": "/admin/stations/map",
    "station-info": "/admin/stations/list",
    "charging-points": "/admin/charging-points",
    pricings: "/admin/pricings",
    "report-summary": "/admin/reports/summary",
    bookings: "/admin/reports/bookings",
    "station-distribution": "/admin/reports/station-distribution",
    roles: "/admin/system/roles",
    permissions: "/admin/system/permissions",
    "login-pages": "/admin/system/login-pages",
    "sim-types": "/admin/system/sim-types",
    "device-types": "/admin/device-config/device-types",
    "connector-types": "/admin/device-config/connector-types"
  };

  const pathViews = Object.entries(viewPaths).reduce((result, [view, path]) => {
    result[path] = view;
    return result;
  }, {});

  function syncViewUrl(view, replace = false) {
    const path = viewPaths[view];

    if (!path || window.location.pathname === path) {
      return;
    }

    const method = replace ? "replaceState" : "pushState";
    window.history[method]({ view }, "", path);
  }

  const entityPanelMap = {
    "station-map": "stations",
    "station-info": "stations",
    "manage-stations": "stations",
    "charging-points": "charging-points",
    pricings: "pricings",
    bookings: "bookings"
  };

  const panelMeta = {
    accounts: {
      title: "Quản lý tài khoản",
      lead:
        "Theo dõi cây tài khoản cha/con, lọc nhanh danh sách và thao tác tạo mới, sửa, xóa hoặc đặt lại mật khẩu ngay trên trang chủ.",
      primaryLabel: "Tạo mới"
    },
    "manage-stations": {
      title: "Quản lý trạm sạc",
      lead: "Danh sách trạm sạc, trạng thái vận hành và liên kết thao tác nhanh.",
      primaryLabel: "Tạo trạm"
    },
    "station-map": {
      title: "Bản đồ trạm sạc",
      lead:
        "Hiển thị các trạm sạc của người quản trị trên bản đồ theo từng trạng thái và cập nhật dữ liệu trạng thái của trạm, cổng sạc theo chu kỳ.",
      primaryLabel: "Tạo trạm"
    },
    "station-info": {
      title: "Thông tin trạm sạc",
      lead: "Hiển thị các trạm của người sở hữu và cấu hình thông tin trạm sạc với bộ lọc theo IMEI, tên trạm, địa chỉ.",
      primaryLabel: "Tạo trạm"
    },
    "charging-points": {
      title: "Quản lý cổng sạc",
      lead: "Theo dõi mã cổng, loại đầu nối, công suất và trạng thái phục vụ.",
      primaryLabel: "Tạo cổng sạc"
    },
    pricings: {
      title: "Giá dịch vụ",
      lead: "Quản lý bảng giá điện theo kWh và theo phút.",
      primaryLabel: "Tạo bảng giá"
    },
    "report-summary": {
      title: "Báo cáo tổng hợp",
      lead: "Hiển thị dữ liệu tổng hợp theo các chu kỳ năm, tháng, tuần và ngày.",
      primaryLabel: "Tải báo cáo"
    },
    "station-distribution": {
      title: "Phân bổ trạm sạc",
      lead: "Bản đồ thể hiện mật độ trạm sạc đang được lắp đặt và các khu vực tập trung cao.",
      primaryLabel: "Làm mới dữ liệu"
    },
    bookings: {
      title: "Lịch sử đặt lịch",
      lead: "Danh sách lịch đặt cổng sạc và trạng thái xử lý.",
      primaryLabel: "Tạo booking"
    },
    roles: {
      title: "Vai trò",
      lead: "Hiển thị danh sách vai trò, tìm kiếm theo tên vai trò và tạo mới vai trò để gán cho tài khoản người dùng.",
      primaryLabel: "Tạo mới"
    },
    permissions: {
      title: "Quyền",
      lead: "Hiển thị danh sách quyền, tìm kiếm theo tên và nhóm quyền, đồng thời tạo mới quyền để cấu hình hệ thống.",
      primaryLabel: "Tạo mới"
    },
    "login-pages": {
      title: "Trang đăng nhập",
      lead: "Hiển thị danh sách trang đăng nhập theo từng host, cấu hình logo, icon, ảnh nền và liên kết tải ứng dụng.",
      primaryLabel: "Tạo mới"
    },
    "sim-types": {
      title: "Loại sim",
      lead: "Hiển thị danh sách loại sim, tìm kiếm theo tên và mã, đồng thời tạo mới loại sim để cấu hình hệ thống.",
      primaryLabel: "Tạo mới"
    },
    "device-types": {
      title: "Loại thiết bị",
      lead: "Hiển thị danh sách loại thiết bị, tìm kiếm theo tên, mã và nhà sản xuất, đồng thời tạo mới loại thiết bị.",
      primaryLabel: "Tạo mới"
    },
    "connector-types": {
      title: "Loại cổng sạc",
      lead: "Hiển thị danh sách loại cổng sạc, tìm kiếm theo tên và tên viết tắt, đồng thời tạo mới loại cổng sạc.",
      primaryLabel: "Tạo mới"
    }
  };

  const els = {
    mapWorkspace: document.getElementById("mapWorkspace"),
    managementWorkspace: document.getElementById("managementWorkspace"),
    managementTitle: document.getElementById("managementTitle"),
    managementLead: document.getElementById("managementLead"),
    managementStatus: document.getElementById("managementStatus"),
    managementSummary: document.getElementById("managementSummary"),
    managementContent: document.getElementById("managementContent"),
    managementRefreshBtn: document.getElementById("managementRefreshBtn"),
    managementPrimaryBtn: document.getElementById("managementPrimaryBtn"),
    managementNavToggle: document.getElementById("managementNavToggle"),
    managementNavSubmenu: document.getElementById("managementNavSubmenu"),
    reportNavToggle: document.getElementById("reportNavToggle"),
    reportNavSubmenu: document.getElementById("reportNavSubmenu"),
    systemNavToggle: document.getElementById("systemNavToggle"),
    systemNavSubmenu: document.getElementById("systemNavSubmenu"),
    deviceConfigNavToggle: document.getElementById("deviceConfigNavToggle"),
    deviceConfigNavSubmenu: document.getElementById("deviceConfigNavSubmenu"),
    stationNavToggle: document.getElementById("stationNavToggle"),
    stationNavSubmenu: document.getElementById("stationNavSubmenu"),
    topNavItems: Array.from(document.querySelectorAll(".nav-item[data-view]")),
    managementNavItems: Array.from(document.querySelectorAll(".nav-subitem[data-view]")),
    accountModal: document.getElementById("accountModal"),
    closeAccountModal: document.getElementById("closeAccountModal"),
    accountModalTitle: document.getElementById("accountModalTitle"),
    accountModalLead: document.getElementById("accountModalLead"),
    accountModalStatus: document.getElementById("accountModalStatus"),
    accountEditorForm: document.getElementById("accountEditorForm"),
    accountEditorId: document.getElementById("accountEditorId"),
    accountEditorSaveBtn: document.getElementById("accountEditorSaveBtn"),
    accountEditorCancelBtn: document.getElementById("accountEditorCancelBtn"),
    accountTabs: Array.from(document.querySelectorAll(".account-editor-tab")),
    accountPanels: Array.from(document.querySelectorAll(".account-editor-panel")),
    accountUsername: document.getElementById("accountUsername"),
    accountFullName: document.getElementById("accountFullName"),
    accountPhone: document.getElementById("accountPhone"),
    accountEmail: document.getElementById("accountEmail"),
    accountPermissionGroup: document.getElementById("accountPermissionGroup"),
    accountUserType: document.getElementById("accountUserType"),
    accountDescription: document.getElementById("accountDescription"),
    accountAddress: document.getElementById("accountAddress"),
    accountLandingPage: document.getElementById("accountLandingPage"),
    accountStatus: document.getElementById("accountStatus"),
    accountWalletBalance: document.getElementById("accountWalletBalance"),
    accountPassword: document.getElementById("accountPassword"),
    accountParentSearch: document.getElementById("accountParentSearch"),
    accountParentTree: document.getElementById("accountParentTree"),
    accountSelectedParent: document.getElementById("accountSelectedParent"),
    stationModal: document.getElementById("stationModal"),
    closeStationModal: document.getElementById("closeStationModal"),
    stationModalTitle: document.getElementById("stationModalTitle"),
    stationModalLead: document.getElementById("stationModalLead"),
    stationModalStatus: document.getElementById("stationModalFeedback"),
    stationEditorForm: document.getElementById("stationEditorForm"),
    stationEditorId: document.getElementById("stationEditorId"),
    stationEditorSaveBtn: document.getElementById("stationEditorSaveBtn"),
    stationEditorCancelBtn: document.getElementById("stationEditorCancelBtn"),
    stationModalImei: document.getElementById("stationModalImei"),
    stationModalName: document.getElementById("stationModalName"),
    stationLocationSearch: document.getElementById("stationLocationSearch"),
    stationLocationSearchBtn: document.getElementById("stationLocationSearchBtn"),
    stationLocationSearchResults: document.getElementById("stationLocationSearchResults"),
    stationModalMap: document.getElementById("stationModalMap"),
    stationModalLat: document.getElementById("stationModalLat"),
    stationModalLng: document.getElementById("stationModalLng"),
    stationModalCity: document.getElementById("stationModalCity"),
    stationModalDistrict: document.getElementById("stationModalDistrict"),
    stationModalAddress: document.getElementById("stationModalAddress"),
    stationModalStatusSelect: document.getElementById("stationModalStatusSelect"),
    stationModalNotes: document.getElementById("stationModalNotes"),
    stationModalChargingType: document.getElementById("stationModalChargingType"),
    stationModalCurrentType: document.getElementById("stationModalCurrentType"),
    stationModalIsActivated: document.getElementById("stationModalIsActivated"),
    stationModalActivatedAt: document.getElementById("stationModalActivatedAt"),
    stationModalWarrantyUntil: document.getElementById("stationModalWarrantyUntil"),
    stationModalSimType: document.getElementById("stationModalSimType"),
    stationModalSimNumber: document.getElementById("stationModalSimNumber"),
    stationModalBillingSimNumber: document.getElementById("stationModalBillingSimNumber"),
    stationModalSupportPhone: document.getElementById("stationModalSupportPhone"),
    stationModalOpen247: document.getElementById("stationModalOpen247"),
    stationModalAmenities: document.getElementById("stationModalAmenities"),
    stationPreviewImei: document.getElementById("stationPreviewImei"),
    stationPreviewName: document.getElementById("stationPreviewName"),
    stationPreviewCoords: document.getElementById("stationPreviewCoords"),
    stationPreviewArea: document.getElementById("stationPreviewArea"),
    stationPreviewAddress: document.getElementById("stationPreviewAddress"),
    stationPreviewStatus: document.getElementById("stationPreviewStatus"),
    stationPreviewChargingType: document.getElementById("stationPreviewChargingType"),
    stationPreviewCurrentType: document.getElementById("stationPreviewCurrentType"),
    stationPreviewActivated: document.getElementById("stationPreviewActivated"),
    stationPreviewOpen247: document.getElementById("stationPreviewOpen247"),
    chargingPointModal: document.getElementById("chargingPointModal"),
    closeChargingPointModal: document.getElementById("closeChargingPointModal"),
    chargingPointModalTitle: document.getElementById("chargingPointModalTitle"),
    chargingPointModalLead: document.getElementById("chargingPointModalLead"),
    chargingPointModalStatus: document.getElementById("chargingPointModalStatus"),
    chargingPointEditorForm: document.getElementById("chargingPointEditorForm"),
    chargingPointEditorId: document.getElementById("chargingPointEditorId"),
    chargingPointEditorSaveBtn: document.getElementById("chargingPointEditorSaveBtn"),
    chargingPointEditorCancelBtn: document.getElementById("chargingPointEditorCancelBtn"),
    chargingPointCode: document.getElementById("chargingPointCode"),
    chargingPointStationId: document.getElementById("chargingPointStationId"),
    chargingPointConnectorType: document.getElementById("chargingPointConnectorType"),
    chargingPointOutputCurrentType: document.getElementById("chargingPointOutputCurrentType"),
    chargingPointInputSupply: document.getElementById("chargingPointInputSupply"),
    chargingPointMaxOutputCurrentA: document.getElementById("chargingPointMaxOutputCurrentA"),
    chargingPointDescription: document.getElementById("chargingPointDescription"),
    chargingPointPricingId: document.getElementById("chargingPointPricingId"),
    chargingPointPowerKw: document.getElementById("chargingPointPowerKw"),
    chargingPointMaxOutputVoltage: document.getElementById("chargingPointMaxOutputVoltage"),
    chargingPointMultiPortEnabled: document.getElementById("chargingPointMultiPortEnabled"),
    chargingPointPositionLabel: document.getElementById("chargingPointPositionLabel"),
    chargingPointStatusSelect: document.getElementById("chargingPointStatusSelect"),
    pricingModal: document.getElementById("pricingModal"),
    closePricingModal: document.getElementById("closePricingModal"),
    pricingModalTitle: document.getElementById("pricingModalTitle"),
    pricingModalLead: document.getElementById("pricingModalLead"),
    pricingModalStatus: document.getElementById("pricingModalStatus"),
    pricingEditorForm: document.getElementById("pricingEditorForm"),
    pricingEditorId: document.getElementById("pricingEditorId"),
    pricingEditorSaveBtn: document.getElementById("pricingEditorSaveBtn"),
    pricingEditorCancelBtn: document.getElementById("pricingEditorCancelBtn"),
    pricingName: document.getElementById("pricingName"),
    pricingPricePerKwh: document.getElementById("pricingPricePerKwh"),
    pricingHourlyPrice: document.getElementById("pricingHourlyPrice"),
    pricingPricePerMinute: document.getElementById("pricingPricePerMinute"),
    pricingParkingFee: document.getElementById("pricingParkingFee"),
    pricingVat: document.getElementById("pricingVat"),
    pricingTimeRateRows: document.getElementById("pricingTimeRateRows"),
    pricingTimeFrameRows: document.getElementById("pricingTimeFrameRows"),
    pricingDescription: document.getElementById("pricingDescription"),
    accountConfirmModal: document.getElementById("accountConfirmModal"),
    closeAccountConfirmModal: document.getElementById("closeAccountConfirmModal"),
    accountConfirmTitle: document.getElementById("accountConfirmTitle"),
    accountConfirmMessage: document.getElementById("accountConfirmMessage"),
    accountConfirmHint: document.getElementById("accountConfirmHint"),
    accountConfirmSubmitBtn: document.getElementById("accountConfirmSubmitBtn"),
    accountConfirmCancelBtn: document.getElementById("accountConfirmCancelBtn"),
    permissionGroupModal: document.getElementById("permissionGroupModal"),
    closePermissionGroupModal: document.getElementById("closePermissionGroupModal"),
    permissionGroupModalTitle: document.getElementById("permissionGroupModalTitle"),
    permissionGroupModalLead: document.getElementById("permissionGroupModalLead"),
    permissionGroupModalForm: document.getElementById("permissionGroupModalForm"),
    permissionGroupModalId: document.getElementById("permissionGroupModalId"),
    permissionGroupModalName: document.getElementById("permissionGroupModalName"),
    permissionGroupModalCode: document.getElementById("permissionGroupModalCode"),
    permissionGroupModalParentId: document.getElementById("permissionGroupModalParentId"),
    permissionGroupModalDescription: document.getElementById("permissionGroupModalDescription"),
    permissionGroupPermissionList: document.getElementById("permissionGroupPermissionList"),
    permissionGroupModalSubmitBtn: document.getElementById("permissionGroupModalSubmitBtn"),
    permissionGroupModalCancelBtn: document.getElementById("permissionGroupModalCancelBtn"),
    permissionModal: document.getElementById("permissionModal"),
    closePermissionModal: document.getElementById("closePermissionModal"),
    permissionModalTitle: document.getElementById("permissionModalTitle"),
    permissionModalLead: document.getElementById("permissionModalLead"),
    permissionModalForm: document.getElementById("permissionModalForm"),
    permissionModalId: document.getElementById("permissionModalId"),
    permissionModalName: document.getElementById("permissionModalName"),
    permissionModalGroupKey: document.getElementById("permissionModalGroupKey"),
    permissionModalDescription: document.getElementById("permissionModalDescription"),
    permissionModalSubmitBtn: document.getElementById("permissionModalSubmitBtn"),
    permissionModalCancelBtn: document.getElementById("permissionModalCancelBtn"),
    loginPageModal: document.getElementById("loginPageModal"),
    closeLoginPageModal: document.getElementById("closeLoginPageModal"),
    loginPageModalTitle: document.getElementById("loginPageModalTitle"),
    loginPageModalLead: document.getElementById("loginPageModalLead"),
    loginPageModalForm: document.getElementById("loginPageModalForm"),
    loginPageModalId: document.getElementById("loginPageModalId"),
    loginPageModalHost: document.getElementById("loginPageModalHost"),
    loginPageModalTitleInput: document.getElementById("loginPageModalPageTitle"),
    loginPageModalCompanyName: document.getElementById("loginPageModalCompanyName"),
    loginPageModalTheme: document.getElementById("loginPageModalTheme"),
    loginPageModalLogoImage: document.getElementById("loginPageModalLogoImage"),
    loginPageModalIconImage: document.getElementById("loginPageModalIconImage"),
    loginPageModalBackgroundImage: document.getElementById("loginPageModalBackgroundImage"),
    loginPageModalLogoUpload: document.getElementById("loginPageModalLogoUpload"),
    loginPageModalIconUpload: document.getElementById("loginPageModalIconUpload"),
    loginPageModalBackgroundUpload: document.getElementById("loginPageModalBackgroundUpload"),
    loginPageModalLogoTrigger: document.getElementById("loginPageModalLogoTrigger"),
    loginPageModalIconTrigger: document.getElementById("loginPageModalIconTrigger"),
    loginPageModalBackgroundTrigger: document.getElementById("loginPageModalBackgroundTrigger"),
    loginPageModalLogoText: document.getElementById("loginPageModalLogoText"),
    loginPageModalIconText: document.getElementById("loginPageModalIconText"),
    loginPageModalBackgroundText: document.getElementById("loginPageModalBackgroundText"),
    loginPageModalIosAppLink: document.getElementById("loginPageModalIosAppLink"),
    loginPageModalAndroidAppLink: document.getElementById("loginPageModalAndroidAppLink"),
    loginPageModalWebsite: document.getElementById("loginPageModalWebsite"),
    loginPageModalGuideLink: document.getElementById("loginPageModalGuideLink"),
    loginPageModalDescription: document.getElementById("loginPageModalDescription"),
    loginPageModalServicePhone: document.getElementById("loginPageModalServicePhone"),
    loginPageModalSupportPhone: document.getElementById("loginPageModalSupportPhone"),
    loginPageModalSubmitBtn: document.getElementById("loginPageModalSubmitBtn"),
    loginPageModalCancelBtn: document.getElementById("loginPageModalCancelBtn"),
    simTypeModal: document.getElementById("simTypeModal"),
    closeSimTypeModal: document.getElementById("closeSimTypeModal"),
    simTypeModalTitle: document.getElementById("simTypeModalTitle"),
    simTypeModalLead: document.getElementById("simTypeModalLead"),
    simTypeModalForm: document.getElementById("simTypeModalForm"),
    simTypeModalId: document.getElementById("simTypeModalId"),
    simTypeModalName: document.getElementById("simTypeModalName"),
    simTypeModalCode: document.getElementById("simTypeModalCode"),
    simTypeModalDescription: document.getElementById("simTypeModalDescription"),
    simTypeModalSubmitBtn: document.getElementById("simTypeModalSubmitBtn"),
    simTypeModalCancelBtn: document.getElementById("simTypeModalCancelBtn"),
    deviceTypeModal: document.getElementById("deviceTypeModal"),
    closeDeviceTypeModal: document.getElementById("closeDeviceTypeModal"),
    deviceTypeModalTitle: document.getElementById("deviceTypeModalTitle"),
    deviceTypeModalLead: document.getElementById("deviceTypeModalLead"),
    deviceTypeModalForm: document.getElementById("deviceTypeModalForm"),
    deviceTypeModalId: document.getElementById("deviceTypeModalId"),
    deviceTypeModalName: document.getElementById("deviceTypeModalName"),
    deviceTypeModalCode: document.getElementById("deviceTypeModalCode"),
    deviceTypeModalManufacturer: document.getElementById("deviceTypeModalManufacturer"),
    deviceTypeModalDescription: document.getElementById("deviceTypeModalDescription"),
    deviceTypeModalImage: document.getElementById("deviceTypeModalImage"),
    deviceTypeModalImageUpload: document.getElementById("deviceTypeModalImageUpload"),
    deviceTypeModalImageTrigger: document.getElementById("deviceTypeModalImageTrigger"),
    deviceTypeModalImageText: document.getElementById("deviceTypeModalImageText"),
    deviceTypeModalSubmitBtn: document.getElementById("deviceTypeModalSubmitBtn"),
    deviceTypeModalCancelBtn: document.getElementById("deviceTypeModalCancelBtn"),
    connectorTypeModal: document.getElementById("connectorTypeModal"),
    closeConnectorTypeModal: document.getElementById("closeConnectorTypeModal"),
    connectorTypeModalTitle: document.getElementById("connectorTypeModalTitle"),
    connectorTypeModalLead: document.getElementById("connectorTypeModalLead"),
    connectorTypeModalForm: document.getElementById("connectorTypeModalForm"),
    connectorTypeModalId: document.getElementById("connectorTypeModalId"),
    connectorTypeModalName: document.getElementById("connectorTypeModalName"),
    connectorTypeModalShortName: document.getElementById("connectorTypeModalShortName"),
    connectorTypeModalChargingType: document.getElementById("connectorTypeModalChargingType"),
    connectorTypeModalCurrentType: document.getElementById("connectorTypeModalCurrentType"),
    connectorTypeModalDescription: document.getElementById("connectorTypeModalDescription"),
    connectorTypeModalImage: document.getElementById("connectorTypeModalImage"),
    connectorTypeModalImageUpload: document.getElementById("connectorTypeModalImageUpload"),
    connectorTypeModalImageTrigger: document.getElementById("connectorTypeModalImageTrigger"),
    connectorTypeModalImageText: document.getElementById("connectorTypeModalImageText"),
    connectorTypeModalSubmitBtn: document.getElementById("connectorTypeModalSubmitBtn"),
    connectorTypeModalCancelBtn: document.getElementById("connectorTypeModalCancelBtn"),
    bookingHistoryDetailModal: document.getElementById("bookingHistoryDetailModal"),
    closeBookingHistoryDetailModal: document.getElementById("closeBookingHistoryDetailModal"),
    bookingHistoryDetailTitle: document.getElementById("bookingHistoryDetailTitle"),
    bookingHistoryDetailLead: document.getElementById("bookingHistoryDetailLead"),
    bookingHistoryDetailStatus: document.getElementById("bookingHistoryDetailStatus"),
    bookingHistoryDetailGrid: document.getElementById("bookingHistoryDetailGrid")
  };

  const state = {
    currentPanel: "",
    profile: null,
    genericSearch: "",
    cache: {},
    permissionGroups: {
      items: [],
      catalog: [],
      search: "",
      mode: "create",
      editingId: ""
    },
    permissions: {
      items: [],
      groups: [],
      searchName: "",
      searchGroupKey: "all",
      mode: "create",
      editingId: ""
    },
    loginPages: {
      items: [],
      searchHost: "",
      searchTitle: "",
      searchCompanyName: "",
      searchWebsite: "",
      mode: "create",
      editingId: ""
    },
    simTypes: {
      items: [],
      searchName: "",
      searchCode: "",
      mode: "create",
      editingId: ""
    },
    deviceTypes: {
      items: [],
      searchName: "",
      searchCode: "",
      searchManufacturer: "",
      mode: "create",
      editingId: ""
    },
    connectorTypes: {
      items: [],
      searchName: "",
      searchShortName: "",
      mode: "create",
      editingId: ""
    },
    accounts: {
      profile: null,
      items: [],
      tree: [],
      searchKeyword: "",
      searchEmail: "",
      filterChildOnly: false,
      filterLeafOnly: false,
      selectedParentId: "",
      modalMode: "create",
      editingId: "",
      modalParentId: "",
      expandedTreeIds: new Set(),
      parentExpandedIds: new Set(),
      parentSearch: "",
      currentTab: "basic"
    },
    stations: {
      items: [],
      selectedId: "",
      searchImei: "",
      searchName: "",
      searchAddress: "",
      statusFilter: "all",
      map: null,
      markers: new Map(),
      markerLayer: null,
      pollTimer: null,
      lastSyncAt: "",
      modalMode: "create",
      editingId: "",
      modalMap: null,
      modalMarker: null,
      modalSearchResults: [],
      modalSearchTimer: null
    },
    chargingPoints: {
      items: [],
      searchCode: "",
      searchStationId: "",
      searchConnectorType: "all",
      modalMode: "create",
      editingId: ""
    },
    pricings: {
      items: [],
      searchName: "",
      modalMode: "create",
      editingId: "",
      timeRateDraft: createEmptyTimeRate(),
      timeFrameDraft: createEmptyTimeFrame(),
      timeRates: [],
      timeFrames: []
    },
    bookings: {
      items: [],
      filterStart: "",
      filterEnd: "",
      filterStatus: "all",
      detailId: ""
    },
    reportSummary: {
      filterStart: createDefaultReportSummaryState().filterStart,
      filterEnd: createDefaultReportSummaryState().filterEnd,
      cycle: createDefaultReportSummaryState().cycle,
      rows: []
    },
    confirmAction: null
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function formatNumber(value) {
    const number = Number(value || 0);
    return new Intl.NumberFormat("vi-VN").format(Number.isFinite(number) ? number : 0);
  }

  function formatDate(value) {
    if (!value) {
      return "--";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "short"
    }).format(date);
  }

  function formatDateInput(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function getTodayInputValue() {
    return formatDateInput(new Date());
  }

  function formatDatetimeLocalInput(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  function createDefaultReportSummaryState() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return {
      filterStart: `${year}-01-01`,
      filterEnd: `${year}-${month}-${day}`,
      cycle: "month"
    };
  }

  function parseDateInputBoundary(value, boundary = "start") {
    if (!value) {
      return null;
    }

    const suffix = boundary === "end" ? "T23:59:59.999" : "T00:00:00.000";
    const date = new Date(`${value}${suffix}`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function formatMinutesAsDuration(totalMinutes) {
    const minutes = Math.max(0, Math.round(Number(totalMinutes || 0)));
    const hours = Math.floor(minutes / 60);
    const remainMinutes = minutes % 60;

    if (!hours) {
      return `${formatNumber(remainMinutes)} phut`;
    }

    return `${formatNumber(hours)} gio ${formatNumber(remainMinutes)} phut`;
  }

  function getWeekNumber(date) {
    const normalized = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = normalized.getUTCDay() || 7;
    normalized.setUTCDate(normalized.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(normalized.getUTCFullYear(), 0, 1));
    return Math.ceil((((normalized - yearStart) / 86400000) + 1) / 7);
  }

  function getPeriodBoundaries(date, cycle) {
    const start = new Date(date);
    const end = new Date(date);

    if (cycle === "year") {
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    if (cycle === "month") {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    if (cycle === "week") {
      const weekday = start.getDay() || 7;
      start.setDate(start.getDate() - weekday + 1);
      start.setHours(0, 0, 0, 0);
      end.setTime(start.getTime());
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  function buildAggregatePeriodKey(date, cycle) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    if (cycle === "year") {
      return `year-${year}`;
    }

    if (cycle === "month") {
      return `month-${year}-${month}`;
    }

    if (cycle === "week") {
      return `week-${year}-${String(getWeekNumber(date)).padStart(2, "0")}`;
    }

    return `day-${year}-${month}-${day}`;
  }

  function formatAggregatePeriodLabel(date, cycle) {
    if (cycle === "year") {
      return `Nam ${date.getFullYear()}`;
    }

    if (cycle === "month") {
      return `Thang ${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
    }

    if (cycle === "week") {
      return `Tuan ${String(getWeekNumber(date)).padStart(2, "0")}/${date.getFullYear()}`;
    }

    return formatDateInput(date).split("-").reverse().join("/");
  }

  function classifyAggregateBooking(booking) {
    const createdAt = new Date(booking?.createdAt);
    const startTime = new Date(booking?.startTime);
    const leadMinutes =
      Number.isNaN(createdAt.getTime()) || Number.isNaN(startTime.getTime())
        ? 9999
        : Math.round((startTime.getTime() - createdAt.getTime()) / 60000);
    const role = String(booking?.user?.role || "").toLowerCase();

    if (!booking?.user || role === "guest" || role === "walkin" || leadMinutes <= 10) {
      return "walk-in";
    }

    if (leadMinutes <= 30) {
      return "instant";
    }

    return "booking";
  }

  function bookingStatusLabel(status) {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "pending") {
      return "Cho xac nhan";
    }

    if (normalized === "confirmed") {
      return "Da dat";
    }

    if (normalized === "completed") {
      return "Hoan thanh";
    }

    if (normalized === "cancelled") {
      return "Da huy";
    }

    return status || "--";
  }

  function renderBookingStatusBadge(status) {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "confirmed") {
      return renderMappedStatusBadge("ready", bookingStatusLabel(status));
    }

    if (normalized === "completed") {
      return renderMappedStatusBadge("full", bookingStatusLabel(status));
    }

    if (normalized === "cancelled") {
      return renderMappedStatusBadge("closed", bookingStatusLabel(status));
    }

    return renderMappedStatusBadge("inactive", bookingStatusLabel(status));
  }

  function formatBookingDuration(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return "--";
    }

    const diffMinutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
    return `${formatNumber(diffMinutes)} phut`;
  }

  function getBookingCancellationState(booking) {
    const start = new Date(booking?.startTime);
    const end = new Date(booking?.endTime);
    const now = new Date();

    if (booking?.status === "cancelled") {
      return {
        canCancel: false,
        reason: "Lich nay da duoc huy truoc do."
      };
    }

    if (booking?.status === "completed") {
      return {
        canCancel: false,
        reason: "Lich nay da hoan thanh nen khong the huy."
      };
    }

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return {
        canCancel: false,
        reason: "Khong xac dinh duoc thoi gian dat lich."
      };
    }

    const cancellationDeadline = new Date(start.getTime() - 30 * 60 * 1000);

    if (now >= cancellationDeadline) {
      return {
        canCancel: false,
        reason: "Chi co the huy lich truoc gio bat dau it nhat 30 phut."
      };
    }

    return {
      canCancel: true,
      reason: ""
    };
  }

  function downloadTextFile(filename, content, mimeType = "text/plain;charset=utf-8") {
    const blob = new Blob([content], { type: mimeType });
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(objectUrl);
  }

  function downloadStationImportTemplate() {
    const template = [
      [
        "imei",
        "name",
        "lat",
        "lng",
        "city",
        "district",
        "address",
        "status",
        "chargingType",
        "currentType",
        "isActivated",
        "activatedAt",
        "warrantyUntil",
        "simType",
        "simNumber",
        "billingSimNumber",
        "supportPhone",
        "open24_7",
        "amenities"
      ].join(","),
      [
        "868371077006260",
        '"Trạm sạc Hà Nội Center"',
        "21.028500",
        "105.854200",
        '"Hà Nội"',
        '"Hoàn Kiếm"',
        '"12 Tràng Tiền, Hoàn Kiếm, Hà Nội"',
        "active",
        '"Xe máy điện"',
        '"1 pha"',
        "true",
        "2026-08-07",
        "2027-08-07",
        '"4G"',
        '"0988000111"',
        '"0988000222"',
        '"19001001"',
        "true",
        '"Bãi đỗ xe|Wifi|Cửa hàng tiện lợi"'
      ].join(",")
    ].join("\n");

    downloadTextFile("station-import-template.csv", template, "text/csv;charset=utf-8");
  }

  async function importStationDataFile(file) {
    if (!file) {
      return;
    }

    const lowerName = String(file.name || "").toLowerCase();
    const isJson = lowerName.endsWith(".json");
    const isCsv = lowerName.endsWith(".csv") || !lowerName.includes(".");
    const isExcel = lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls");

    if (isExcel) {
      setStatus(
        "Hệ thống hiện nhập trực tiếp file CSV hoặc JSON. Bạn có thể mở file mẫu bằng Excel rồi lưu lại dạng CSV để đẩy file.",
        true
      );
      return;
    }

    if (!isCsv && !isJson) {
      setStatus("Chỉ hỗ trợ file CSV hoặc JSON để nhập dữ liệu trạm sạc.", true);
      return;
    }

    const content = await file.text();

    if (!content.trim()) {
      setStatus("File nhập dữ liệu đang trống.", true);
      return;
    }

    setStatus(`Đang nhập dữ liệu từ file ${file.name}...`);

    const data = await requestJson("/api/admin/stations/import", {
      method: "POST",
      body: JSON.stringify({
        format: isJson ? "json" : "csv",
        mode: "upsert",
        content
      })
    });

    state.cache.stations = null;
    state.cache["charging-points"] = null;
    await renderCurrentPanel(true);

    const summary = `Đã nhập file ${file.name}: tạo ${data.created || 0}, cập nhật ${data.updated || 0}, bỏ qua ${data.skipped || 0}.`;
    const errors = Array.isArray(data.errors) ? data.errors.filter(Boolean) : [];

    setStatus(errors.length ? `${summary} ${errors[0]}` : summary, errors.length > 0);
  }

  function ensureStationImportActions() {
    if (state.currentPanel !== "station-info" || !els.managementContent) {
      return;
    }

    const actionWrap = els.managementContent.querySelector(".station-admin-panel-actions");

    if (!(actionWrap instanceof HTMLElement)) {
      return;
    }

    if (!actionWrap.querySelector('[data-action="download-station-template"]')) {
      const templateButton = document.createElement("button");
      templateButton.type = "button";
      templateButton.className = "outline-btn";
      templateButton.dataset.action = "download-station-template";
      templateButton.textContent = "Tai mau nhap du lieu";
      actionWrap.insertBefore(templateButton, actionWrap.firstChild);
    }

    if (!actionWrap.querySelector('[data-action="trigger-station-import"]')) {
      const uploadButton = document.createElement("button");
      uploadButton.type = "button";
      uploadButton.className = "outline-btn";
      uploadButton.dataset.action = "trigger-station-import";
      uploadButton.textContent = "Day file";
      const anchorButton = actionWrap.querySelector('[data-action="open-station-map-panel"]');
      actionWrap.insertBefore(uploadButton, anchorButton || actionWrap.firstChild);
    }

    if (!actionWrap.querySelector("#stationImportFileInput")) {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.id = "stationImportFileInput";
      fileInput.className = "station-import-input";
      fileInput.accept =
        ".csv,.json,.xlsx,.xls,text/csv,application/json,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      actionWrap.appendChild(fileInput);
    }
  }

  function getToken() {
    return localStorage.getItem("tram_sac_admin_token") || "";
  }

  function hasSession() {
    return Boolean(getToken());
  }

  function setStatus(message, isError = false) {
    if (!els.managementStatus) {
      return;
    }

    els.managementStatus.textContent = message;
    els.managementStatus.className = isError ? "status-box error" : "status-box";
  }

  function setAccountModalStatus(message = "", isError = true) {
    if (!els.accountModalStatus) {
      return;
    }

    if (!message) {
      els.accountModalStatus.hidden = true;
      els.accountModalStatus.textContent = "";
      return;
    }

    els.accountModalStatus.hidden = false;
    els.accountModalStatus.textContent = message;
    els.accountModalStatus.className = isError ? "status-box error" : "status-box";
  }

  function setSummary(cards) {
    if (!els.managementSummary) {
      return;
    }

    els.managementSummary.innerHTML = cards
      .map(
        (card) => `
          <article class="management-summary-card">
            <span>${escapeHtml(card.label)}</span>
            <strong>${escapeHtml(card.value)}</strong>
          </article>
        `
      )
      .join("");
  }

  async function requestJson(url, options = {}) {
    const token = getToken();

    if (!token) {
      throw new Error("Ban can dang nhap admin truoc.");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {})
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Yeu cau that bai");
    }

    return data;
  }

  async function ensureProfile() {
    if (state.profile?.id) {
      return state.profile;
    }

    const data = await requestJson("/api/admin/auth/me");
    state.profile = data.user;
    return state.profile;
  }

  function showLoginPrompt() {
    setSummary([]);

    if (els.managementContent) {
      els.managementContent.innerHTML = `
        <section class="management-card management-note-card">
          <h3>Chưa có phiên đăng nhập quản trị</h3>
          <p>Hãy đăng nhập bằng tài khoản admin để mở khối quản lý trên trang chủ.</p>
          <div class="management-form-actions">
            <button type="button" class="primary-btn" data-action="open-login">Đăng nhập</button>
          </div>
        </section>
      `;
    }

    setStatus("Cần đăng nhập để dùng khu vực quản lý.", true);
  }

  function renderStatusBadge(status) {
    const raw = String(status || "active").toLowerCase();
    const mapped =
      raw === "active" || raw === "available" || raw === "confirmed" || raw === "completed"
        ? "ready"
        : raw === "maintenance"
          ? "maintenance"
          : raw === "inactive"
            ? "inactive"
            : raw === "closed" || raw === "cancelled"
              ? "closed"
              : raw === "full" || raw === "occupied" || raw === "reserved"
                ? "full"
                : "inactive";

    return `<span class="management-status-badge ${mapped}">${escapeHtml(status || "--")}</span>`;
  }

  function renderMappedStatusBadge(statusKey, label) {
    return `<span class="management-status-badge ${escapeHtml(statusKey || "inactive")}">${escapeHtml(
      label || "--"
    )}</span>`;
  }

  const chargingPointConnectorLabels = {
    AC_Type2: "AC Type 2",
    CCS2: "CCS2",
    CHAdeMO: "CHAdeMO",
    GB_T: "GB/T"
  };

  const chargingPointStatusMeta = {
    available: { key: "ready", label: "San sang" },
    occupied: { key: "full", label: "Dang su dung" },
    reserved: { key: "full", label: "Da dat truoc" },
    maintenance: { key: "maintenance", label: "Bao tri" }
  };

  function getChargingPointConnectorLabel(value) {
    return chargingPointConnectorLabels[value] || value || "--";
  }

  function getChargingPointStatusMeta(status) {
    return chargingPointStatusMeta[status] || { key: "inactive", label: status || "--" };
  }

  function setChargingPointModalStatus(message = "", isError = true) {
    if (!els.chargingPointModalStatus) {
      return;
    }

    if (!message) {
      els.chargingPointModalStatus.hidden = true;
      els.chargingPointModalStatus.textContent = "";
      return;
    }

    els.chargingPointModalStatus.hidden = false;
    els.chargingPointModalStatus.textContent = message;
    els.chargingPointModalStatus.className = isError ? "status-box error" : "status-box";
  }

  function createManagementTileLayer() {
    const locationiqKey = window.TRAM_SAC_CONFIG?.locationiqKey || "";

    if (!locationiqKey || !window.L) {
      return null;
    }

    return window.L.tileLayer(
      `https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${encodeURIComponent(
        locationiqKey
      )}`,
      {
        attribution: '&copy; <a href="https://www.locationiq.com/">LocationIQ</a> &copy; OpenStreetMap contributors',
        maxZoom: 19
      }
    );
  }

  function summarizeChargingPointStatuses(points = []) {
    return points.reduce(
      (summary, point) => {
        const status = String(point.status || "").toLowerCase();

        if (status === "available") {
          summary.available += 1;
        } else if (status === "maintenance") {
          summary.maintenance += 1;
        } else if (status === "occupied" || status === "reserved") {
          summary.busy += 1;
        }

        return summary;
      },
      { available: 0, busy: 0, maintenance: 0 }
    );
  }

  function getStationRealtimeStatus(station, points = []) {
    const rawStatus = String(station?.status || "active").toLowerCase();

    if (rawStatus === "closed") {
      return { key: "closed", label: "Đóng cửa" };
    }

    if (rawStatus === "maintenance") {
      return { key: "maintenance", label: "Bảo trì" };
    }

    if (rawStatus === "inactive") {
      return { key: "inactive", label: "Chưa hoạt động" };
    }

    const summary = summarizeChargingPointStatuses(points);

    if (points.length && summary.available === 0 && summary.busy > 0) {
      return { key: "full", label: "Đầy" };
    }

    return { key: "ready", label: "Sẵn sàng" };
  }

  async function fetchAllAdminItems(endpoint) {
    const baseUrl = new URL(endpoint, window.location.origin);
    const firstPage = await requestJson(baseUrl.pathname + baseUrl.search);
    const items = Array.isArray(firstPage.items) ? [...firstPage.items] : [];
    const totalPages = Number(firstPage.pagination?.totalPages || 1);

    for (let page = 2; page <= totalPages; page += 1) {
      baseUrl.searchParams.set("page", String(page));
      const pageData = await requestJson(baseUrl.pathname + baseUrl.search);

      if (Array.isArray(pageData.items)) {
        items.push(...pageData.items);
      }
    }

    return items;
  }

  function buildStationManagementItems(stations = [], chargingPoints = [], ownerProfile = null) {
    const chargingPointsByStationId = chargingPoints.reduce((map, point) => {
      const stationId = point.station?.id || "";

      if (!stationId) {
        return map;
      }

      if (!map.has(stationId)) {
        map.set(stationId, []);
      }

      map.get(stationId).push(point);
      return map;
    }, new Map());

    return stations
      .map((station) => {
        const stationPoints = chargingPointsByStationId.get(station.id) || [];
        const pointSummary = summarizeChargingPointStatuses(stationPoints);
        const realtimeStatus = getStationRealtimeStatus(station, stationPoints);
        const connectorTypes = Array.from(
          new Set(
            stationPoints
              .map((point) => point.connectorType)
              .filter(Boolean)
          )
        );

        return {
          ...station,
          imei: station.imei || "",
          ownerName: ownerProfile?.username || ownerProfile?.email || "admin",
          chargingPoints: stationPoints,
          connectorTypes,
          chargingType: station.chargingType || (connectorTypes.length ? connectorTypes.join(", ") : "Xe máy điện"),
          currentType: station.currentType || "",
          totalPorts: stationPoints.length,
          availablePorts: pointSummary.available,
          busyPorts: pointSummary.busy,
          maintenancePorts: pointSummary.maintenance,
          realtimeStatusKey: realtimeStatus.key,
          realtimeStatusLabel: realtimeStatus.label
        };
      })
      .sort((left, right) => {
        if (left.realtimeStatusKey !== right.realtimeStatusKey) {
          return left.realtimeStatusKey.localeCompare(right.realtimeStatusKey);
        }

        return String(left.name || "").localeCompare(String(right.name || ""), "vi");
      });
  }

  async function loadStationManagementData(forceRefresh = false) {
    if (!hasSession()) {
      showLoginPrompt();
      return;
    }

    const shouldReload =
      forceRefresh ||
      !Array.isArray(state.cache.stations) ||
      !Array.isArray(state.cache["charging-points"]);

    const ownerProfile = await ensureProfile();

    if (shouldReload) {
      const [stations, chargingPoints] = await Promise.all([
        fetchAllAdminItems("/api/admin/stations?limit=50"),
        fetchAllAdminItems("/api/admin/charging-points?limit=50")
      ]);

      state.cache.stations = stations;
      state.cache["charging-points"] = chargingPoints;
    }

    state.stations.items = buildStationManagementItems(
      state.cache.stations || [],
      state.cache["charging-points"] || [],
      ownerProfile
    );

    if (!state.stations.selectedId || !state.stations.items.some((item) => item.id === state.stations.selectedId)) {
      state.stations.selectedId = state.stations.items[0]?.id || "";
    }

    state.stations.lastSyncAt = new Date().toISOString();
  }

  function getFilteredStationManagementItems() {
    const imeiQuery = state.stations.searchImei.trim().toLowerCase();
    const nameQuery = state.stations.searchName.trim().toLowerCase();
    const addressQuery = state.stations.searchAddress.trim().toLowerCase();
    const statusFilter = state.stations.statusFilter || "all";

    return state.stations.items.filter((item) => {
      const matchesImei = !imeiQuery || String(item.imei || "").toLowerCase().includes(imeiQuery);
      const matchesName = !nameQuery || String(item.name || "").toLowerCase().includes(nameQuery);
      const matchesAddress =
        !addressQuery || String(item.address || "").toLowerCase().includes(addressQuery);
      const matchesStatus = statusFilter === "all" || item.realtimeStatusKey === statusFilter;

      return matchesImei && matchesName && matchesAddress && matchesStatus;
    });
  }

  function getSelectedStationManagementItem(items = []) {
    return (
      items.find((item) => item.id === state.stations.selectedId) ||
      items[0] ||
      null
    );
  }

  function getStationStatusCount(items, statusKey) {
    return items.filter((item) => item.realtimeStatusKey === statusKey).length;
  }

  function teardownStationManagementMap() {
    if (state.stations.pollTimer) {
      window.clearInterval(state.stations.pollTimer);
      state.stations.pollTimer = null;
    }

    if (state.stations.map) {
      state.stations.map.remove();
    }

    state.stations.map = null;
    state.stations.markerLayer = null;
    state.stations.markers = new Map();
  }

  function setStationModalStatus(message = "", isError = true) {
    if (!els.stationModalStatus) {
      return;
    }

    if (!message) {
      els.stationModalStatus.hidden = true;
      els.stationModalStatus.textContent = "";
      return;
    }

    els.stationModalStatus.hidden = false;
    els.stationModalStatus.textContent = message;
    els.stationModalStatus.className = isError ? "status-box error" : "status-box";
  }

  function setStationModalPreview() {
    if (els.stationPreviewImei) {
      els.stationPreviewImei.textContent = els.stationModalImei?.value?.trim() || "--";
    }
    if (els.stationPreviewName) {
      els.stationPreviewName.textContent = els.stationModalName?.value?.trim() || "--";
    }
    if (els.stationPreviewCoords) {
      const lat = els.stationModalLat?.value?.trim() || "--";
      const lng = els.stationModalLng?.value?.trim() || "--";
      els.stationPreviewCoords.textContent = `${lat}, ${lng}`;
    }
    if (els.stationPreviewArea) {
      const city = els.stationModalCity?.value?.trim() || "";
      const district = els.stationModalDistrict?.value?.trim() || "";
      els.stationPreviewArea.textContent = [district, city].filter(Boolean).join(" / ") || "--";
    }
    if (els.stationPreviewAddress) {
      els.stationPreviewAddress.textContent = els.stationModalAddress?.value?.trim() || "--";
    }
    if (els.stationPreviewStatus) {
      const status = els.stationModalStatusSelect?.value || "active";
      const label =
        status === "maintenance"
          ? "Bảo trì"
          : status === "inactive"
            ? "Chưa hoạt động"
            : status === "closed"
              ? "Đóng cửa"
              : "Hoạt động";
      els.stationPreviewStatus.textContent = label;
    }
    if (els.stationPreviewChargingType) {
      els.stationPreviewChargingType.textContent =
        els.stationModalChargingType?.value?.trim() || "--";
    }
    if (els.stationPreviewCurrentType) {
      els.stationPreviewCurrentType.textContent =
        els.stationModalCurrentType?.value?.trim() || "--";
    }
    if (els.stationPreviewActivated) {
      const activated = els.stationModalIsActivated?.checked;
      const activatedAt = els.stationModalActivatedAt?.value || "";
      els.stationPreviewActivated.textContent = activated
        ? activatedAt
          ? `Đã kích hoạt (${activatedAt})`
          : "Đã kích hoạt"
        : "Chưa kích hoạt";
    }
    if (els.stationPreviewOpen247) {
      els.stationPreviewOpen247.textContent = els.stationModalOpen247?.checked
        ? "Có"
        : "Không";
    }
  }

  function normalizeLocationIqResult(result) {
    const address = result.display_name || "";
    const city =
      result.address?.city ||
      result.address?.town ||
      result.address?.municipality ||
      result.address?.province ||
      result.address?.state ||
      "";
    const district = result.address?.county || result.address?.district || result.address?.suburb || "";

    return {
      lat: Number(result.lat),
      lng: Number(result.lon),
      address,
      city,
      district
    };
  }

  function ensureStationModalMap() {
    if (!window.L || !els.stationModalMap) {
      return null;
    }

    if (!state.stations.modalMap) {
      state.stations.modalMap = window.L.map(els.stationModalMap, { zoomControl: true }).setView(
        [21.0285, 105.8542],
        13
      );

      const tileLayer = createManagementTileLayer();
      if (tileLayer) {
        tileLayer.addTo(state.stations.modalMap);
      }

      state.stations.modalMap.on("click", (event) => {
        setStationModalLocation(event.latlng.lat, event.latlng.lng, {
          reverse: true,
          center: true
        });
      });

      state.stations.modalMarker = window.L.marker([21.0285, 105.8542], { draggable: true }).addTo(
        state.stations.modalMap
      );

      state.stations.modalMarker.on("dragend", () => {
        const position = state.stations.modalMarker.getLatLng();
        setStationModalLocation(position.lat, position.lng, { reverse: true, silent: true });
      });
    }

    window.setTimeout(() => {
      state.stations.modalMap?.invalidateSize();
    }, 80);

    return state.stations.modalMap;
  }

  async function reverseGeocodeStationLocation(lat, lng) {
    const key = window.TRAM_SAC_CONFIG?.locationiqKey || "";

    if (!key) {
      return null;
    }

    const url = new URL("https://api.locationiq.com/v1/reverse.php");
    url.searchParams.set("key", key);
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("format", "json");

    const response = await fetch(url.toString());
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      address: data.display_name || "",
      city:
        data.address?.city ||
        data.address?.town ||
        data.address?.municipality ||
        data.address?.province ||
        data.address?.state ||
        "",
      district: data.address?.county || data.address?.district || data.address?.suburb || ""
    };
  }

  function setStationModalLocation(lat, lng, options = {}) {
    const { reverse = false, center = false, silent = false } = options;

    if (els.stationModalLat) {
      els.stationModalLat.value = Number(lat).toFixed(6);
    }

    if (els.stationModalLng) {
      els.stationModalLng.value = Number(lng).toFixed(6);
    }

    if (state.stations.modalMap) {
      state.stations.modalMap.setView([lat, lng], center ? 15 : state.stations.modalMap.getZoom() || 14);
    }

    if (state.stations.modalMarker) {
      state.stations.modalMarker.setLatLng([lat, lng]);
    }

    setStationModalPreview();

    if (reverse) {
      reverseGeocodeStationLocation(lat, lng)
        .then((result) => {
          if (!result) {
            return;
          }

          if (els.stationModalAddress) {
            els.stationModalAddress.value = result.address || "";
          }

          if (els.stationModalCity && result.city) {
            els.stationModalCity.value = result.city;
          }

          if (els.stationModalDistrict && result.district) {
            els.stationModalDistrict.value = result.district;
          }

          setStationModalPreview();
        })
        .catch(() => {});
    }

    if (!silent) {
      setStationModalStatus("");
    }
  }

  async function searchStationLocations(query, silent = false) {
    const key = window.TRAM_SAC_CONFIG?.locationiqKey || "";

    if (!key || !query.trim()) {
      if (els.stationLocationSearchResults) {
        els.stationLocationSearchResults.hidden = true;
        els.stationLocationSearchResults.innerHTML = "";
      }
      return [];
    }

    if (!silent) {
      setStationModalStatus("Đang tìm vị trí trên bản đồ...", false);
    }

    const url = new URL("https://api.locationiq.com/v1/search.php");
    url.searchParams.set("key", key);
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "5");

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error("Không thể tìm vị trí trên bản đồ.");
    }

    const data = await response.json();
    const results = Array.isArray(data) ? data.map(normalizeLocationIqResult).filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng)) : [];

    state.stations.modalSearchResults = results;

    if (els.stationLocationSearchResults) {
      if (!results.length) {
        els.stationLocationSearchResults.hidden = false;
        els.stationLocationSearchResults.innerHTML = '<p class="station-location-empty">Không tìm thấy vị trí phù hợp.</p>';
      } else {
        els.stationLocationSearchResults.hidden = false;
        els.stationLocationSearchResults.innerHTML = results
          .map(
            (item, index) => `
              <button type="button" class="station-location-result" data-action="select-station-location-result" data-index="${index}">
                <strong>${escapeHtml(item.address || "Vị trí tìm được")}</strong>
                <small>${escapeHtml(item.district || item.city || "--")}</small>
              </button>
            `
          )
          .join("");
      }
    }

    if (!silent) {
      setStationModalStatus(`Đã tìm thấy ${results.length} vị trí phù hợp.`, false);
    }

    return results;
  }

  function clearStationLocationResults() {
    state.stations.modalSearchResults = [];
    if (els.stationLocationSearchResults) {
      els.stationLocationSearchResults.hidden = true;
      els.stationLocationSearchResults.innerHTML = "";
    }
  }

  function resetStationForm() {
    state.stations.modalMode = "create";
    state.stations.editingId = "";

    if (els.stationEditorId) {
      els.stationEditorId.value = "";
    }
    if (els.stationModalTitle) {
      els.stationModalTitle.textContent = "Tạo mới trạm sạc";
    }
    if (els.stationModalLead) {
      els.stationModalLead.textContent = "Chọn vị trí trên bản đồ hoặc tìm địa điểm để tự điền thông tin trạm sạc.";
    }
    if (els.stationEditorSaveBtn) {
      els.stationEditorSaveBtn.textContent = "Thêm trạm";
    }
    if (els.stationModalImei) els.stationModalImei.value = "";
    if (els.stationModalName) els.stationModalName.value = "";
    if (els.stationLocationSearch) els.stationLocationSearch.value = "";
    if (els.stationModalLat) els.stationModalLat.value = "21.028500";
    if (els.stationModalLng) els.stationModalLng.value = "105.854200";
    if (els.stationModalCity) els.stationModalCity.value = "";
    if (els.stationModalDistrict) els.stationModalDistrict.value = "";
    if (els.stationModalAddress) els.stationModalAddress.value = "";
    if (els.stationModalStatusSelect) els.stationModalStatusSelect.value = "active";
    if (els.stationModalNotes) els.stationModalNotes.value = "";
    if (els.stationModalChargingType) els.stationModalChargingType.value = "";
    if (els.stationModalCurrentType) els.stationModalCurrentType.value = "";
    if (els.stationModalIsActivated) els.stationModalIsActivated.checked = false;
    if (els.stationModalActivatedAt) els.stationModalActivatedAt.value = "";
    if (els.stationModalWarrantyUntil) els.stationModalWarrantyUntil.value = "";
    if (els.stationModalSimType) els.stationModalSimType.value = "";
    if (els.stationModalSimNumber) els.stationModalSimNumber.value = "";
    if (els.stationModalBillingSimNumber) els.stationModalBillingSimNumber.value = "";
    if (els.stationModalSupportPhone) els.stationModalSupportPhone.value = "";
    if (els.stationModalOpen247) els.stationModalOpen247.checked = false;
    if (els.stationModalAmenities) els.stationModalAmenities.value = "";
    setStationModalStatus("");
    clearStationLocationResults();
    setStationModalPreview();

    ensureStationModalMap();
    setStationModalLocation(21.0285, 105.8542, { silent: true });
  }

  function openCreateStationModal() {
    resetStationForm();
    openBackdrop(els.stationModal);
    window.setTimeout(() => state.stations.modalMap?.invalidateSize(), 80);
  }

  function getStationById(stationId) {
    return state.stations.items.find((station) => station.id === stationId) || state.cache.stations?.find((station) => station.id === stationId) || null;
  }

  function openEditStationModal(stationId) {
    const station = getStationById(stationId);

    if (!station) {
      return;
    }

    state.stations.modalMode = "edit";
    state.stations.editingId = station.id;

    if (els.stationEditorId) {
      els.stationEditorId.value = station.id;
    }
    if (els.stationModalTitle) {
      els.stationModalTitle.textContent = "Sửa trạm sạc";
    }
    if (els.stationModalLead) {
      els.stationModalLead.textContent = "Cập nhật thông tin trạm sạc, vị trí trên bản đồ và trạng thái vận hành.";
    }
    if (els.stationEditorSaveBtn) {
      els.stationEditorSaveBtn.textContent = "Lưu thay đổi";
    }
    if (els.stationModalImei) els.stationModalImei.value = station.imei || "";
    if (els.stationModalName) els.stationModalName.value = station.name || "";
    if (els.stationModalAddress) els.stationModalAddress.value = station.address || "";
    if (els.stationModalLat) els.stationModalLat.value = Number(station.location?.lat || 21.0285).toFixed(6);
    if (els.stationModalLng) els.stationModalLng.value = Number(station.location?.lng || 105.8542).toFixed(6);
    if (els.stationModalStatusSelect) els.stationModalStatusSelect.value = station.status || "active";
    if (els.stationModalNotes) els.stationModalNotes.value = station.description || "";
    if (els.stationLocationSearch) els.stationLocationSearch.value = station.address || "";
    if (els.stationModalCity) els.stationModalCity.value = station.city || "";
    if (els.stationModalDistrict) els.stationModalDistrict.value = station.district || "";
    if (els.stationModalChargingType) els.stationModalChargingType.value = station.chargingType || "";
    if (els.stationModalCurrentType) els.stationModalCurrentType.value = station.currentType || "";
    if (els.stationModalIsActivated) els.stationModalIsActivated.checked = Boolean(station.isActivated);
    if (els.stationModalActivatedAt) {
      els.stationModalActivatedAt.value = formatDateInput(station.activatedAt);
    }
    if (els.stationModalWarrantyUntil) {
      els.stationModalWarrantyUntil.value = formatDateInput(station.warrantyUntil);
    }
    if (els.stationModalSimType) els.stationModalSimType.value = station.simType || "";
    if (els.stationModalSimNumber) els.stationModalSimNumber.value = station.simNumber || "";
    if (els.stationModalBillingSimNumber) {
      els.stationModalBillingSimNumber.value = station.billingSimNumber || "";
    }
    if (els.stationModalSupportPhone) els.stationModalSupportPhone.value = station.supportPhone || "";
    if (els.stationModalOpen247) els.stationModalOpen247.checked = Boolean(station.open24_7);
    if (els.stationModalAmenities) {
      els.stationModalAmenities.value = Array.isArray(station.amenities)
        ? station.amenities.join(", ")
        : "";
    }
    setStationModalStatus("");
    clearStationLocationResults();
    setStationModalPreview();

    ensureStationModalMap();
    setStationModalLocation(
      Number(station.location?.lat || 21.0285),
      Number(station.location?.lng || 105.8542),
      { silent: true }
    );

    openBackdrop(els.stationModal);
    window.setTimeout(() => state.stations.modalMap?.invalidateSize(), 80);
  }

  async function submitStationForm() {
    const imei = els.stationModalImei?.value.trim() || "";
    const name = els.stationModalName?.value.trim() || "";
    const address = els.stationModalAddress?.value.trim() || "";
    const lat = Number(els.stationModalLat?.value || 0);
    const lng = Number(els.stationModalLng?.value || 0);
    const status = els.stationModalStatusSelect?.value || "active";
    const city = els.stationModalCity?.value.trim() || "";
    const district = els.stationModalDistrict?.value.trim() || "";
    const description = els.stationModalNotes?.value.trim() || "";
    const chargingType = els.stationModalChargingType?.value.trim() || "";
    const currentType = els.stationModalCurrentType?.value.trim() || "";
    const isActivated = Boolean(els.stationModalIsActivated?.checked);
    const activatedAtInput = els.stationModalActivatedAt?.value || "";
    const activatedAt = isActivated ? activatedAtInput || getTodayInputValue() : activatedAtInput || null;
    const warrantyUntil = els.stationModalWarrantyUntil?.value || null;
    const simType = els.stationModalSimType?.value.trim() || "";
    const simNumber = els.stationModalSimNumber?.value.trim() || "";
    const billingSimNumber = els.stationModalBillingSimNumber?.value.trim() || "";
    const supportPhone = els.stationModalSupportPhone?.value.trim() || "";
    const open24_7 = Boolean(els.stationModalOpen247?.checked);
    const amenities = (els.stationModalAmenities?.value || "")
      .split(/[\n,;]/)
      .map((item) => item.trim())
      .filter(Boolean);
    const isEdit = state.stations.modalMode === "edit" && state.stations.editingId;

    if (!name || !address || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      setStationModalStatus("Vui lòng nhập tên, địa chỉ và chọn vị trí trên bản đồ.", true);
      return;
    }

    try {
      setStationModalStatus(isEdit ? "Đang cập nhật trạm sạc..." : "Đang tạo trạm sạc...", false);

      await requestJson(isEdit ? `/api/admin/stations/${state.stations.editingId}` : "/api/admin/stations", {
        method: isEdit ? "PATCH" : "POST",
        body: JSON.stringify({
          imei,
          name,
          address,
          city,
          district,
          description,
          location: { lat, lng },
          status,
          chargingType,
          currentType,
          isActivated,
          activatedAt,
          warrantyUntil,
          simType,
          simNumber,
          billingSimNumber,
          supportPhone,
          open24_7,
          amenities
        })
      });

      closeStationModalDialog();
      state.cache.stations = null;
      state.cache["charging-points"] = null;
      await renderCurrentPanel(true);
      setStatus(isEdit ? "Đã cập nhật trạm sạc." : "Đã tạo trạm sạc mới.");
    } catch (error) {
      setStationModalStatus(error.message || "Không thể lưu trạm sạc.", true);
    }
  }

  function closeStationModalDialog() {
    clearStationLocationResults();
    setStationModalStatus("");
    closeBackdrop(els.stationModal);
  }

  function openBackdrop(backdrop) {
    if (!backdrop) {
      return;
    }

    backdrop.classList.add("open");
    backdrop.setAttribute("aria-hidden", "false");
  }

  function closeBackdrop(backdrop) {
    if (!backdrop) {
      return;
    }

    backdrop.classList.remove("open");
    backdrop.setAttribute("aria-hidden", "true");
  }

  function activateAccountTab(tab) {
    state.accounts.currentTab = tab;
    els.accountTabs.forEach((button) => {
      const isActive = button.dataset.accountTab === tab;
      button.classList.toggle("active", isActive);
    });
    els.accountPanels.forEach((panel) => {
      const isActive = panel.dataset.accountPanel === tab;
      panel.classList.toggle("active", isActive);
      panel.hidden = !isActive;
    });
  }

  function getAccountById(accountId) {
    if (!accountId) {
      return null;
    }

    if (state.accounts.profile?.id === accountId) {
      return state.accounts.profile;
    }

    return state.accounts.items.find((item) => item.id === accountId) || null;
  }

  function getChildrenOf(parentId) {
    return state.accounts.items.filter((item) => item.createdById === parentId);
  }

  function isDescendantOf(item, parentId) {
    if (!parentId || !item.createdById) {
      return false;
    }

    if (item.createdById === parentId) {
      return true;
    }

    let currentParentId = item.createdById;
    const visited = new Set();

    while (currentParentId) {
      if (currentParentId === parentId) {
        return true;
      }

      if (visited.has(currentParentId)) {
        break;
      }

      visited.add(currentParentId);
      currentParentId = getAccountById(currentParentId)?.createdById || "";
    }

    return false;
  }

  function isEditingAccountOrDescendant(accountId) {
    if (!state.accounts.editingId) {
      return false;
    }

    if (state.accounts.editingId === accountId) {
      return true;
    }

    const account = getAccountById(accountId);
    return account ? isDescendantOf(account, state.accounts.editingId) : false;
  }

  function getAccountRowsForSelection() {
    const selectedParentId = state.accounts.selectedParentId || state.accounts.profile?.id || "";
    const keyword = state.accounts.searchKeyword.trim().toLowerCase();
    const email = state.accounts.searchEmail.trim().toLowerCase();

    return state.accounts.items.filter((item) => {
      const matchesScope =
        selectedParentId === state.accounts.profile?.id
          ? true
          : item.id === selectedParentId || isDescendantOf(item, selectedParentId);
      const matchesKeyword =
        !keyword ||
        [item.username, item.fullName, item.permissionGroup?.name || "", item.userType || ""]
          .join(" ")
          .toLowerCase()
          .includes(keyword);
      const matchesEmail = !email || item.email.toLowerCase().includes(email);
      const matchesChild = !state.accounts.filterChildOnly || item.childCount > 0;
      const matchesLeaf = !state.accounts.filterLeafOnly || item.childCount === 0;

      return matchesScope && matchesKeyword && matchesEmail && matchesChild && matchesLeaf;
    });
  }

  function ensureExpandedForSelection() {
    const selectedParentId = state.accounts.selectedParentId;

    if (!selectedParentId) {
      return;
    }

    let current = getAccountById(selectedParentId);
    const visited = new Set();

    while (current?.createdById) {
      if (visited.has(current.createdById)) {
        break;
      }

      visited.add(current.createdById);
      state.accounts.expandedTreeIds.add(current.createdById);
      current = getAccountById(current.createdById);
    }
  }

  function renderAccountTreeNodes(parentId) {
    const children = getChildrenOf(parentId).sort((left, right) =>
      String(left.username || "").localeCompare(String(right.username || ""), "vi")
    );

    if (!children.length) {
      return "";
    }

    return children
      .map((child) => {
        const hasChildren = child.childCount > 0;
        const isExpanded = state.accounts.expandedTreeIds.has(child.id);
        const isActive = state.accounts.selectedParentId === child.id ? " active" : "";

        return `
          <div class="parent-tree-node-wrap">
            <div class="parent-tree-node">
              ${
                hasChildren
                  ? `<button type="button" class="parent-tree-toggle" data-action="toggle-tree-node" data-id="${escapeHtml(
                      child.id
                    )}">${isExpanded ? "▾" : "▸"}</button>`
                  : '<span class="parent-tree-toggle">•</span>'
              }
              <button type="button" class="parent-tree-select${isActive}" data-action="select-account-node" data-id="${escapeHtml(
                child.id
              )}">
                <span class="parent-tree-copy">
                  <strong>${escapeHtml(child.username || child.fullName)}</strong>
                  <small>${escapeHtml(child.fullName || "--")}</small>
                </span>
                <span class="parent-tree-meta">${child.childCount} con</span>
              </button>
            </div>
            ${
              hasChildren && isExpanded
                ? `<div class="parent-tree-node-children">${renderAccountTreeNodes(child.id)}</div>`
                : ""
            }
          </div>
        `;
      })
      .join("");
  }

  function renderAccountPanel() {
    const rows = getAccountRowsForSelection();
    ensureExpandedForSelection();
    setSummary([]);

    if (!els.managementContent) {
      return;
    }

    els.managementContent.innerHTML = `
      <section class="management-card account-simple-panel">
        <div class="management-panel-header account-simple-header">
          <div>
            <h2>Người dùng</h2>
          </div>
          <button type="button" class="primary-btn" data-action="open-account-create">+ Tạo mới</button>
        </div>

        <div class="account-table-card" style="padding: 18px 20px 20px;">
          <div class="account-list-toolbar">
            <div class="management-form-field">
              <label for="accountKeywordSearch">Tài khoản hoặc họ tên</label>
              <input id="accountKeywordSearch" type="search" value="${escapeHtml(
                state.accounts.searchKeyword
              )}" placeholder="Tài khoản hoặc họ tên">
            </div>
            <div class="management-form-field">
              <label for="accountEmailSearch">Email</label>
              <input id="accountEmailSearch" type="search" value="${escapeHtml(
                state.accounts.searchEmail
              )}" placeholder="Email">
            </div>
            <div class="account-filter-checks">
              <label><input id="accountFilterChildOnly" type="checkbox" ${
                state.accounts.filterChildOnly ? "checked" : ""
              }> Tài khoản con</label>
              <label><input id="accountFilterLeafOnly" type="checkbox" ${
                state.accounts.filterLeafOnly ? "checked" : ""
              }> Người dùng</label>
              <button type="button" class="primary-btn account-search-btn" data-action="apply-account-search">Tìm kiếm</button>
              <button type="button" class="outline-btn" data-action="reset-account-filters">Đặt lại</button>
            </div>
          </div>
          <div class="management-table-card">
            ${
              rows.length
                ? `
                  <div class="management-table-scroll">
                    <table class="management-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Tài khoản</th>
                          <th>Vai trò</th>
                          <th>Họ và tên</th>
                          <th>Số điện thoại</th>
                          <th>Email</th>
                          <th>Trạng thái</th>
                          <th>Ngày tạo</th>
                          <th>Chức năng</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${rows
                          .map(
                            (item, index) => `
                              <tr>
                                <td>${index + 1}</td>
                                <td>
                                  <strong>${escapeHtml(item.username || "--")}</strong>
                                </td>
                                <td>${escapeHtml(item.permissionGroup?.name || "Mac dinh")}</td>
                                <td>${escapeHtml(item.fullName || "--")}</td>
                                <td>${escapeHtml(item.phone || "--")}</td>
                                <td>${escapeHtml(item.email || "--")}</td>
                                <td>${renderStatusBadge(item.status)}</td>
                                <td>${escapeHtml(formatDate(item.createdAt))}</td>
                                <td>
                                  <div class="management-table-actions">
                                    <button type="button" class="management-mini-btn" data-action="open-account-edit" data-id="${escapeHtml(
                                      item.id
                                    )}">Sửa</button>
                                    <button type="button" class="management-mini-btn" data-action="open-account-reset-password" data-id="${escapeHtml(
                                      item.id
                                    )}">Đặt lại MK</button>
                                    <button type="button" class="management-mini-btn primary" data-action="open-account-delete" data-id="${escapeHtml(
                                      item.id
                                    )}">Xóa</button>
                                  </div>
                                </td>
                              </tr>
                            `
                          )
                          .join("")}
                      </tbody>
                    </table>
                  </div>
                `
                : '<p class="management-empty">Không có tài khoản phù hợp với bộ lọc hiện tại.</p>'
            }
          </div>
        </div>
     </section>
    `;
  }

  function renderParentTreeNodes(parentId) {
    const query = state.accounts.parentSearch.trim().toLowerCase();
    const children = getChildrenOf(parentId).sort((left, right) =>
      String(left.username || "").localeCompare(String(right.username || ""), "vi")
    );

    const visibleChildren = children.filter((child) => {
      if (isEditingAccountOrDescendant(child.id)) {
        return false;
      }

      if (!query) {
        return true;
      }

      const matchesSelf = [child.username, child.fullName, child.email]
        .join(" ")
        .toLowerCase()
        .includes(query);

      const hasVisibleDescendant = getChildrenOf(child.id).some((descendant) =>
        [descendant.username, descendant.fullName, descendant.email]
          .join(" ")
          .toLowerCase()
          .includes(query)
      );

      return matchesSelf || hasVisibleDescendant;
    });

    if (!visibleChildren.length) {
      return "";
    }

    return visibleChildren
      .map((child) => {
        const hasChildren = child.childCount > 0;
        const isExpanded = state.accounts.parentExpandedIds.has(child.id) || Boolean(query);
        const isActive = state.accounts.modalParentId === child.id ? " active" : "";

        return `
          <div class="parent-tree-node-wrap">
            <div class="parent-tree-node">
              ${
                hasChildren
                  ? `<button type="button" class="parent-tree-toggle" data-action="toggle-modal-parent-node" data-id="${escapeHtml(
                      child.id
                    )}">${isExpanded ? "▾" : "▸"}</button>`
                  : '<span class="parent-tree-toggle">•</span>'
              }
              <button type="button" class="parent-tree-select${isActive}" data-action="select-modal-parent" data-id="${escapeHtml(
                child.id
              )}">
                <span class="parent-tree-copy">
                  <strong>${escapeHtml(child.username || "--")}</strong>
                  <small>${escapeHtml(child.fullName || "--")}</small>
                </span>
                <span class="parent-tree-meta">${child.childCount} con</span>
              </button>
            </div>
            ${
              hasChildren && isExpanded
                ? `<div class="parent-tree-node-children">${renderParentTreeNodes(child.id)}</div>`
                : ""
            }
          </div>
        `;
      })
      .join("");
  }

  function renderParentTree() {
    if (!els.accountParentTree) {
      return;
    }

    const root = state.accounts.profile;

    els.accountParentTree.innerHTML = `
      <div class="parent-tree-node-wrap">
        <div class="parent-tree-node">
          <span class="parent-tree-toggle">•</span>
          <button type="button" class="parent-tree-select${
            state.accounts.modalParentId === root?.id ? " active" : ""
          }" data-action="select-modal-parent" data-id="${escapeHtml(root?.id || "")}">
            <span class="parent-tree-copy">
              <strong>${escapeHtml(root?.username || "admin")}</strong>
              <small>${escapeHtml(root?.fullName || "Tài khoản gốc")}</small>
            </span>
            <span class="parent-tree-meta">${getChildrenOf(root?.id || "").length} con</span>
          </button>
        </div>
      </div>
      ${renderParentTreeNodes(root?.id || "") || '<p class="management-empty">Không có tài khoản cha khả dụng.</p>'}
    `;

    const selectedParent = getAccountById(state.accounts.modalParentId) || root;

    if (els.accountSelectedParent) {
      els.accountSelectedParent.value = selectedParent?.username || "Tài khoản gốc";
    }
  }

  function populatePermissionGroupSelect(selectedId = "") {
    if (!els.accountPermissionGroup) {
      return;
    }

    els.accountPermissionGroup.innerHTML = `
      <option value="">Chon vai tro</option>
      ${state.permissionGroups.items
        .map(
          (group) => `
            <option value="${escapeHtml(group.id)}" ${
              selectedId === group.id ? "selected" : ""
            }>${escapeHtml(group.name)}</option>
          `
        )
        .join("")}
    `;
  }

  function renderRoleParentOptions(selectedId = "__root__", currentRoleId = "") {
    if (!els.permissionGroupModalParentId) {
      return;
    }

    const options = state.permissionGroups.items
      .filter((group) => group.id !== currentRoleId)
      .map(
        (group) => `
          <option value="${escapeHtml(group.id)}" ${
            selectedId === group.id ? "selected" : ""
          }>${escapeHtml(group.name)}</option>
        `
      )
      .join("");

    els.permissionGroupModalParentId.innerHTML = `
      <option value="__root__" ${selectedId === "__root__" ? "selected" : ""}>Vai tro goc</option>
      ${options}
    `;
  }

  function renderPermissionGroupOptions(selectedGroupKey = "") {
    if (!els.permissionModalGroupKey) {
      return;
    }

    els.permissionModalGroupKey.innerHTML = `
      <option value="">Chon nhom quyen</option>
      ${state.permissions.groups
        .map(
          (group) => `
            <option value="${escapeHtml(group.key)}" ${
              selectedGroupKey === group.key ? "selected" : ""
            }>${escapeHtml(group.name)}</option>
          `
        )
        .join("")}
    `;
  }

  function resetAccountForm() {
    state.accounts.modalMode = "create";
    state.accounts.editingId = "";
    state.accounts.modalParentId = state.accounts.selectedParentId || state.accounts.profile?.id || "";
    state.accounts.parentSearch = "";
    state.accounts.parentExpandedIds = new Set([state.accounts.modalParentId]);
    setAccountModalStatus("");

    if (els.accountEditorId) {
      els.accountEditorId.value = "";
    }

    if (els.accountModalTitle) {
      els.accountModalTitle.textContent = "Tạo mới người dùng";
    }

    if (els.accountModalLead) {
      els.accountModalLead.textContent =
        "Điều chỉnh thông tin cơ bản, vai trò và tài khoản cha cho người dùng này.";
    }

    if (els.accountEditorSaveBtn) {
      els.accountEditorSaveBtn.textContent = "Thêm";
    }

    if (els.accountUsername) {
      els.accountUsername.value = "";
    }

    if (els.accountFullName) {
      els.accountFullName.value = "";
    }

    if (els.accountPhone) {
      els.accountPhone.value = "";
    }

    if (els.accountEmail) {
      els.accountEmail.value = "";
    }

    if (els.accountUserType) {
      els.accountUserType.value = "Người dùng";
    }

    if (els.accountDescription) {
      els.accountDescription.value = "";
    }

    if (els.accountAddress) {
      els.accountAddress.value = "";
    }

    if (els.accountLandingPage) {
      els.accountLandingPage.value = "map";
    }

    if (els.accountStatus) {
      els.accountStatus.value = "active";
    }

    if (els.accountWalletBalance) {
      els.accountWalletBalance.value = "0";
    }

    if (els.accountPassword) {
      els.accountPassword.value = "";
      els.accountPassword.required = true;
      els.accountPassword.placeholder = "Nhập mật khẩu cho tài khoản";
    }

    populatePermissionGroupSelect("");
    activateAccountTab("basic");
    renderParentTree();
  }

  function openCreateAccountModal() {
    resetAccountForm();
    openBackdrop(els.accountModal);
  }

  function openEditAccountModal(accountId) {
    const account = getAccountById(accountId);

    if (!account) {
      return;
    }

    state.accounts.modalMode = "edit";
    state.accounts.editingId = account.id;
    state.accounts.modalParentId = account.createdById || state.accounts.profile?.id || "";
    state.accounts.parentSearch = "";
    state.accounts.parentExpandedIds = new Set([state.accounts.modalParentId]);
    setAccountModalStatus("");

    if (els.accountEditorId) {
      els.accountEditorId.value = account.id;
    }

    if (els.accountModalTitle) {
      els.accountModalTitle.textContent = "Sửa người dùng";
    }

    if (els.accountModalLead) {
      els.accountModalLead.textContent = "Cập nhật thông tin, tài khoản cha và vai trò cho người dùng.";
    }

    if (els.accountEditorSaveBtn) {
      els.accountEditorSaveBtn.textContent = "Lưu thay đổi";
    }

    if (els.accountUsername) {
      els.accountUsername.value = account.username || "";
    }

    if (els.accountFullName) {
      els.accountFullName.value = account.fullName || "";
    }

    if (els.accountPhone) {
      els.accountPhone.value = account.phone || "";
    }

    if (els.accountEmail) {
      els.accountEmail.value = account.email || "";
    }

    if (els.accountUserType) {
      els.accountUserType.value = account.userType || "Người dùng";
    }

    if (els.accountDescription) {
      els.accountDescription.value = account.description || "";
    }

    if (els.accountAddress) {
      els.accountAddress.value = account.address || "";
    }

    if (els.accountLandingPage) {
      els.accountLandingPage.value = account.landingPage || "map";
    }

    if (els.accountStatus) {
      els.accountStatus.value = account.status || "active";
    }

    if (els.accountWalletBalance) {
      els.accountWalletBalance.value = String(account.walletBalance || 0);
    }

    if (els.accountPassword) {
      els.accountPassword.value = "";
      els.accountPassword.required = false;
      els.accountPassword.placeholder = "Bỏ trống nếu không đổi mật khẩu";
    }

    populatePermissionGroupSelect(account.permissionGroup?.id || "");
    activateAccountTab("basic");
    renderParentTree();
    openBackdrop(els.accountModal);
  }

  function openConfirmModal(options) {
    state.confirmAction = options.onConfirm || null;

    if (els.accountConfirmTitle) {
      els.accountConfirmTitle.textContent = options.title || "Xác nhận thao tác";
    }

    if (els.accountConfirmMessage) {
      els.accountConfirmMessage.textContent = options.message || "Bạn có chắc chắn muốn tiếp tục?";
    }

    if (els.accountConfirmHint) {
      els.accountConfirmHint.textContent = options.hint || "";
    }

    if (els.accountConfirmSubmitBtn) {
      els.accountConfirmSubmitBtn.textContent = options.confirmLabel || "Xác nhận";
    }

    openBackdrop(els.accountConfirmModal);
  }

  function closeConfirmModal() {
    state.confirmAction = null;
    closeBackdrop(els.accountConfirmModal);
  }

  async function loadPermissionGroups(forceRefresh = false) {
    if (!hasSession()) {
      return;
    }

    if (
      !forceRefresh &&
      state.permissionGroups.items.length &&
      state.permissionGroups.catalog.length
    ) {
      return;
    }

    const [data, catalogData] = await Promise.all([
      requestJson("/api/admin/roles"),
      requestJson("/api/admin/roles/catalog")
    ]);

    state.permissionGroups.items = Array.isArray(data.items) ? data.items : [];
    state.permissionGroups.catalog = Array.isArray(catalogData.items) ? catalogData.items : [];
  }

  async function loadPermissions(forceRefresh = false) {
    if (!hasSession()) {
      return;
    }

    if (!forceRefresh && state.permissions.items.length && state.permissions.groups.length) {
      return;
    }

    const [data, groupData] = await Promise.all([
      requestJson("/api/admin/permissions"),
      requestJson("/api/admin/permissions/groups")
    ]);

    state.permissions.items = Array.isArray(data.items) ? data.items : [];
    state.permissions.groups = Array.isArray(groupData.items) ? groupData.items : [];
  }

  async function loadLoginPages(forceRefresh = false) {
    if (!hasSession()) {
      return;
    }

    if (!forceRefresh && state.loginPages.items.length) {
      return;
    }

    const data = await requestJson("/api/admin/login-pages");
    state.loginPages.items = Array.isArray(data.items) ? data.items : [];
  }

  async function loadSimTypes(forceRefresh = false) {
    if (!hasSession()) {
      return;
    }

    if (!forceRefresh && state.simTypes.items.length) {
      return;
    }

    const data = await requestJson("/api/admin/sim-types");
    state.simTypes.items = Array.isArray(data.items) ? data.items : [];
  }

  async function loadDeviceTypes(forceRefresh = false) {
    if (!hasSession()) {
      return;
    }

    if (!forceRefresh && state.deviceTypes.items.length) {
      return;
    }

    const data = await requestJson("/api/admin/device-types");
    state.deviceTypes.items = Array.isArray(data.items) ? data.items : [];
  }

  async function loadConnectorTypes(forceRefresh = false) {
    if (!hasSession()) {
      return;
    }

    if (!forceRefresh && state.connectorTypes.items.length) {
      return;
    }

    const data = await requestJson("/api/admin/connector-types");
    state.connectorTypes.items = Array.isArray(data.items) ? data.items : [];
  }

  async function loadAccounts(forceRefresh = false) {
    if (!hasSession()) {
      return;
    }

    if (!forceRefresh && state.accounts.profile && state.accounts.items.length) {
      return;
    }

    const [profileData, treeData] = await Promise.all([
      requestJson("/api/admin/auth/me"),
      requestJson("/api/admin/users/tree")
    ]);

    state.accounts.profile = profileData.user;
    state.accounts.items = Array.isArray(treeData.items) ? treeData.items : [];
    state.accounts.tree = Array.isArray(treeData.tree) ? treeData.tree : [];

    if (!state.accounts.selectedParentId || !getAccountById(state.accounts.selectedParentId)) {
      state.accounts.selectedParentId = state.accounts.profile.id;
    }

    state.accounts.expandedTreeIds = new Set([state.accounts.profile.id]);
    ensureExpandedForSelection();
  }

  function renderStationManagementSummary(items) {
    const totalPorts = items.reduce((sum, item) => sum + Number(item.totalPorts || 0), 0);
    const availablePorts = items.reduce((sum, item) => sum + Number(item.availablePorts || 0), 0);

    setSummary([
      { label: "Tổng trạm", value: String(items.length) },
      { label: "Sẵn sàng", value: String(getStationStatusCount(items, "ready")) },
      { label: "Đầy", value: String(getStationStatusCount(items, "full")) },
      { label: "Cổng sạc khả dụng", value: `${availablePorts}/${totalPorts}` },
      {
        label: "Lần đồng bộ",
        value: state.stations.lastSyncAt ? formatDate(state.stations.lastSyncAt) : "--"
      }
    ]);
  }

  function renderStationSearchToolbar() {
    const statusOptions = [
      { key: "all", label: "Tất cả" },
      { key: "ready", label: "Sẵn sàng" },
      { key: "full", label: "Đầy" },
      { key: "maintenance", label: "Bảo trì" },
      { key: "inactive", label: "Chưa hoạt động" },
      { key: "closed", label: "Đóng cửa" }
    ];

    return `
      <div class="station-admin-search-grid">
        <div class="management-form-field">
          <label for="stationAdminSearchImei">IMEI</label>
          <input id="stationAdminSearchImei" type="search" value="${escapeHtml(
            state.stations.searchImei
          )}" placeholder="Nhập IMEI">
        </div>
        <div class="management-form-field">
          <label for="stationAdminSearchName">Tên trạm</label>
          <input id="stationAdminSearchName" type="search" value="${escapeHtml(
            state.stations.searchName
          )}" placeholder="Nhập tên trạm">
        </div>
        <div class="management-form-field">
          <label for="stationAdminSearchAddress">Địa chỉ</label>
          <input id="stationAdminSearchAddress" type="search" value="${escapeHtml(
            state.stations.searchAddress
          )}" placeholder="Nhập địa chỉ">
        </div>
        <div class="station-admin-search-actions">
          <button type="button" class="primary-btn" data-action="apply-station-search">Tìm kiếm</button>
          <button type="button" class="outline-btn" data-action="reset-station-search">Đặt lại</button>
        </div>
      </div>
      <div class="station-admin-filter-row">
        ${statusOptions
          .map(
            (option) => `
              <button
                type="button"
                class="station-admin-filter-btn${state.stations.statusFilter === option.key ? " active" : ""}"
                data-action="station-status-filter"
                data-status="${escapeHtml(option.key)}"
              >
                ${escapeHtml(option.label)}
              </button>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderStationInfoPanel() {
    const items = getFilteredStationManagementItems();
    renderStationManagementSummary(items);

    if (!els.managementContent) {
      return;
    }

    els.managementContent.innerHTML = `
      <section class="management-card station-admin-panel">
        <div class="management-panel-header">
          <div>
            <h2>Thông tin trạm sạc</h2>
            <p>Hiển thị các trạm sạc của người quản trị, hỗ trợ tìm theo IMEI, tên trạm và địa chỉ.</p>
          </div>
          <div class="station-admin-panel-actions">
            <button type="button" class="outline-btn" data-action="open-station-map-panel">Bản đồ</button>
            <button type="button" class="primary-btn" data-action="open-station-create">+ Tạo mới</button>
          </div>
        </div>
        ${renderStationSearchToolbar()}
        <div class="management-table-card">
          ${
            items.length
              ? `
                <div class="management-table-scroll">
                  <table class="management-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Tài khoản</th>
                        <th>IMEI</th>
                        <th>Tên trạm</th>
                        <th>Loại sạc</th>
                        <th>Địa chỉ</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                        <th>Chức năng</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${items
                        .map(
                          (item, index) => `
                            <tr>
                              <td>${index + 1}</td>
                              <td>${escapeHtml(item.ownerName || "admin")}</td>
                              <td>${escapeHtml(item.imei || "--")}</td>
                              <td><strong>${escapeHtml(item.name || "--")}</strong></td>
                              <td>${escapeHtml(item.chargingType || "Xe máy điện")}</td>
                              <td>${escapeHtml(item.address || "--")}</td>
                              <td>${renderMappedStatusBadge(item.realtimeStatusKey, item.realtimeStatusLabel)}</td>
                              <td>${escapeHtml(formatDate(item.createdAt))}</td>
                              <td>
                                <div class="management-table-actions">
                                  <button type="button" class="management-mini-btn" data-action="open-station-map-from-info" data-id="${escapeHtml(
                                    item.id
                                  )}">Bản đồ</button>
                                  <button type="button" class="management-mini-btn" data-action="entity-edit" data-panel="stations" data-id="${escapeHtml(
                                    item.id
                                  )}">Sửa</button>
                                  <button type="button" class="management-mini-btn primary" data-action="entity-delete" data-panel="stations" data-id="${escapeHtml(
                                    item.id
                                  )}">Xóa</button>
                                </div>
                              </td>
                            </tr>
                          `
                        )
                        .join("")}
                    </tbody>
                  </table>
                </div>
              `
              : '<p class="management-empty">Không có trạm sạc phù hợp với bộ lọc hiện tại.</p>'
          }
        </div>
      </section>
    `;
  }

  function renderStationMapPopup(item) {
    return `
      <div class="station-admin-popup">
        <strong>${escapeHtml(item.name || "--")}</strong>
        <p>IMEI: ${escapeHtml(item.imei || "--")}</p>
        <p>${escapeHtml(item.address || "--")}</p>
        <p>Loại sạc: ${escapeHtml(item.chargingType || "--")} | Dòng điện: ${escapeHtml(item.currentType || "--")}</p>
        <p>Kích hoạt: ${item.isActivated ? "Có" : "Không"} | 24/7: ${item.open24_7 ? "Có" : "Không"}</p>
        <p>${escapeHtml(item.realtimeStatusLabel || "--")} | ${escapeHtml(item.availablePorts)}/${escapeHtml(
          item.totalPorts
        )} cổng sẵn sàng</p>
      </div>
    `;
  }

  function renderStationManagementMarkers(items, viewport = null) {
    if (!state.stations.map || !window.L) {
      return;
    }

    state.stations.markers = new Map();

    if (state.stations.markerLayer) {
      state.stations.markerLayer.remove();
    }

    const markerLayer = window.L.layerGroup();
    const bounds = [];

    items.forEach((item) => {
      const lat = Number(item.location?.lat);
      const lng = Number(item.location?.lng);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return;
      }

      const marker = window.L.marker([lat, lng], {
        icon: window.L.divIcon({
          className: "station-admin-marker-wrap",
          html: `<div class="station-admin-marker ${escapeHtml(item.realtimeStatusKey)}"><span>${escapeHtml(
            (item.imei || item.name || "EV").slice(0, 2).toUpperCase()
          )}</span></div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
          popupAnchor: [0, -28]
        })
      })
        .bindPopup(renderStationMapPopup(item))
        .on("click", () => {
          state.stations.selectedId = item.id;
          renderStationMapPanel({ preserveViewport: true });
        });

      marker.addTo(markerLayer);
      state.stations.markers.set(item.id, marker);
      bounds.push([lat, lng]);
    });

    markerLayer.addTo(state.stations.map);
    state.stations.markerLayer = markerLayer;

    const selectedItem = getSelectedStationManagementItem(items);
    const selectedMarker = selectedItem ? state.stations.markers.get(selectedItem.id) : null;

    if (viewport?.center) {
      state.stations.map.setView([viewport.center.lat, viewport.center.lng], viewport.zoom);
    } else if (selectedItem) {
      state.stations.map.setView(
        [Number(selectedItem.location?.lat) || 21.0285, Number(selectedItem.location?.lng) || 105.8542],
        14
      );
    } else if (bounds.length > 1) {
      state.stations.map.fitBounds(bounds, { padding: [28, 28] });
    } else if (bounds.length === 1) {
      state.stations.map.setView(bounds[0], 13);
    }

    if (selectedMarker) {
      selectedMarker.openPopup();
    }
  }

  function startStationMapPolling() {
    if (state.currentPanel !== "station-map" || state.stations.pollTimer) {
      return;
    }

    state.stations.pollTimer = window.setInterval(async () => {
      if (state.currentPanel !== "station-map") {
        teardownStationManagementMap();
        return;
      }

      const viewport = state.stations.map
        ? {
            center: state.stations.map.getCenter(),
            zoom: state.stations.map.getZoom()
          }
        : null;

      try {
        await loadStationManagementData(true);
        renderStationMapPanel({ preserveViewport: true, viewport, silent: true });
      } catch (error) {
        setStatus(error.message || "Không thể làm mới trạng thái trạm sạc.", true);
      }
    }, 30000);
  }

  function renderStationMapPanel(options = {}) {
    const items = getFilteredStationManagementItems();
    const selectedItem = getSelectedStationManagementItem(items);
    const viewport =
      options.viewport ||
      (options.preserveViewport && state.stations.map
        ? {
            center: state.stations.map.getCenter(),
            zoom: state.stations.map.getZoom()
          }
        : null);

    renderStationManagementSummary(items);
    teardownStationManagementMap();

    if (!els.managementContent) {
      return;
    }

    els.managementContent.innerHTML = `
      <section class="management-card station-admin-panel">
        <div class="management-panel-header">
          <div>
            <h2>Bản đồ trạm sạc</h2>
            <p>Hiển thị các trạm sạc của người quản trị theo từng trạng thái và cập nhật lại dữ liệu định kỳ.</p>
          </div>
          <div class="station-admin-panel-actions">
            <button type="button" class="outline-btn" data-action="open-station-info-panel">Thông tin</button>
            <button type="button" class="primary-btn" data-action="refresh-station-map">Làm mới trạng thái</button>
          </div>
        </div>
        ${renderStationSearchToolbar()}
        <div class="station-admin-status-row">
          <article class="station-admin-status-card">
            <span>Sẵn sàng</span>
            <strong>${getStationStatusCount(items, "ready")}</strong>
          </article>
          <article class="station-admin-status-card">
            <span>Đầy</span>
            <strong>${getStationStatusCount(items, "full")}</strong>
          </article>
          <article class="station-admin-status-card">
            <span>Bảo trì</span>
            <strong>${getStationStatusCount(items, "maintenance")}</strong>
          </article>
          <article class="station-admin-status-card">
            <span>Chưa hoạt động</span>
            <strong>${getStationStatusCount(items, "inactive")}</strong>
          </article>
          <article class="station-admin-status-card">
            <span>Đóng cửa</span>
            <strong>${getStationStatusCount(items, "closed")}</strong>
          </article>
        </div>
        <div class="station-admin-layout">
          <aside class="station-admin-sidebar">
            <section class="station-admin-detail-card">
              <div class="station-admin-detail-head">
                <div>
                  <p>Trạm đang chọn</p>
                  <h3>${escapeHtml(selectedItem?.name || "Chưa có trạm")}</h3>
                </div>
                ${selectedItem ? renderMappedStatusBadge(selectedItem.realtimeStatusKey, selectedItem.realtimeStatusLabel) : ""}
              </div>
              <dl class="station-admin-detail-grid">
                <div>
                  <dt>IMEI</dt>
                  <dd>${escapeHtml(selectedItem?.imei || "--")}</dd>
                </div>
                <div>
                  <dt>Tài khoản</dt>
                  <dd>${escapeHtml(selectedItem?.ownerName || "--")}</dd>
                </div>
                <div>
                  <dt>Địa chỉ</dt>
                  <dd>${escapeHtml(selectedItem?.address || "--")}</dd>
                </div>
                <div>
                  <dt>Loại sạc</dt>
                  <dd>${escapeHtml(selectedItem?.chargingType || "--")}</dd>
                </div>
                <div>
                  <dt>Cổng sẵn sàng</dt>
                  <dd>${escapeHtml(selectedItem?.availablePorts || 0)}/${escapeHtml(selectedItem?.totalPorts || 0)}</dd>
                </div>
                <div>
                  <dt>Cập nhật</dt>
                  <dd>${escapeHtml(selectedItem ? formatDate(selectedItem.updatedAt) : "--")}</dd>
                </div>
              </dl>
            </section>
            <section class="station-admin-list-card">
              <div class="station-admin-list-head">
                <strong>Danh sách trạm</strong>
                <span>${items.length} trạm</span>
              </div>
              <div class="station-admin-list">
                ${
                  items.length
                    ? items
                        .map(
                          (item) => `
                            <button type="button" class="station-admin-list-item${
                              item.id === selectedItem?.id ? " active" : ""
                            }" data-action="focus-station-map-item" data-id="${escapeHtml(item.id)}">
                              <div class="station-admin-list-copy">
                                <div class="station-admin-list-topline">
                                  <strong>${escapeHtml(item.imei || item.name || "--")}</strong>
                                  <span class="station-admin-list-dot ${escapeHtml(item.realtimeStatusKey)}"></span>
                                </div>
                                <span>${escapeHtml(item.name || "--")}</span>
                                <small>${escapeHtml(item.address || "--")}</small>
                              </div>
                              <div class="station-admin-list-meta">
                                <small>${escapeHtml(item.realtimeStatusLabel)}</small>
                                <small>${escapeHtml(item.availablePorts)}/${escapeHtml(item.totalPorts)} cổng sẵn sàng</small>
                              </div>
                            </button>
                          `
                        )
                        .join("")
                    : '<p class="management-empty">Không có trạm sạc phù hợp với bộ lọc hiện tại.</p>'
                }
              </div>
            </section>
          </aside>
          <section class="station-admin-map-card">
            <div class="station-admin-map-toolbar">
              <span>Dữ liệu realtime cập nhật mỗi 30 giây</span>
              <small>Lần gần nhất: ${escapeHtml(
                state.stations.lastSyncAt ? formatDate(state.stations.lastSyncAt) : "--"
              )}</small>
            </div>
            <div id="stationAdminMap" class="station-admin-map"></div>
          </section>
        </div>
      </section>
    `;

    window.setTimeout(() => {
      const mapElement = document.getElementById("stationAdminMap");

      if (!mapElement || !window.L) {
        return;
      }

      state.stations.map = window.L.map(mapElement, {
        zoomControl: true
      }).setView([21.0285, 105.8542], 12);

      const tileLayer = createManagementTileLayer();

      if (tileLayer) {
        tileLayer.addTo(state.stations.map);
      }

      renderStationManagementMarkers(items, viewport);
      state.stations.map.invalidateSize();
      startStationMapPolling();
    }, 60);

    if (!options.silent) {
      setStatus(`Đã tải ${items.length} trạm sạc trên bản đồ quản trị.`);
    }
  }

  async function renderStationManagementPanel(forceRefresh = false) {
    if (!hasSession()) {
      showLoginPrompt();
      return;
    }

    try {
      setStatus("Đang tải dữ liệu trạm sạc...");
      await loadStationManagementData(forceRefresh);

      if (state.currentPanel === "station-map") {
        renderStationMapPanel();
      } else {
        renderStationInfoPanel();
        ensureStationImportActions();
        setStatus(`Đã tải ${state.stations.items.length} trạm sạc.`);
      }
    } catch (error) {
      setStatus(error.message || "Không thể tải dữ liệu trạm sạc.", true);
    }
  }

  function calculateStationDistanceKm(leftLat, leftLng, rightLat, rightLng) {
    const toRadians = (value) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRadians(rightLat - leftLat);
    const dLng = toRadians(rightLng - leftLng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(leftLat)) *
        Math.cos(toRadians(rightLat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  function buildStationDistributionMetrics(items = []) {
    const points = items
      .map((item) => ({
        ...item,
        lat: Number(item.location?.lat),
        lng: Number(item.location?.lng)
      }))
      .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng));

    const radiusKm = 3;

    return points.map((item) => {
      const nearbyCount = points.reduce((count, neighbor) => {
        const distanceKm = calculateStationDistanceKm(item.lat, item.lng, neighbor.lat, neighbor.lng);
        return distanceKm <= radiusKm ? count + 1 : count;
      }, 0);

      return {
        ...item,
        radiusKm,
        densityScore: nearbyCount
      };
    });
  }

  function getStationDistributionColor(score, maxScore) {
    const safeMax = Math.max(maxScore || 1, 1);
    const ratio = score / safeMax;

    if (ratio >= 0.82) {
      return { fill: "#ff5b37", core: "#ff7a00", opacity: 0.34, label: "Rat cao" };
    }

    if (ratio >= 0.6) {
      return { fill: "#ffb000", core: "#ff8a00", opacity: 0.28, label: "Cao" };
    }

    if (ratio >= 0.35) {
      return { fill: "#cde93b", core: "#89c82d", opacity: 0.22, label: "Trung binh" };
    }

    return { fill: "#72d6c9", core: "#1f9e89", opacity: 0.18, label: "Thap" };
  }

  function renderStationDistributionSummary(allItems, metrics) {
    const maxDensity = Math.max(...metrics.map((item) => item.densityScore), 0);
    const hotspotThreshold = Math.max(3, Math.ceil(maxDensity * 0.6));
    const hotspotCount = metrics.filter((item) => item.densityScore >= hotspotThreshold).length;
    const cityCount = new Set(
      allItems
        .map((item) => String(item.city || "").trim())
        .filter(Boolean)
    ).size;

    setSummary([
      { label: "Tong tram", value: String(allItems.length) },
      { label: "Co toa do hop le", value: String(metrics.length) },
      { label: "Khu vuc mat do cao", value: String(hotspotCount) },
      { label: "Thanh pho / tinh", value: String(cityCount) },
      {
        label: "Lan dong bo",
        value: state.stations.lastSyncAt ? formatDate(state.stations.lastSyncAt) : "--"
      }
    ]);
  }

  function renderStationDistributionPopup(item, maxDensity) {
    const density = getStationDistributionColor(item.densityScore, maxDensity);

    return `
      <div class="station-admin-popup">
        <strong>${escapeHtml(item.name || "--")}</strong>
        <p>${escapeHtml(item.address || "--")}</p>
        <p>Mat do: ${escapeHtml(item.densityScore)} tram trong ban kinh ${escapeHtml(
          item.radiusKm
        )} km</p>
        <p>Muc do: ${escapeHtml(density.label)} | Trang thai: ${escapeHtml(
          item.realtimeStatusLabel || "--"
        )}</p>
        <p>Cong sac kha dung: ${escapeHtml(item.availablePorts || 0)}/${escapeHtml(
          item.totalPorts || 0
        )}</p>
      </div>
    `;
  }

  function renderStationDistributionMap(metrics, viewport = null) {
    if (!state.stations.map || !window.L) {
      return;
    }

    state.stations.markers = new Map();

    if (state.stations.markerLayer) {
      state.stations.markerLayer.remove();
    }

    const markerLayer = window.L.layerGroup();
    const bounds = [];
    const maxDensity = Math.max(...metrics.map((item) => item.densityScore), 1);

    metrics.forEach((item) => {
      const color = getStationDistributionColor(item.densityScore, maxDensity);
      const heatRadius = Math.min(2200, 420 + item.densityScore * 120);

      window.L.circle([item.lat, item.lng], {
        radius: heatRadius,
        stroke: false,
        fillColor: color.fill,
        fillOpacity: color.opacity
      }).addTo(markerLayer);

      const marker = window.L.circleMarker([item.lat, item.lng], {
        radius: 7,
        color: "#ffffff",
        weight: 2,
        fillColor: color.core,
        fillOpacity: 1
      })
        .bindPopup(renderStationDistributionPopup(item, maxDensity))
        .on("click", () => {
          state.stations.selectedId = item.id;
        });

      marker.addTo(markerLayer);
      state.stations.markers.set(item.id, marker);
      bounds.push([item.lat, item.lng]);
    });

    markerLayer.addTo(state.stations.map);
    state.stations.markerLayer = markerLayer;

    const selectedMetric =
      metrics.find((item) => item.id === state.stations.selectedId) || metrics[0] || null;
    const selectedMarker = selectedMetric ? state.stations.markers.get(selectedMetric.id) : null;

    if (viewport?.center) {
      state.stations.map.setView([viewport.center.lat, viewport.center.lng], viewport.zoom);
    } else if (selectedMetric) {
      state.stations.map.setView([selectedMetric.lat, selectedMetric.lng], 13);
    } else if (bounds.length > 1) {
      state.stations.map.fitBounds(bounds, { padding: [28, 28] });
    } else if (bounds.length === 1) {
      state.stations.map.setView(bounds[0], 13);
    }

    if (selectedMarker) {
      selectedMarker.openPopup();
    }
  }

  async function renderStationDistributionPanel(forceRefresh = false) {
    if (!hasSession()) {
      showLoginPrompt();
      return;
    }

    try {
      setStatus("Dang tai du lieu phan bo tram sac...");
      await loadStationManagementData(forceRefresh);

      const allItems = state.stations.items || [];
      const metrics = buildStationDistributionMetrics(allItems);
      const topHotspots = [...metrics]
        .sort((left, right) => right.densityScore - left.densityScore)
        .slice(0, 6);

      if (!topHotspots.some((item) => item.id === state.stations.selectedId)) {
        state.stations.selectedId = topHotspots[0]?.id || metrics[0]?.id || "";
      }

      renderStationDistributionSummary(allItems, metrics);

      if (!els.managementContent) {
        return;
      }

      teardownStationManagementMap();

      els.managementContent.innerHTML = `
        <section class="management-card station-admin-panel station-distribution-panel">
          <div class="management-panel-header">
            <div>
              <h2>Phan bo tram sac</h2>
              <p>Ban do mat do cho biet khu vuc nao dang tap trung nhieu tram sac duoc lap dat.</p>
            </div>
            <div class="station-admin-panel-actions">
              <button type="button" class="outline-btn" data-action="refresh-station-distribution">Lam moi du lieu</button>
            </div>
          </div>
          ${
            metrics.length
              ? `
                <div class="station-admin-layout station-distribution-layout">
                  <aside class="station-admin-sidebar station-distribution-sidebar">
                    <section class="station-admin-detail-card station-distribution-legend-card">
                      <div class="station-admin-detail-head">
                        <div>
                          <p>Chu thich mat do</p>
                          <h3>Ban kinh 3 km</h3>
                        </div>
                        <span class="station-distribution-mini-note">${escapeHtml(
                          metrics.length
                        )} tram hop le</span>
                      </div>
                      <div class="station-distribution-legend-list">
                        ${["Thap", "Trung binh", "Cao", "Rat cao"]
                          .map((label, index) => {
                            const palette = [
                              { fill: "#72d6c9", core: "#1f9e89" },
                              { fill: "#cde93b", core: "#89c82d" },
                              { fill: "#ffb000", core: "#ff8a00" },
                              { fill: "#ff5b37", core: "#ff7a00" }
                            ][index];

                            return `
                              <div class="station-distribution-legend-item">
                                <span class="station-distribution-legend-dot" style="--density-fill:${palette.fill};--density-core:${palette.core};"></span>
                                <div>
                                  <strong>${label}</strong>
                                  <small>${index === 0 ? "It tram lap dat" : index === 1 ? "Bat dau tap trung" : index === 2 ? "Tap trung cao" : "Cum tram day dac"}</small>
                                </div>
                              </div>
                            `;
                          })
                          .join("")}
                      </div>
                    </section>
                    <section class="station-admin-list-card station-distribution-hotspot-card">
                      <div class="station-admin-list-head">
                        <strong>Diem mat do cao</strong>
                        <span>${topHotspots.length} khu vuc</span>
                      </div>
                      <div class="station-admin-list">
                        ${topHotspots
                          .map(
                            (item, index) => `
                              <button
                                type="button"
                                class="station-admin-list-item${item.id === state.stations.selectedId ? " active" : ""}"
                                data-action="focus-station-distribution-item"
                                data-id="${escapeHtml(item.id)}"
                              >
                                <div class="station-admin-list-copy">
                                  <div class="station-admin-list-topline">
                                    <strong>#${index + 1} ${escapeHtml(item.name || "--")}</strong>
                                    <span class="station-admin-list-dot ${escapeHtml(item.realtimeStatusKey)}"></span>
                                  </div>
                                  <span>${escapeHtml(item.city || item.district || "--")}</span>
                                  <small>${escapeHtml(item.address || "--")}</small>
                                </div>
                                <div class="station-admin-list-meta">
                                  <small>${escapeHtml(item.densityScore)} tram / 3 km</small>
                                  <small>${escapeHtml(item.availablePorts || 0)}/${escapeHtml(
                                    item.totalPorts || 0
                                  )} cong san sang</small>
                                </div>
                              </button>
                            `
                          )
                          .join("")}
                      </div>
                    </section>
                  </aside>
                  <section class="station-admin-map-card station-distribution-map-card">
                    <div class="station-admin-map-toolbar">
                      <div>
                        <strong>Ban do mat do lap dat</strong>
                        <small>Mau dam hon cho thay khu vuc tap trung nhieu tram hon.</small>
                      </div>
                      <span class="station-distribution-note">Du lieu duoc tinh tu cac tram co toa do hop le trong he thong.</span>
                    </div>
                    <div id="stationDistributionMap" class="station-admin-map station-distribution-map"></div>
                  </section>
                </div>
              `
              : '<div class="management-note-card"><p>Chua co tram sac nao co toa do hop le de hien thi mat do lap dat.</p></div>'
          }
        </section>
      `;

      if (!metrics.length) {
        setStatus("Chua co du lieu toa do tram sac de ve ban do phan bo.", true);
        return;
      }

      window.setTimeout(() => {
        const mapElement = document.getElementById("stationDistributionMap");

        if (!mapElement || !window.L) {
          return;
        }

        state.stations.map = window.L.map(mapElement, {
          zoomControl: true,
          attributionControl: true
        });

        const tileLayer = createManagementTileLayer();

        if (tileLayer) {
          tileLayer.addTo(state.stations.map);
        }

        renderStationDistributionMap(metrics);
        state.stations.map.invalidateSize();
      }, 60);

      setStatus(`Da tai ban do phan bo ${metrics.length} tram sac.`);
    } catch (error) {
      setStatus(error.message || "Khong the tai du lieu phan bo tram sac.", true);
    }
  }

  async function loadChargingPointManagementData(forceRefresh = false) {
    if (!hasSession()) {
      showLoginPrompt();
      return;
    }

    const shouldReload =
      forceRefresh ||
      !Array.isArray(state.cache["charging-points"]) ||
      !Array.isArray(state.cache.stations) ||
      !Array.isArray(state.cache.pricings);

    if (shouldReload) {
      const [chargingPoints, stations, pricings] = await Promise.all([
        fetchAllAdminItems("/api/admin/charging-points?limit=50"),
        fetchAllAdminItems("/api/admin/stations?limit=50"),
        fetchAllAdminItems("/api/admin/pricings?limit=50")
      ]);

      state.cache["charging-points"] = chargingPoints;
      state.cache.stations = stations;
      state.cache.pricings = pricings;
    }

    state.chargingPoints.items = Array.isArray(state.cache["charging-points"])
      ? state.cache["charging-points"]
      : [];
  }

  function getFilteredChargingPointItems() {
    const codeQuery = state.chargingPoints.searchCode.trim().toLowerCase();
    const stationId = state.chargingPoints.searchStationId || "";
    const connectorType = state.chargingPoints.searchConnectorType || "all";

    return (state.chargingPoints.items || []).filter((item) => {
      const matchesCode =
        !codeQuery ||
        String(item.code || "")
          .toLowerCase()
          .includes(codeQuery);
      const matchesStation = !stationId || item.station?.id === stationId;
      const matchesConnector = connectorType === "all" || item.connectorType === connectorType;
      return matchesCode && matchesStation && matchesConnector;
    });
  }

  function renderChargingPointSummary() {
    const items = state.chargingPoints.items || [];

    setSummary([
      { label: "Tong cong sac", value: String(items.length) },
      {
        label: "San sang",
        value: String(items.filter((item) => item.status === "available").length)
      },
      {
        label: "Dang su dung",
        value: String(items.filter((item) => item.status === "occupied").length)
      },
      {
        label: "Bao tri",
        value: String(items.filter((item) => item.status === "maintenance").length)
      }
    ]);
  }

  function renderChargingPointToolbar() {
    const stationOptions = (state.cache.stations || [])
      .map(
        (item) =>
          `<option value="${escapeHtml(item.id)}"${state.chargingPoints.searchStationId === item.id ? " selected" : ""}>${escapeHtml(item.name || "--")}</option>`
      )
      .join("");

    const connectorOptions = Object.entries(chargingPointConnectorLabels)
      .map(
        ([value, label]) =>
          `<option value="${escapeHtml(value)}"${state.chargingPoints.searchConnectorType === value ? " selected" : ""}>${escapeHtml(label)}</option>`
      )
      .join("");

    return `
      <div class="charging-point-search-grid">
        <div class="management-form-field">
          <label for="chargingPointSearchCode">Ten cong sac</label>
          <input id="chargingPointSearchCode" type="search" value="${escapeHtml(
            state.chargingPoints.searchCode
          )}" placeholder="Nhap ten cong sac">
        </div>
        <div class="management-form-field">
          <label for="chargingPointSearchStationId">Tram sac</label>
          <select id="chargingPointSearchStationId">
            <option value="">Tat ca tram sac</option>
            ${stationOptions}
          </select>
        </div>
        <div class="management-form-field">
          <label for="chargingPointSearchConnectorType">Loai cong sac</label>
          <select id="chargingPointSearchConnectorType">
            <option value="all">Tat ca loai cong</option>
            ${connectorOptions}
          </select>
        </div>
        <div class="station-admin-search-actions">
          <button type="button" class="primary-btn" data-action="apply-charging-point-search">Tim kiem</button>
          <button type="button" class="outline-btn" data-action="reset-charging-point-search">Dat lai</button>
        </div>
      </div>
    `;
  }

  function renderChargingPointPanel() {
    const items = getFilteredChargingPointItems();
    renderChargingPointSummary();

    if (!els.managementContent) {
      return;
    }

    els.managementContent.innerHTML = `
      <section class="management-card charging-point-panel">
        <div class="management-panel-header">
          <div>
            <h2>Cong sac</h2>
            <p>Danh sach cong sac, tram sac chu quan, loai cong ket noi va trang thai phuc vu.</p>
          </div>
          <div class="station-admin-panel-actions">
            <button type="button" class="primary-btn" data-action="open-charging-point-create">+ Tao moi</button>
          </div>
        </div>
        ${renderChargingPointToolbar()}
        <div class="management-table-card">
          ${
            items.length
              ? `
                <div class="management-table-scroll">
                  <table class="management-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Ten</th>
                        <th>Loai cong sac</th>
                        <th>Mo ta</th>
                        <th>Ngay tao</th>
                        <th>Chuc nang</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${items
                        .map((item, index) => {
                          const statusMeta = getChargingPointStatusMeta(item.status);
                          return `
                            <tr>
                              <td>${index + 1}</td>
                              <td><strong>${escapeHtml(item.code || "--")}</strong></td>
                              <td>${escapeHtml(getChargingPointConnectorLabel(item.connectorType))}</td>
                              <td>${escapeHtml(item.description || `${formatNumber(item.powerKw || 0)} kW | ${statusMeta.label}`)}</td>
                              <td>${escapeHtml(formatDate(item.createdAt))}</td>
                              <td>
                                <div class="management-table-actions">
                                  <button type="button" class="management-mini-btn" data-action="open-charging-point-edit" data-id="${escapeHtml(item.id)}">Sua</button>
                                  <button type="button" class="management-mini-btn primary" data-action="entity-delete" data-panel="charging-points" data-id="${escapeHtml(item.id)}">Xoa</button>
                                </div>
                              </td>
                            </tr>
                          `;
                        })
                        .join("")}
                    </tbody>
                  </table>
                </div>
              `
              : '<p class="management-empty">Khong co cong sac phu hop.</p>'
          }
        </div>
      </section>
    `;
  }

  function populateChargingPointSelectOptions(selectedStationId = "", selectedPricingId = "") {
    if (els.chargingPointStationId) {
      els.chargingPointStationId.innerHTML = `
        <option value="">Chon tram sac</option>
        ${(state.cache.stations || [])
          .map(
            (item) =>
              `<option value="${escapeHtml(item.id)}"${selectedStationId === item.id ? " selected" : ""}>${escapeHtml(item.name || "--")}</option>`
          )
          .join("")}
      `;
    }

    if (els.chargingPointPricingId) {
      els.chargingPointPricingId.innerHTML = `
        <option value="">Chon bang gia</option>
        ${(state.cache.pricings || [])
          .map(
            (item) =>
              `<option value="${escapeHtml(item.id)}"${selectedPricingId === item.id ? " selected" : ""}>${escapeHtml(item.name || "--")} | ${escapeHtml(formatNumber(item.pricePerKwh || 0))} VND/kWh</option>`
          )
          .join("")}
      `;
    }
  }

  function getChargingPointById(chargingPointId) {
    return (state.chargingPoints.items || []).find((item) => item.id === chargingPointId) || null;
  }

  function resetChargingPointForm() {
    state.chargingPoints.modalMode = "create";
    state.chargingPoints.editingId = "";
    const defaultStationId =
      state.chargingPoints.searchStationId || state.cache.stations?.[0]?.id || "";
    const defaultPricingId = state.cache.pricings?.[0]?.id || "";

    if (els.chargingPointEditorId) els.chargingPointEditorId.value = "";
    if (els.chargingPointModalTitle) els.chargingPointModalTitle.textContent = "Tao moi cong sac";
    if (els.chargingPointModalLead) {
      els.chargingPointModalLead.textContent =
        "Nhap thong tin cong sac theo cau hinh dau ra, dau vao va vi tri lap dat.";
    }
    if (els.chargingPointEditorSaveBtn) {
      els.chargingPointEditorSaveBtn.textContent = "Them cong sac";
    }
    if (els.chargingPointCode) els.chargingPointCode.value = "";
    if (els.chargingPointConnectorType) els.chargingPointConnectorType.value = "AC_Type2";
    if (els.chargingPointOutputCurrentType) els.chargingPointOutputCurrentType.value = "";
    if (els.chargingPointInputSupply) els.chargingPointInputSupply.value = "";
    if (els.chargingPointMaxOutputCurrentA) els.chargingPointMaxOutputCurrentA.value = "";
    if (els.chargingPointDescription) els.chargingPointDescription.value = "";
    if (els.chargingPointPowerKw) els.chargingPointPowerKw.value = "";
    if (els.chargingPointMaxOutputVoltage) els.chargingPointMaxOutputVoltage.value = "";
    if (els.chargingPointMultiPortEnabled) els.chargingPointMultiPortEnabled.checked = false;
    if (els.chargingPointPositionLabel) els.chargingPointPositionLabel.value = "";
    if (els.chargingPointStatusSelect) els.chargingPointStatusSelect.value = "available";

    populateChargingPointSelectOptions(defaultStationId, defaultPricingId);
    setChargingPointModalStatus("");
  }

  async function openCreateChargingPointModal() {
    await loadChargingPointManagementData(false);
    resetChargingPointForm();
    openBackdrop(els.chargingPointModal);
  }

  async function openEditChargingPointModal(chargingPointId) {
    await loadChargingPointManagementData(false);
    const item = getChargingPointById(chargingPointId);

    if (!item) {
      setStatus("Khong tim thay cong sac can sua.", true);
      return;
    }

    state.chargingPoints.modalMode = "edit";
    state.chargingPoints.editingId = item.id;

    if (els.chargingPointEditorId) els.chargingPointEditorId.value = item.id;
    if (els.chargingPointModalTitle) els.chargingPointModalTitle.textContent = "Sua cong sac";
    if (els.chargingPointModalLead) {
      els.chargingPointModalLead.textContent =
        "Cap nhat cau hinh cong sac, dau vao, dau ra va vi tri lap dat.";
    }
    if (els.chargingPointEditorSaveBtn) {
      els.chargingPointEditorSaveBtn.textContent = "Luu thay doi";
    }

    populateChargingPointSelectOptions(item.station?.id || "", item.pricing?.id || "");
    if (els.chargingPointCode) els.chargingPointCode.value = item.code || "";
    if (els.chargingPointConnectorType) els.chargingPointConnectorType.value = item.connectorType || "AC_Type2";
    if (els.chargingPointOutputCurrentType) {
      els.chargingPointOutputCurrentType.value = item.outputCurrentType || "";
    }
    if (els.chargingPointInputSupply) {
      els.chargingPointInputSupply.value = item.inputSupply || "";
    }
    if (els.chargingPointMaxOutputCurrentA) {
      els.chargingPointMaxOutputCurrentA.value = item.maxOutputCurrentA != null ? String(item.maxOutputCurrentA) : "";
    }
    if (els.chargingPointDescription) els.chargingPointDescription.value = item.description || "";
    if (els.chargingPointPowerKw) els.chargingPointPowerKw.value = String(item.powerKw || "");
    if (els.chargingPointMaxOutputVoltage) {
      els.chargingPointMaxOutputVoltage.value = item.maxOutputVoltage || "";
    }
    if (els.chargingPointMultiPortEnabled) {
      els.chargingPointMultiPortEnabled.checked = Boolean(item.multiPortEnabled);
    }
    if (els.chargingPointPositionLabel) {
      els.chargingPointPositionLabel.value = item.positionLabel || "";
    }
    if (els.chargingPointStatusSelect) els.chargingPointStatusSelect.value = item.status || "available";

    setChargingPointModalStatus("");
    openBackdrop(els.chargingPointModal);
  }

  function closeChargingPointModalDialog() {
    setChargingPointModalStatus("");
    closeBackdrop(els.chargingPointModal);
  }

  async function submitChargingPointForm() {
    const code = els.chargingPointCode?.value.trim() || "";
    const stationId = els.chargingPointStationId?.value || "";
    const connectorType = els.chargingPointConnectorType?.value || "";
    const outputCurrentType = els.chargingPointOutputCurrentType?.value.trim() || "";
    const inputSupply = els.chargingPointInputSupply?.value.trim() || "";
    const maxOutputCurrentA = Number(els.chargingPointMaxOutputCurrentA?.value || 0);
    const description = els.chargingPointDescription?.value.trim() || "";
    const pricingId = els.chargingPointPricingId?.value || "";
    const powerKw = Number(els.chargingPointPowerKw?.value || 0);
    const maxOutputVoltage = els.chargingPointMaxOutputVoltage?.value.trim() || "";
    const multiPortEnabled = Boolean(els.chargingPointMultiPortEnabled?.checked);
    const positionLabel = els.chargingPointPositionLabel?.value.trim() || "";
    const status = els.chargingPointStatusSelect?.value || "available";
    const isEdit = state.chargingPoints.modalMode === "edit" && state.chargingPoints.editingId;

    if (!code || !stationId || !pricingId || !connectorType || !Number.isFinite(powerKw) || powerKw <= 0) {
      setChargingPointModalStatus("Vui long nhap day du ten cong, tram sac, bang gia, loai cong va cong suat.", true);
      return;
    }

    try {
      setChargingPointModalStatus(isEdit ? "Dang cap nhat cong sac..." : "Dang tao cong sac...", false);

      await requestJson(
        isEdit
          ? `/api/admin/charging-points/${state.chargingPoints.editingId}`
          : "/api/admin/charging-points",
        {
          method: isEdit ? "PATCH" : "POST",
          body: JSON.stringify({
            code,
            stationId,
            pricingId,
            connectorType,
            outputCurrentType,
            inputSupply,
            maxOutputCurrentA: Number.isFinite(maxOutputCurrentA) && maxOutputCurrentA > 0 ? maxOutputCurrentA : null,
            description,
            powerKw,
            maxOutputVoltage,
            multiPortEnabled,
            positionLabel,
            status
          })
        }
      );

      closeChargingPointModalDialog();
      state.cache["charging-points"] = null;
      await renderCurrentPanel(true);
      setStatus(isEdit ? "Da cap nhat cong sac." : "Da tao cong sac moi.");
    } catch (error) {
      setChargingPointModalStatus(error.message || "Khong the luu cong sac.", true);
    }
  }

  async function renderChargingPointManagementPanel(forceRefresh = false) {
    if (!hasSession()) {
      showLoginPrompt();
      return;
    }

    try {
      setStatus("Dang tai du lieu cong sac...");
      await loadChargingPointManagementData(forceRefresh);
      renderChargingPointPanel();
      setStatus(`Da tai ${state.chargingPoints.items.length} cong sac.`);
    } catch (error) {
      setStatus(error.message || "Khong the tai du lieu cong sac.", true);
    }
  }

  function setPricingModalStatus(message = "", isError = true) {
    if (!els.pricingModalStatus) {
      return;
    }

    if (!message) {
      els.pricingModalStatus.hidden = true;
      els.pricingModalStatus.textContent = "";
      return;
    }

    els.pricingModalStatus.hidden = false;
    els.pricingModalStatus.textContent = message;
    els.pricingModalStatus.className = isError ? "status-box error" : "status-box";
  }

  function createEmptyTimeRate() {
    return { minutes: "", price: "" };
  }

  function createEmptyTimeFrame() {
    return { name: "", startTime: "", endTime: "", price: "" };
  }

  function syncPricingDraftsFromInputs() {
    const timeRateRow = els.pricingTimeRateRows?.querySelector(".pricing-subtable-row-entry");
    const timeFrameRow = els.pricingTimeFrameRows?.querySelector(".pricing-subtable-row-entry");

    if (timeRateRow) {
      state.pricings.timeRateDraft = {
        minutes:
          timeRateRow.querySelector('[data-pricing-time-rate-draft="minutes"]')?.value || "",
        price: timeRateRow.querySelector('[data-pricing-time-rate-draft="price"]')?.value || ""
      };
    }

    if (timeFrameRow) {
      state.pricings.timeFrameDraft = {
        name: timeFrameRow.querySelector('[data-pricing-time-frame-draft="name"]')?.value || "",
        startTime:
          timeFrameRow.querySelector('[data-pricing-time-frame-draft="startTime"]')?.value || "",
        endTime:
          timeFrameRow.querySelector('[data-pricing-time-frame-draft="endTime"]')?.value || "",
        price: timeFrameRow.querySelector('[data-pricing-time-frame-draft="price"]')?.value || ""
      };
    }
  }

  function renderPricingTimeRateRows() {
    if (!els.pricingTimeRateRows) {
      return;
    }

    const savedRows = state.pricings.timeRates.length
      ? state.pricings.timeRates
          .map(
            (item, index) => `
              <div class="pricing-subtable-row pricing-subtable-row-saved">
                <div class="pricing-subtable-cell">${escapeHtml(item.minutes)} phut</div>
                <div class="pricing-subtable-cell pricing-subtable-cell-price">${escapeHtml(
                  formatNumber(item.price || 0)
                )}</div>
                <div class="pricing-subtable-actions">
                  <button type="button" class="pricing-subtable-btn edit" data-action="edit-pricing-time-rate" data-index="${index}">Sua</button>
                  <button type="button" class="pricing-subtable-btn remove" data-action="remove-pricing-time-rate" data-index="${index}">-</button>
                </div>
              </div>
            `
          )
          .join("")
      : '<p class="pricing-subtable-empty">Chua co moc thoi gian nao.</p>';

    els.pricingTimeRateRows.innerHTML = `
      <div class="pricing-subtable-row pricing-subtable-row-entry">
        <input type="number" min="0" step="1" value="${escapeHtml(
          state.pricings.timeRateDraft.minutes
        )}" data-pricing-time-rate-draft="minutes" placeholder="Phut">
        <input type="number" min="0" step="0.01" value="${escapeHtml(
          state.pricings.timeRateDraft.price
        )}" data-pricing-time-rate-draft="price" placeholder="Gia">
        <div class="pricing-subtable-actions">
          <button type="button" class="pricing-subtable-btn add" data-action="add-pricing-time-rate">+</button>
        </div>
      </div>
      <div class="pricing-subtable-saved-list">${savedRows}</div>
    `;
  }

  function renderPricingTimeFrameRows() {
    if (!els.pricingTimeFrameRows) {
      return;
    }

    const savedRows = state.pricings.timeFrames.length
      ? state.pricings.timeFrames
          .map(
            (item, index) => `
              <div class="pricing-subtable-row pricing-subtable-row-wide pricing-subtable-row-saved">
                <div class="pricing-subtable-cell">${escapeHtml(item.name)}</div>
                <div class="pricing-subtable-cell">${escapeHtml(item.startTime)}</div>
                <div class="pricing-subtable-cell">${escapeHtml(item.endTime)}</div>
                <div class="pricing-subtable-cell pricing-subtable-cell-price">${escapeHtml(
                  formatNumber(item.price || 0)
                )}</div>
                <div class="pricing-subtable-actions">
                  <button type="button" class="pricing-subtable-btn edit" data-action="edit-pricing-time-frame" data-index="${index}">Sua</button>
                  <button type="button" class="pricing-subtable-btn remove" data-action="remove-pricing-time-frame" data-index="${index}">-</button>
                </div>
              </div>
            `
          )
          .join("")
      : '<p class="pricing-subtable-empty">Chua co khung gio nao.</p>';

    els.pricingTimeFrameRows.innerHTML = `
      <div class="pricing-subtable-row pricing-subtable-row-wide pricing-subtable-row-entry">
        <input type="text" value="${escapeHtml(
          state.pricings.timeFrameDraft.name
        )}" data-pricing-time-frame-draft="name" placeholder="Ten">
        <input type="time" value="${escapeHtml(
          state.pricings.timeFrameDraft.startTime
        )}" data-pricing-time-frame-draft="startTime">
        <input type="time" value="${escapeHtml(
          state.pricings.timeFrameDraft.endTime
        )}" data-pricing-time-frame-draft="endTime">
        <input type="number" min="0" step="0.01" value="${escapeHtml(
          state.pricings.timeFrameDraft.price
        )}" data-pricing-time-frame-draft="price" placeholder="Gia">
        <div class="pricing-subtable-actions">
          <button type="button" class="pricing-subtable-btn add" data-action="add-pricing-time-frame">+</button>
        </div>
      </div>
      <div class="pricing-subtable-saved-list">${savedRows}</div>
    `;
  }

  async function loadPricingManagementData(forceRefresh = false) {
    if (!hasSession()) {
      showLoginPrompt();
      return;
    }

    if (forceRefresh || !Array.isArray(state.cache.pricings)) {
      const pricings = await fetchAllAdminItems("/api/admin/pricings?limit=50");
      state.cache.pricings = pricings;
    }

    state.pricings.items = Array.isArray(state.cache.pricings) ? state.cache.pricings : [];
  }

  function getFilteredPricingItems() {
    const nameQuery = state.pricings.searchName.trim().toLowerCase();

    return (state.pricings.items || []).filter((item) => {
      return (
        !nameQuery ||
        String(item.name || "")
          .toLowerCase()
          .includes(nameQuery)
      );
    });
  }

  function renderPricingSummary() {
    const items = state.pricings.items || [];

    setSummary([
      { label: "Tong bang gia", value: String(items.length) },
      {
        label: "Gia dien TB",
        value: items.length
          ? `${formatNumber(
              Math.round(
                items.reduce((sum, item) => sum + Number(item.pricePerKwh || 0), 0) / items.length
              )
            )}`
          : "0"
      },
      {
        label: "Gia do xe TB",
        value: items.length
          ? `${formatNumber(
              Math.round(
                items.reduce((sum, item) => sum + Number(item.parkingFee || 0), 0) / items.length
              )
            )}`
          : "0"
      },
      {
        label: "Bang gia co VAT",
        value: String(items.filter((item) => Number(item.vat || 0) > 0).length)
      }
    ]);
  }

  function renderPricingToolbar() {
    return `
      <div class="pricing-search-grid">
        <div class="management-form-field">
          <label for="pricingSearchName">Ten</label>
          <input id="pricingSearchName" type="search" value="${escapeHtml(
            state.pricings.searchName
          )}" placeholder="Nhap ten bang gia">
        </div>
        <div class="station-admin-search-actions">
          <button type="button" class="primary-btn" data-action="apply-pricing-search">Tim kiem</button>
          <button type="button" class="outline-btn" data-action="reset-pricing-search">Dat lai</button>
        </div>
      </div>
    `;
  }

  function renderPricingPanel() {
    const items = getFilteredPricingItems();
    renderPricingSummary();

    if (!els.managementContent) {
      return;
    }

    els.managementContent.innerHTML = `
      <section class="management-card pricing-panel">
        <div class="management-panel-header">
          <div>
            <h2>Gia dich vu</h2>
            <p>Quan ly gia dien, gia chiem dung dau sac, gia do xe va cac bang gia theo thoi gian.</p>
          </div>
          <div class="station-admin-panel-actions">
            <button type="button" class="primary-btn" data-action="open-pricing-create">+ Tao moi</button>
          </div>
        </div>
        ${renderPricingToolbar()}
        <div class="management-table-card">
          ${
            items.length
              ? `
                <div class="management-table-scroll">
                  <table class="management-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Ten</th>
                        <th>Gia dien</th>
                        <th>Gia chiem dung dau sac</th>
                        <th>Gia do xe</th>
                        <th>Mo ta</th>
                        <th>Ngay tao</th>
                        <th>Chuc nang</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${items
                        .map(
                          (item, index) => `
                            <tr>
                              <td>${index + 1}</td>
                              <td><strong>${escapeHtml(item.name || "--")}</strong></td>
                              <td>${escapeHtml(formatNumber(item.pricePerKwh || 0))}</td>
                              <td>${escapeHtml(formatNumber(item.pricePerMinute || 0))}</td>
                              <td>${escapeHtml(formatNumber(item.parkingFee || 0))}</td>
                              <td>${escapeHtml(item.description || "--")}</td>
                              <td>${escapeHtml(formatDate(item.createdAt))}</td>
                              <td>
                                <div class="management-table-actions">
                                  <button type="button" class="management-mini-btn" data-action="open-pricing-edit" data-id="${escapeHtml(item.id)}">Sua</button>
                                  <button type="button" class="management-mini-btn primary" data-action="entity-delete" data-panel="pricings" data-id="${escapeHtml(item.id)}">Xoa</button>
                                </div>
                              </td>
                            </tr>
                          `
                        )
                        .join("")}
                    </tbody>
                  </table>
                </div>
              `
              : '<p class="management-empty">Khong co bang gia phu hop.</p>'
          }
        </div>
      </section>
    `;
  }

  function resetPricingForm() {
    state.pricings.modalMode = "create";
    state.pricings.editingId = "";
    state.pricings.timeRateDraft = createEmptyTimeRate();
    state.pricings.timeFrameDraft = createEmptyTimeFrame();
    state.pricings.timeRates = [];
    state.pricings.timeFrames = [];

    if (els.pricingEditorId) els.pricingEditorId.value = "";
    if (els.pricingModalTitle) els.pricingModalTitle.textContent = "Tao moi gia dich vu";
    if (els.pricingModalLead) {
      els.pricingModalLead.textContent =
        "Nhap gia dien, gia chiem dung, gia do xe va cau hinh gia theo thoi gian.";
    }
    if (els.pricingEditorSaveBtn) els.pricingEditorSaveBtn.textContent = "Them";
    if (els.pricingName) els.pricingName.value = "";
    if (els.pricingPricePerKwh) els.pricingPricePerKwh.value = "";
    if (els.pricingHourlyPrice) els.pricingHourlyPrice.value = "0";
    if (els.pricingPricePerMinute) els.pricingPricePerMinute.value = "0";
    if (els.pricingParkingFee) els.pricingParkingFee.value = "0";
    if (els.pricingVat) els.pricingVat.value = "0";
    if (els.pricingDescription) els.pricingDescription.value = "";

    renderPricingTimeRateRows();
    renderPricingTimeFrameRows();
    setPricingModalStatus("");
  }

  async function openCreatePricingModal() {
    await loadPricingManagementData(false);
    resetPricingForm();
    openBackdrop(els.pricingModal);
  }

  function getPricingById(pricingId) {
    return (state.pricings.items || []).find((item) => item.id === pricingId) || null;
  }

  async function openEditPricingModal(pricingId) {
    await loadPricingManagementData(false);
    const item = getPricingById(pricingId);

    if (!item) {
      setStatus("Khong tim thay bang gia can sua.", true);
      return;
    }

    state.pricings.modalMode = "edit";
    state.pricings.editingId = item.id;
    state.pricings.timeRateDraft = createEmptyTimeRate();
    state.pricings.timeFrameDraft = createEmptyTimeFrame();
    state.pricings.timeRates = Array.isArray(item.timeRates) && item.timeRates.length
      ? item.timeRates.map((rate) => ({
          minutes: String(rate.minutes ?? ""),
          price: String(rate.price ?? "")
        }))
      : [];
    state.pricings.timeFrames = Array.isArray(item.timeFrames) && item.timeFrames.length
      ? item.timeFrames.map((frame) => ({
          name: frame.name || "",
          startTime: frame.startTime || "",
          endTime: frame.endTime || "",
          price: String(frame.price ?? "")
        }))
      : [];

    if (els.pricingEditorId) els.pricingEditorId.value = item.id;
    if (els.pricingModalTitle) els.pricingModalTitle.textContent = "Sua gia dich vu";
    if (els.pricingModalLead) {
      els.pricingModalLead.textContent =
        "Dieu chinh bang gia, cac muc phi va cau hinh gia theo thoi gian.";
    }
    if (els.pricingEditorSaveBtn) els.pricingEditorSaveBtn.textContent = "Luu thay doi";
    if (els.pricingName) els.pricingName.value = item.name || "";
    if (els.pricingPricePerKwh) els.pricingPricePerKwh.value = String(item.pricePerKwh || 0);
    if (els.pricingHourlyPrice) els.pricingHourlyPrice.value = String(item.hourlyPrice || 0);
    if (els.pricingPricePerMinute) els.pricingPricePerMinute.value = String(item.pricePerMinute || 0);
    if (els.pricingParkingFee) els.pricingParkingFee.value = String(item.parkingFee || 0);
    if (els.pricingVat) els.pricingVat.value = String(item.vat || 0);
    if (els.pricingDescription) els.pricingDescription.value = item.description || "";

    renderPricingTimeRateRows();
    renderPricingTimeFrameRows();
    setPricingModalStatus("");
    openBackdrop(els.pricingModal);
  }

  function closePricingModalDialog() {
    setPricingModalStatus("");
    closeBackdrop(els.pricingModal);
  }

  function collectPricingTimeRates() {
    return state.pricings.timeRates
      .map((row) => {
        const minutes = Number(row.minutes || 0);
        const price = Number(row.price || 0);
        return Number.isFinite(minutes) && Number.isFinite(price) && minutes > 0
          ? { minutes, price }
          : null;
      })
      .filter(Boolean);
  }

  function collectPricingTimeFrames() {
    return state.pricings.timeFrames
      .map((row) => {
        const name = String(row.name || "").trim();
        const startTime = String(row.startTime || "").trim();
        const endTime = String(row.endTime || "").trim();
        const price = Number(row.price || 0);
        return name && startTime && endTime && Number.isFinite(price)
          ? { name, startTime, endTime, price }
          : null;
      })
      .filter(Boolean);
  }

  async function submitPricingForm() {
    syncPricingDraftsFromInputs();
    const name = els.pricingName?.value.trim() || "";
    const pricePerKwh = Number(els.pricingPricePerKwh?.value || 0);
    const hourlyPrice = Number(els.pricingHourlyPrice?.value || 0);
    const pricePerMinute = Number(els.pricingPricePerMinute?.value || 0);
    const parkingFee = Number(els.pricingParkingFee?.value || 0);
    const vat = Number(els.pricingVat?.value || 0);
    const description = els.pricingDescription?.value.trim() || "";
    const timeRates = collectPricingTimeRates();
    const timeFrames = collectPricingTimeFrames();
    const isEdit = state.pricings.modalMode === "edit" && state.pricings.editingId;

    if (!name || !Number.isFinite(pricePerKwh) || pricePerKwh < 0) {
      setPricingModalStatus("Vui long nhap ten bang gia va gia dien hop le.", true);
      return;
    }

    if (
      state.pricings.timeRateDraft.minutes ||
      state.pricings.timeRateDraft.price ||
      state.pricings.timeFrameDraft.name ||
      state.pricings.timeFrameDraft.startTime ||
      state.pricings.timeFrameDraft.endTime ||
      state.pricings.timeFrameDraft.price
    ) {
      setPricingModalStatus("Ban dang co du lieu chua them. Hay bam dau + de luu tung moc truoc khi xac nhan.", true);
      return;
    }

    try {
      setPricingModalStatus(isEdit ? "Dang cap nhat bang gia..." : "Dang tao bang gia...", false);

      await requestJson(
        isEdit ? `/api/admin/pricings/${state.pricings.editingId}` : "/api/admin/pricings",
        {
          method: isEdit ? "PATCH" : "POST",
          body: JSON.stringify({
            name,
            pricePerKwh,
            hourlyPrice,
            pricePerMinute,
            parkingFee,
            vat,
            description,
            timeRates,
            timeFrames
          })
        }
      );

      closePricingModalDialog();
      state.cache.pricings = null;
      await renderCurrentPanel(true);
      setStatus(isEdit ? "Da cap nhat bang gia." : "Da tao bang gia moi.");
    } catch (error) {
      setPricingModalStatus(error.message || "Khong the luu bang gia.", true);
    }
  }

  async function renderPricingManagementPanel(forceRefresh = false) {
    if (!hasSession()) {
      showLoginPrompt();
      return;
    }

    try {
      setStatus("Dang tai du lieu gia dich vu...");
      await loadPricingManagementData(forceRefresh);
      renderPricingPanel();
      setStatus(`Da tai ${state.pricings.items.length} bang gia.`);
    } catch (error) {
      setStatus(error.message || "Khong the tai du lieu gia dich vu.", true);
    }
  }

  async function loadBookingHistoryData(forceRefresh = false) {
    if (!hasSession()) {
      showLoginPrompt();
      return;
    }

    if (forceRefresh || !Array.isArray(state.cache.bookings)) {
      state.cache.bookings = await fetchAllAdminItems("/api/admin/bookings?limit=50");
    }

    state.bookings.items = Array.isArray(state.cache.bookings) ? state.cache.bookings : [];
  }

  function getFilteredBookingHistoryItems() {
    const startFilter = state.bookings.filterStart ? new Date(state.bookings.filterStart) : null;
    const endFilter = state.bookings.filterEnd ? new Date(state.bookings.filterEnd) : null;
    const statusFilter = state.bookings.filterStatus || "all";

    return (state.bookings.items || []).filter((item) => {
      const bookingStart = new Date(item.startTime);
      const bookingEnd = new Date(item.endTime);
      const matchesStart =
        !startFilter ||
        (!Number.isNaN(bookingStart.getTime()) && bookingStart.getTime() >= startFilter.getTime());
      const matchesEnd =
        !endFilter || (!Number.isNaN(bookingEnd.getTime()) && bookingEnd.getTime() <= endFilter.getTime());
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesStart && matchesEnd && matchesStatus;
    });
  }

  function renderBookingHistorySummary(items) {
    setSummary([
      { label: "Tong lich da dat", value: String(items.length) },
      {
        label: "Cho xac nhan",
        value: String(items.filter((item) => item.status === "pending").length)
      },
      {
        label: "Da dat",
        value: String(items.filter((item) => item.status === "confirmed").length)
      },
      {
        label: "Da huy",
        value: String(items.filter((item) => item.status === "cancelled").length)
      }
    ]);
  }

  function syncBookingHistoryFiltersFromInputs() {
    const startInput = els.managementContent?.querySelector("#bookingHistoryStartFilter");
    const endInput = els.managementContent?.querySelector("#bookingHistoryEndFilter");
    const statusInput = els.managementContent?.querySelector("#bookingHistoryStatusFilter");

    state.bookings.filterStart =
      startInput instanceof HTMLInputElement ? startInput.value || "" : state.bookings.filterStart;
    state.bookings.filterEnd =
      endInput instanceof HTMLInputElement ? endInput.value || "" : state.bookings.filterEnd;
    state.bookings.filterStatus =
      statusInput instanceof HTMLSelectElement ? statusInput.value || "all" : state.bookings.filterStatus;
  }

  function renderBookingHistoryToolbar() {
    return `
      <div class="booking-history-filter-grid">
        <div class="management-form-field">
          <label for="bookingHistoryStartFilter">Thoi gian bat dau</label>
          <input id="bookingHistoryStartFilter" type="datetime-local" value="${escapeHtml(
            state.bookings.filterStart
          )}">
        </div>
        <div class="management-form-field">
          <label for="bookingHistoryEndFilter">Thoi gian ket thuc</label>
          <input id="bookingHistoryEndFilter" type="datetime-local" value="${escapeHtml(
            state.bookings.filterEnd
          )}">
        </div>
        <div class="management-form-field">
          <label for="bookingHistoryStatusFilter">Trang thai</label>
          <select id="bookingHistoryStatusFilter">
            <option value="all" ${state.bookings.filterStatus === "all" ? "selected" : ""}>Tat ca</option>
            <option value="pending" ${state.bookings.filterStatus === "pending" ? "selected" : ""}>Cho xac nhan</option>
            <option value="confirmed" ${state.bookings.filterStatus === "confirmed" ? "selected" : ""}>Da dat</option>
            <option value="completed" ${state.bookings.filterStatus === "completed" ? "selected" : ""}>Hoan thanh</option>
            <option value="cancelled" ${state.bookings.filterStatus === "cancelled" ? "selected" : ""}>Da huy</option>
          </select>
        </div>
        <div class="station-admin-search-actions">
          <button type="button" class="primary-btn" data-action="apply-booking-history-search">Tim kiem</button>
          <button type="button" class="outline-btn" data-action="reset-booking-history-search">Dat lai</button>
        </div>
      </div>
    `;
  }

  function getBookingHistoryById(bookingId) {
    return (state.bookings.items || []).find((item) => item.id === bookingId) || null;
  }

  function renderBookingHistoryPanel() {
    const filteredItems = getFilteredBookingHistoryItems();
    renderBookingHistorySummary(state.bookings.items || []);

    if (els.managementTitle) {
      els.managementTitle.textContent = "Lich su dat lich";
    }

    if (els.managementLead) {
      els.managementLead.textContent =
        "Hiển thị danh sách lịch đã đặt, hỗ trợ lọc theo thời gian bắt đầu, thời gian kết thúc và trạng thái để theo dõi hoặc hủy lịch còn hợp lệ.";
    }

    if (!els.managementContent) {
      return;
    }

    els.managementContent.innerHTML = `
      <section class="management-card booking-history-panel">
        <div class="management-panel-header">
          <div>
            <h2>Lich su dat lich</h2>
            <p>Theo doi lich dat cong sac, xem chi tiet va huy lich truoc gio bat dau it nhat 30 phut.</p>
          </div>
        </div>
        ${renderBookingHistoryToolbar()}
        <div class="management-table-card">
          ${
            filteredItems.length
              ? `
                <div class="management-table-scroll">
                  <table class="management-table booking-history-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Ten tram sac</th>
                        <th>Cong sac</th>
                        <th>Khach hang</th>
                        <th>Thoi gian bat dau</th>
                        <th>Thoi gian ket thuc</th>
                        <th>Thoi gian sac</th>
                        <th>Dia chi</th>
                        <th>Trang thai</th>
                        <th>Ngay tao</th>
                        <th>Chuc nang</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${filteredItems
                        .map((item, index) => {
                          const cancelState = getBookingCancellationState(item);

                          return `
                            <tr>
                              <td>${index + 1}</td>
                              <td><strong>${escapeHtml(item.chargingPoint?.station?.name || "--")}</strong></td>
                              <td><strong>${escapeHtml(item.chargingPoint?.code || "--")}</strong><small>${escapeHtml(item.chargingPoint?.connectorType || "--")}</small></td>
                              <td><strong>${escapeHtml(item.user?.fullName || "--")}</strong><small>${escapeHtml(item.user?.phone || item.user?.email || "--")}</small></td>
                              <td>${escapeHtml(formatDate(item.startTime))}</td>
                              <td>${escapeHtml(formatDate(item.endTime))}</td>
                              <td>${escapeHtml(formatBookingDuration(item.startTime, item.endTime))}</td>
                              <td>${escapeHtml(item.chargingPoint?.station?.address || "--")}</td>
                              <td>${renderBookingStatusBadge(item.status)}</td>
                              <td>${escapeHtml(formatDate(item.createdAt))}</td>
                              <td>
                                <div class="management-table-actions booking-history-actions">
                                  <button type="button" class="management-mini-btn" data-action="open-booking-history-detail" data-id="${escapeHtml(
                                    item.id
                                  )}">Chi tiet</button>
                                  <button type="button" class="management-mini-btn primary ${
                                    cancelState.canCancel ? "" : "disabled"
                                  }" data-action="cancel-booking-history" data-id="${escapeHtml(
                                    item.id
                                  )}" ${cancelState.canCancel ? "" : "disabled"} title="${escapeHtml(
                                    cancelState.reason || "Huy lich dat"
                                  )}">Huy bo</button>
                                </div>
                              </td>
                            </tr>
                          `;
                        })
                        .join("")}
                    </tbody>
                  </table>
                </div>
              `
              : '<p class="management-empty">Khong co lich dat phu hop voi bo loc hien tai.</p>'
          }
        </div>
      </section>
    `;
  }

  function setBookingHistoryDetailStatus(message = "", isError = false) {
    if (!els.bookingHistoryDetailStatus) {
      return;
    }

    if (!message) {
      els.bookingHistoryDetailStatus.hidden = true;
      els.bookingHistoryDetailStatus.textContent = "";
      return;
    }

    els.bookingHistoryDetailStatus.hidden = false;
    els.bookingHistoryDetailStatus.textContent = message;
    els.bookingHistoryDetailStatus.className = isError ? "status-box error" : "status-box";
  }

  function openBookingHistoryDetailModal(bookingId) {
    const booking = getBookingHistoryById(bookingId);

    if (!booking || !els.bookingHistoryDetailGrid) {
      setStatus("Khong tim thay lich dat can xem chi tiet.", true);
      return;
    }

    const cancelState = getBookingCancellationState(booking);
    state.bookings.detailId = booking.id;

    if (els.bookingHistoryDetailTitle) {
      els.bookingHistoryDetailTitle.textContent = `Chi tiet dat lich ${booking.chargingPoint?.code || ""}`.trim();
    }

    if (els.bookingHistoryDetailLead) {
      els.bookingHistoryDetailLead.textContent =
        "Thong tin lich dat bao gom tram sac, cong sac, khach hang, khung gio, thoi luong va trang thai xu ly.";
    }

    els.bookingHistoryDetailGrid.innerHTML = [
      ["Ten tram sac", booking.chargingPoint?.station?.name || "--"],
      ["Cong sac", booking.chargingPoint?.code || "--"],
      ["Loai cong sac", booking.chargingPoint?.connectorType || "--"],
      ["Cong suat", booking.chargingPoint?.powerKw ? `${booking.chargingPoint.powerKw} kW` : "--"],
      ["Khach hang", booking.user?.fullName || "--"],
      ["So dien thoai", booking.user?.phone || "--"],
      ["Email", booking.user?.email || "--"],
      ["Dia chi", booking.chargingPoint?.station?.address || "--"],
      ["Thoi gian bat dau", formatDate(booking.startTime)],
      ["Thoi gian ket thuc", formatDate(booking.endTime)],
      ["Thoi gian sac", formatBookingDuration(booking.startTime, booking.endTime)],
      ["Trang thai", bookingStatusLabel(booking.status)],
      ["Ngay tao", formatDate(booking.createdAt)],
      ["Cap nhat lan cuoi", formatDate(booking.updatedAt)],
      [
        "Dieu kien huy lich",
        cancelState.canCancel ? "Co the huy" : cancelState.reason
      ]
    ]
      .map(
        ([label, value]) => `
          <div class="booking-history-detail-item">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(value)}</strong>
          </div>
        `
      )
      .join("");

    setBookingHistoryDetailStatus(
      cancelState.canCancel
        ? "Lich nay van co the huy neu ban can thay doi ke hoach."
        : cancelState.reason,
      !cancelState.canCancel
    );
    openBackdrop(els.bookingHistoryDetailModal);
  }

  function closeBookingHistoryDetailModal() {
    state.bookings.detailId = "";
    setBookingHistoryDetailStatus("");
    closeBackdrop(els.bookingHistoryDetailModal);
  }

  async function submitBookingCancellation(bookingId) {
    const booking = getBookingHistoryById(bookingId);

    if (!booking) {
      setStatus("Khong tim thay lich dat can huy.", true);
      return;
    }

    const cancelState = getBookingCancellationState(booking);

    if (!cancelState.canCancel) {
      setStatus(cancelState.reason, true);
      return;
    }

    openConfirmModal({
      title: "Xac nhan huy dat lich",
      message: "Ban co chac chan muon huy lich dat nay?",
      hint: "He thong chi cho phep huy khi con it nhat 30 phut truoc gio bat dau.",
      confirmLabel: "Xac nhan",
      onConfirm: async () => {
        try {
          setStatus("Dang huy lich dat...");
          await requestJson(`/api/admin/bookings/${bookingId}`, {
            method: "PATCH",
            body: JSON.stringify({
              status: "cancelled"
            })
          });
          closeConfirmModal();
          closeBookingHistoryDetailModal();
          state.cache.bookings = null;
          await renderBookingHistoryPanelAsync(true);
          setStatus("Da huy lich dat thanh cong.");
        } catch (error) {
          setStatus(error.message || "Khong the huy lich dat.", true);
        }
      }
    });
  }

  async function renderBookingHistoryPanelAsync(forceRefresh = false) {
    if (!hasSession()) {
      showLoginPrompt();
      return;
    }

    try {
      setStatus("Dang tai lich su dat lich...");
      await loadBookingHistoryData(forceRefresh);
      renderBookingHistoryPanel();
      setStatus(`Da tai ${state.bookings.items.length} lich dat.`);
    } catch (error) {
      setStatus(error.message || "Khong the tai lich su dat lich.", true);
    }
  }

  async function loadAggregateReportData(forceRefresh = false) {
    if (!hasSession()) {
      showLoginPrompt();
      return;
    }

    const shouldReload =
      forceRefresh ||
      !Array.isArray(state.cache.bookings) ||
      !Array.isArray(state.cache["charging-points"]);

    if (shouldReload) {
      const [bookings, chargingPoints] = await Promise.all([
        fetchAllAdminItems("/api/admin/bookings?limit=100"),
        fetchAllAdminItems("/api/admin/charging-points?limit=100")
      ]);

      state.cache.bookings = bookings;
      state.cache["charging-points"] = chargingPoints;
    }

    state.bookings.items = Array.isArray(state.cache.bookings) ? state.cache.bookings : [];
  }

  function syncAggregateReportFiltersFromInputs() {
    const startInput = els.managementContent?.querySelector("#aggregateReportStartDate");
    const endInput = els.managementContent?.querySelector("#aggregateReportEndDate");
    const cycleInput = els.managementContent?.querySelector("#aggregateReportCycle");

    state.reportSummary.filterStart =
      startInput instanceof HTMLInputElement
        ? startInput.value || state.reportSummary.filterStart
        : state.reportSummary.filterStart;
    state.reportSummary.filterEnd =
      endInput instanceof HTMLInputElement
        ? endInput.value || state.reportSummary.filterEnd
        : state.reportSummary.filterEnd;
    state.reportSummary.cycle =
      cycleInput instanceof HTMLSelectElement
        ? cycleInput.value || "month"
        : state.reportSummary.cycle;
  }

  function buildAggregateReportRows() {
    const bookings = Array.isArray(state.bookings.items) ? state.bookings.items : [];
    const chargingPointMap = new Map(
      (Array.isArray(state.cache["charging-points"]) ? state.cache["charging-points"] : []).map((item) => [
        item.id,
        item
      ])
    );
    const cycle = state.reportSummary.cycle || "month";
    const startBoundary = parseDateInputBoundary(state.reportSummary.filterStart, "start");
    const endBoundary = parseDateInputBoundary(state.reportSummary.filterEnd, "end");
    const reportMap = new Map();

    bookings
      .filter((item) => item.status !== "cancelled")
      .forEach((item) => {
        const startTime = new Date(item.startTime);
        const endTime = new Date(item.endTime);

        if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
          return;
        }

        if (startBoundary && startTime.getTime() < startBoundary.getTime()) {
          return;
        }

        if (endBoundary && startTime.getTime() > endBoundary.getTime()) {
          return;
        }

        const key = buildAggregatePeriodKey(startTime, cycle);
        const boundaries = getPeriodBoundaries(startTime, cycle);
        const chargingPoint = chargingPointMap.get(item.chargingPoint?.id) || null;
        const powerKw = Number(chargingPoint?.powerKw || item.chargingPoint?.powerKw || 0);
        const pricePerKwh = Number(chargingPoint?.pricing?.pricePerKwh || 0);
        const pricePerMinute = Number(chargingPoint?.pricing?.pricePerMinute || 0);
        const durationMinutes = Math.max(0, Math.round((endTime.getTime() - startTime.getTime()) / 60000));
        const estimatedKwh = (powerKw * durationMinutes) / 60;
        const estimatedRevenue = estimatedKwh * pricePerKwh + durationMinutes * pricePerMinute;
        const source = classifyAggregateBooking(item);

        if (!reportMap.has(key)) {
          reportMap.set(key, {
            key,
            label: formatAggregatePeriodLabel(startTime, cycle),
            start: boundaries.start,
            end: boundaries.end,
            totalRevenue: 0,
            totalKwh: 0,
            totalMinutes: 0,
            totalSessions: 0,
            walkIn: 0,
            booked: 0,
            instant: 0
          });
        }

        const row = reportMap.get(key);
        row.totalRevenue += estimatedRevenue;
        row.totalKwh += estimatedKwh;
        row.totalMinutes += durationMinutes;
        row.totalSessions += 1;

        if (source === "walk-in") {
          row.walkIn += 1;
        } else if (source === "instant") {
          row.instant += 1;
        } else {
          row.booked += 1;
        }
      });

    return Array.from(reportMap.values()).sort((left, right) => right.start.getTime() - left.start.getTime());
  }

  function renderAggregateReportSummary(rows) {
    const totals = rows.reduce(
      (accumulator, row) => {
        accumulator.revenue += row.totalRevenue;
        accumulator.kwh += row.totalKwh;
        accumulator.sessions += row.totalSessions;
        accumulator.minutes += row.totalMinutes;
        return accumulator;
      },
      { revenue: 0, kwh: 0, sessions: 0, minutes: 0 }
    );

    setSummary([
      { label: "Tong chu ky", value: String(rows.length) },
      { label: "Tong doanh thu", value: `${formatNumber(Math.round(totals.revenue))} VND` },
      { label: "Tong nang luong", value: `${formatNumber(totals.kwh.toFixed(1))} kWh` },
      { label: "Tong luot sac", value: String(totals.sessions) },
      { label: "Tong thoi gian sac", value: formatMinutesAsDuration(totals.minutes) }
    ]);
  }

  function renderAggregateReportToolbar() {
    return `
      <div class="booking-history-filter-grid">
        <div class="management-form-field">
          <label for="aggregateReportStartDate">Thoi gian bat dau</label>
          <input id="aggregateReportStartDate" type="date" value="${escapeHtml(
            state.reportSummary.filterStart
          )}">
        </div>
        <div class="management-form-field">
          <label for="aggregateReportEndDate">Thoi gian ket thuc</label>
          <input id="aggregateReportEndDate" type="date" value="${escapeHtml(
            state.reportSummary.filterEnd
          )}">
        </div>
        <div class="management-form-field">
          <label for="aggregateReportCycle">Chu ky</label>
          <select id="aggregateReportCycle">
            <option value="year" ${state.reportSummary.cycle === "year" ? "selected" : ""}>Nam</option>
            <option value="month" ${state.reportSummary.cycle === "month" ? "selected" : ""}>Thang</option>
            <option value="week" ${state.reportSummary.cycle === "week" ? "selected" : ""}>Tuan</option>
            <option value="day" ${state.reportSummary.cycle === "day" ? "selected" : ""}>Ngay</option>
          </select>
        </div>
        <div class="station-admin-search-actions">
          <button type="button" class="primary-btn" data-action="apply-aggregate-report-search">Tim kiem</button>
          <button type="button" class="outline-btn" data-action="reset-aggregate-report-search">Dat lai</button>
        </div>
      </div>
    `;
  }

  function renderAggregateReportPanel() {
    const rows = buildAggregateReportRows();
    state.reportSummary.rows = rows;
    renderAggregateReportSummary(rows);

    if (els.managementTitle) {
      els.managementTitle.textContent = "Bao cao tong hop";
    }

    if (els.managementLead) {
      els.managementLead.textContent =
        "Tong hop doanh thu, nang luong, thoi gian sac va so luot sac theo nam, thang, tuan hoac ngay.";
    }

    if (!els.managementContent) {
      return;
    }

    els.managementContent.innerHTML = `
      <section class="management-card aggregate-report-panel">
        <div class="management-panel-header">
          <div>
            <h2>Bao cao tong hop</h2>
            <p>Hien thi du lieu tong hop theo cac chu ky nam, thang, tuan va ngay tu danh sach booking va cong sac hien co.</p>
          </div>
        </div>
        ${renderAggregateReportToolbar()}
        <div class="management-table-card">
          ${
            rows.length
              ? `
                <div class="management-table-scroll">
                  <table class="management-table aggregate-report-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Chu ky</th>
                        <th>Bat dau</th>
                        <th>Ket thuc</th>
                        <th>Tong tien (VND)</th>
                        <th>Cong suat (kWh)</th>
                        <th>Tong thoi gian sac</th>
                        <th>Tong so lan sac</th>
                        <th>Vang lai</th>
                        <th>Dat lich</th>
                        <th>Sac ngay</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${rows
                        .map(
                          (row, index) => `
                            <tr>
                              <td>${index + 1}</td>
                              <td><strong>${escapeHtml(row.label)}</strong></td>
                              <td>${escapeHtml(formatDate(row.start))}</td>
                              <td>${escapeHtml(formatDate(row.end))}</td>
                              <td>${escapeHtml(formatNumber(Math.round(row.totalRevenue)))}</td>
                              <td>${escapeHtml(formatNumber(row.totalKwh.toFixed(1)))}</td>
                              <td>${escapeHtml(formatMinutesAsDuration(row.totalMinutes))}</td>
                              <td>${escapeHtml(formatNumber(row.totalSessions))}</td>
                              <td>${escapeHtml(formatNumber(row.walkIn))}</td>
                              <td>${escapeHtml(formatNumber(row.booked))}</td>
                              <td>${escapeHtml(formatNumber(row.instant))}</td>
                            </tr>
                          `
                        )
                        .join("")}
                    </tbody>
                  </table>
                </div>
              `
              : '<p class="management-empty">Khong co du lieu tong hop phu hop voi bo loc hien tai.</p>'
          }
        </div>
      </section>
    `;
  }

  async function renderAggregateReportPanelAsync(forceRefresh = false) {
    if (!hasSession()) {
      showLoginPrompt();
      return;
    }

    try {
      setStatus("Dang tai bao cao tong hop...");
      await loadAggregateReportData(forceRefresh);
      renderAggregateReportPanel();
      setStatus(`Da tong hop ${state.reportSummary.rows.length} chu ky bao cao.`);
    } catch (error) {
      setStatus(error.message || "Khong the tai bao cao tong hop.", true);
    }
  }

  function renderGenericSummary(view, items) {
    setSummary([
      { label: "Tổng bản ghi", value: String(items.length) },
      {
        label: "Bộ lọc",
        value: state.genericSearch ? `"${state.genericSearch}"` : "Tất cả"
      },
      {
        label: "Loại dữ liệu",
        value: panelMeta[view]?.title || view
      },
      {
        label: "Cập nhật gần nhất",
        value: items[0]?.updatedAt ? formatDate(items[0].updatedAt) : "--"
      }
    ]);
  }

  function buildGenericColumns(panelKey) {
    if (panelKey === "stations") {
      return [
        {
          label: "Trạm sạc",
          render(item) {
            return `<strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.address)}</small>`;
          }
        },
        {
          label: "Tọa độ",
          render(item) {
            return `${escapeHtml(item.location?.lat)} / ${escapeHtml(item.location?.lng)}`;
          }
        },
        {
          label: "Trạng thái",
          render(item) {
            return renderStatusBadge(item.status);
          }
        }
      ];
    }

    if (panelKey === "charging-points") {
      return [
        {
          label: "Cổng sạc",
          render(item) {
            return `<strong>${escapeHtml(item.code)}</strong><small>${escapeHtml(
              item.station?.name || "--"
            )}</small>`;
          }
        },
        {
          label: "Thông số",
          render(item) {
            return `${escapeHtml(item.connectorType)} | ${escapeHtml(item.powerKw)} kW`;
          }
        },
        {
          label: "Trạng thái",
          render(item) {
            return renderStatusBadge(item.status);
          }
        }
      ];
    }

    if (panelKey === "pricings") {
      return [
        {
          label: "Bảng giá",
          render(item) {
            return `<strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(
              formatDate(item.updatedAt)
            )}</small>`;
          }
        },
        {
          label: "Giá / kWh",
          render(item) {
            return `${formatNumber(item.pricePerKwh)} VND`;
          }
        },
        {
          label: "Giá / phút",
          render(item) {
            return `${formatNumber(item.pricePerMinute || 0)} VND`;
          }
        }
      ];
    }

    return [
      {
        label: "Khách hàng",
        render(item) {
          return `<strong>${escapeHtml(item.user?.fullName || "--")}</strong><small>${escapeHtml(
            item.user?.email || "--"
          )}</small>`;
        }
      },
      {
        label: "Cổng sạc",
        render(item) {
          return `<strong>${escapeHtml(item.chargingPoint?.code || "--")}</strong><small>${escapeHtml(
            item.chargingPoint?.station?.name || "--"
          )}</small>`;
        }
      },
      {
        label: "Trạng thái",
        render(item) {
          return renderStatusBadge(item.status);
        }
      }
    ];
  }

  async function renderGenericPanel(view, forceRefresh = false) {
    if (!hasSession()) {
      showLoginPrompt();
      return;
    }

    const panelKey = entityPanelMap[view];
    const config = window.adminEntityConfigs?.[panelKey];

    if (!config) {
      setStatus("Không tìm thấy cấu hình cho panel này.", true);
      return;
    }

    try {
      setStatus("Đang tải dữ liệu quản lý...");

      if (forceRefresh || !state.cache[panelKey]) {
        const data = await requestJson(config.listEndpoint);
        state.cache[panelKey] = Array.isArray(data.items) ? data.items : [];
      }

      const items = state.cache[panelKey] || [];
      const query = state.genericSearch.trim().toLowerCase();
      const filteredItems = query
        ? items.filter((item) => String(config.searchText(item) || "").includes(query))
        : items;
      const columns = buildGenericColumns(panelKey);

      renderGenericSummary(view, items);

      if (els.managementContent) {
        els.managementContent.innerHTML = `
          <section class="management-card">
            <div class="management-panel-header">
              <div>
                <h2>${escapeHtml(panelMeta[view].title)}</h2>
                <p>${escapeHtml(panelMeta[view].lead)}</p>
              </div>
              <div class="management-toolbar-actions">
                <input id="genericPanelSearch" class="management-search" type="search" value="${escapeHtml(
                  state.genericSearch
                )}" placeholder="Tìm nhanh trong danh sách hiện tại">
              </div>
            </div>
            <div class="management-table-card">
              ${
                filteredItems.length
                  ? `
                    <div class="management-table-scroll">
                      <table class="management-table">
                        <thead>
                          <tr>
                            ${columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}
                            <th>Chức năng</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${filteredItems
                            .map(
                              (item) => `
                                <tr>
                                  ${columns.map((column) => `<td>${column.render(item)}</td>`).join("")}
                                  <td>
                                    <div class="management-table-actions">
                                      <button type="button" class="management-mini-btn" data-action="entity-edit" data-panel="${escapeHtml(
                                        panelKey
                                      )}" data-id="${escapeHtml(item.id)}">Sửa</button>
                                      <button type="button" class="management-mini-btn primary" data-action="entity-delete" data-panel="${escapeHtml(
                                        panelKey
                                      )}" data-id="${escapeHtml(item.id)}">Xóa</button>
                                    </div>
                                  </td>
                                </tr>
                              `
                            )
                            .join("")}
                        </tbody>
                      </table>
                    </div>
                  `
                  : '<p class="management-empty">Không có dữ liệu phù hợp.</p>'
              }
            </div>
          </section>
        `;
      }

      setStatus(`Đã tải ${items.length} bản ghi ${panelMeta[view].title.toLowerCase()}.`);
    } catch (error) {
      setStatus(error.message || "Không thể tải dữ liệu.", true);
    }
  }

  function renderPermissionGroupPanel() {
    const query = state.permissionGroups.search.trim().toLowerCase();
    const rows = query
      ? state.permissionGroups.items.filter((item) =>
          String(item.name || "")
            .toLowerCase()
            .includes(query)
        )
      : state.permissionGroups.items;

    setSummary([
      { label: "Tong vai tro", value: String(state.permissionGroups.items.length) },
      { label: "Ket qua loc", value: String(rows.length) }
    ]);

    if (!els.managementContent) {
      return;
    }

    els.managementContent.innerHTML = `
      <section class="management-card permission-simple-panel role-simple-panel">
        <div class="management-panel-header permission-simple-header">
          <div>
            <h2>Quan ly vai tro</h2>
            <p>Hien thi danh sach cac vai tro, tim kiem theo ten vai tro va cap nhat quyen cho vai tro.</p>
          </div>
          <button type="button" class="primary-btn" data-action="open-role-create">+ Tao moi</button>
        </div>
        <div class="role-search-grid">
          <div class="management-form-field">
            <label for="permissionGroupSearch">Ten vai tro</label>
            <input id="permissionGroupSearch" class="management-search" type="search" value="${escapeHtml(
              state.permissionGroups.search
            )}" placeholder="Nhap ten vai tro">
          </div>
          <div class="station-admin-search-actions">
            <button type="button" class="primary-btn" data-action="apply-role-search">Tim kiem</button>
            <button type="button" class="outline-btn" data-action="reset-role-search">Dat lai</button>
          </div>
        </div>
        <div class="management-table-card">
          ${
            rows.length
              ? `
                <div class="management-table-scroll">
                  <table class="management-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Ten</th>
                        <th>Khoa</th>
                        <th>Ten cha</th>
                        <th>Mo ta</th>
                        <th>Ngay tao</th>
                        <th>Chuc nang</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${rows
                        .map(
                          (item, index) => `
                            <tr>
                              <td>${index + 1}</td>
                              <td><strong>${escapeHtml(item.name || "--")}</strong></td>
                              <td>${escapeHtml(item.code || "--")}</td>
                              <td>${escapeHtml(item.parentGroup?.name || "Vai tro goc")}</td>
                              <td>${escapeHtml(item.description || "--")}</td>
                              <td>${escapeHtml(formatDate(item.createdAt))}</td>
                              <td>
                                <div class="management-table-actions">
                                  <button type="button" class="management-mini-btn" data-action="role-edit" data-id="${escapeHtml(item.id)}">Sua</button>
                                  <button type="button" class="management-mini-btn primary" data-action="role-delete" data-id="${escapeHtml(item.id)}">Xoa</button>
                                </div>
                              </td>
                            </tr>
                          `
                        )
                        .join("")}
                    </tbody>
                  </table>
                </div>
              `
              : '<p class="management-empty">Chua co vai tro phu hop voi bo loc hien tai.</p>'
          }
        </div>
      </section>
    `;
  }

  async function renderPermissionGroupPanelAsync(forceRefresh = false) {
    if (!hasSession()) {
      showLoginPrompt();
      return;
    }

    try {
      setStatus("Dang tai vai tro...");
      await loadAccounts(forceRefresh);
      await loadPermissionGroups(forceRefresh);
      renderPermissionGroupPanel();
      setStatus("Da tai danh sach vai tro.");
    } catch (error) {
      setStatus(error.message || "Khong the tai vai tro.", true);
    }
  }

  function renderPermissionItemPanel() {
    const query = state.permissions.searchName.trim().toLowerCase();
    const groupKey = state.permissions.searchGroupKey;
    const rows = state.permissions.items.filter((item) => {
      const matchesName = query
        ? [item.name || "", item.description || "", item.code || ""]
            .join(" ")
            .toLowerCase()
            .includes(query)
        : true;
      const matchesGroup = groupKey !== "all" ? item.groupKey === groupKey : true;
      return matchesName && matchesGroup;
    });

    setSummary([
      { label: "Tong quyen", value: String(state.permissions.items.length) },
      { label: "Tong nhom", value: String(state.permissions.groups.length) },
      { label: "Ket qua loc", value: String(rows.length) }
    ]);

    if (!els.managementContent) {
      return;
    }

    els.managementContent.innerHTML = `
      <section class="management-card permission-simple-panel permission-admin-panel">
        <div class="management-panel-header permission-simple-header">
          <div>
            <h2>Quan ly quyen</h2>
            <p>Hien thi danh sach cac quyen, tim kiem theo ten va nhom quyen, dong thoi cho phep tao moi quyen.</p>
          </div>
          <button type="button" class="primary-btn" data-action="open-permission-item-create">+ Tao moi</button>
        </div>
        <div class="permission-admin-search-grid">
          <div class="management-form-field">
            <label for="permissionSearchName">Ten quyen</label>
            <input id="permissionSearchName" class="management-search" type="search" value="${escapeHtml(
              state.permissions.searchName
            )}" placeholder="Nhap ten quyen">
          </div>
          <div class="management-form-field">
            <label for="permissionSearchGroup">Nhom quyen</label>
            <select id="permissionSearchGroup" class="management-search">
              <option value="all" ${groupKey === "all" ? "selected" : ""}>Tat ca</option>
              ${state.permissions.groups
                .map(
                  (group) => `
                    <option value="${escapeHtml(group.key)}" ${
                    groupKey === group.key ? "selected" : ""
                  }>${escapeHtml(group.name)}</option>
                  `
                )
                .join("")}
            </select>
          </div>
          <div class="station-admin-search-actions">
            <button type="button" class="primary-btn" data-action="apply-permission-item-search">Tim kiem</button>
            <button type="button" class="outline-btn" data-action="reset-permission-item-search">Dat lai</button>
          </div>
        </div>
        <div class="management-table-card">
          ${
            rows.length
              ? `
                <div class="management-table-scroll">
                  <table class="management-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Ten</th>
                        <th>Nhom</th>
                        <th>Mo ta</th>
                        <th>Ngay tao</th>
                        <th>Chuc nang</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${rows
                        .map(
                          (item, index) => `
                            <tr>
                              <td>${index + 1}</td>
                              <td><strong>${escapeHtml(item.name || "--")}</strong></td>
                              <td>${escapeHtml(item.groupName || "--")}</td>
                              <td>${escapeHtml(item.description || "--")}</td>
                              <td>${escapeHtml(formatDate(item.createdAt))}</td>
                              <td>
                                <div class="management-table-actions">
                                  <button type="button" class="management-mini-btn" data-action="permission-item-edit" data-id="${escapeHtml(item.id)}">Sua</button>
                                  <button type="button" class="management-mini-btn primary" data-action="permission-item-delete" data-id="${escapeHtml(item.id)}">Xoa</button>
                                </div>
                              </td>
                            </tr>
                          `
                        )
                        .join("")}
                    </tbody>
                  </table>
                </div>
              `
              : '<p class="management-empty">Chua co quyen phu hop voi bo loc hien tai.</p>'
          }
        </div>
      </section>
    `;
  }

  async function renderPermissionItemPanelAsync(forceRefresh = false) {
    if (!hasSession()) {
      showLoginPrompt();
      return;
    }

    try {
      setStatus("Dang tai quyen...");
      await loadPermissions(forceRefresh);
      renderPermissionItemPanel();
      setStatus("Da tai danh sach quyen.");
    } catch (error) {
      setStatus(error.message || "Khong the tai quyen.", true);
    }
  }

  function resetPermissionModal() {
    state.permissions.mode = "create";
    state.permissions.editingId = "";

    if (els.permissionModalId) {
      els.permissionModalId.value = "";
    }

    if (els.permissionModalTitle) {
      els.permissionModalTitle.textContent = "Tao moi quyen";
    }

    if (els.permissionModalLead) {
      els.permissionModalLead.textContent = "Nhap day du thong tin bat buoc de tao moi quyen.";
    }

    if (els.permissionModalSubmitBtn) {
      els.permissionModalSubmitBtn.textContent = "Them";
    }

    if (els.permissionModalName) {
      els.permissionModalName.value = "";
    }

    if (els.permissionModalDescription) {
      els.permissionModalDescription.value = "";
    }

    renderPermissionGroupOptions("");
  }

  function openPermissionItemCreateModal() {
    resetPermissionModal();
    openBackdrop(els.permissionModal);
  }

  function openPermissionItemEditModal(permissionId) {
    const item = state.permissions.items.find((permission) => permission.id === permissionId);

    if (!item) {
      setStatus("Khong tim thay quyen can cap nhat.", true);
      return;
    }

    state.permissions.mode = "edit";
    state.permissions.editingId = item.id;

    if (els.permissionModalId) {
      els.permissionModalId.value = item.id;
    }

    if (els.permissionModalTitle) {
      els.permissionModalTitle.textContent = "Sua quyen";
    }

    if (els.permissionModalLead) {
      els.permissionModalLead.textContent = "Cap nhat thong tin co ban cua quyen nay.";
    }

    if (els.permissionModalSubmitBtn) {
      els.permissionModalSubmitBtn.textContent = "Luu thay doi";
    }

    if (els.permissionModalName) {
      els.permissionModalName.value = item.name || "";
    }

    if (els.permissionModalDescription) {
      els.permissionModalDescription.value = item.description || "";
    }

    renderPermissionGroupOptions(item.groupKey || "");
    openBackdrop(els.permissionModal);
  }

  const loginPageThemeOptions = ["login-v1", "login-v2", "login-v3"];

  function getLoginPageById(loginPageId) {
    return state.loginPages.items.find((item) => item.id === loginPageId) || null;
  }

  function setLoginPageAssetText(type, message) {
    const textMap = {
      logo: els.loginPageModalLogoText,
      icon: els.loginPageModalIconText,
      background: els.loginPageModalBackgroundText
    };

    const target = textMap[type];

    if (target) {
      target.textContent = message;
    }
  }

  function populateLoginPageThemeSelect(selectedTheme = "login-v1") {
    if (!els.loginPageModalTheme) {
      return;
    }

    els.loginPageModalTheme.innerHTML = loginPageThemeOptions
      .map(
        (theme) => `
          <option value="${escapeHtml(theme)}" ${selectedTheme === theme ? "selected" : ""}>${escapeHtml(theme)}</option>
        `
      )
      .join("");
  }

  function resetLoginPageModal() {
    state.loginPages.mode = "create";
    state.loginPages.editingId = "";

    if (els.loginPageModalId) {
      els.loginPageModalId.value = "";
    }

    if (els.loginPageModalTitle) {
      els.loginPageModalTitle.textContent = "Tao moi trang dang nhap";
    }

    if (els.loginPageModalLead) {
      els.loginPageModalLead.textContent =
        "Nhap day du thong tin bat buoc de tao moi trang dang nhap theo host.";
    }

    if (els.loginPageModalSubmitBtn) {
      els.loginPageModalSubmitBtn.textContent = "Them";
    }

    if (els.loginPageModalHost) {
      els.loginPageModalHost.value = "";
    }

    if (els.loginPageModalTitleInput) {
      els.loginPageModalTitleInput.value = "";
    }

    if (els.loginPageModalCompanyName) {
      els.loginPageModalCompanyName.value = "";
    }

    if (els.loginPageModalWebsite) {
      els.loginPageModalWebsite.value = "";
    }

    if (els.loginPageModalDescription) {
      els.loginPageModalDescription.value = "";
    }

    if (els.loginPageModalLogoImage) {
      els.loginPageModalLogoImage.value = "";
    }

    if (els.loginPageModalIconImage) {
      els.loginPageModalIconImage.value = "";
    }

    if (els.loginPageModalBackgroundImage) {
      els.loginPageModalBackgroundImage.value = "";
    }

    if (els.loginPageModalIosAppLink) {
      els.loginPageModalIosAppLink.value = "";
    }

    if (els.loginPageModalAndroidAppLink) {
      els.loginPageModalAndroidAppLink.value = "";
    }

    if (els.loginPageModalGuideLink) {
      els.loginPageModalGuideLink.value = "";
    }

    if (els.loginPageModalServicePhone) {
      els.loginPageModalServicePhone.value = "";
    }

    if (els.loginPageModalSupportPhone) {
      els.loginPageModalSupportPhone.value = "";
    }

    if (els.loginPageModalLogoUpload) {
      els.loginPageModalLogoUpload.value = "";
    }

    if (els.loginPageModalIconUpload) {
      els.loginPageModalIconUpload.value = "";
    }

    if (els.loginPageModalBackgroundUpload) {
      els.loginPageModalBackgroundUpload.value = "";
    }

    populateLoginPageThemeSelect("login-v1");
    setLoginPageAssetText("logo", "Chua chon logo");
    setLoginPageAssetText("icon", "Chua chon icon");
    setLoginPageAssetText("background", "Chua chon anh nen");
  }

  function openLoginPageCreateModal() {
    resetLoginPageModal();
    openBackdrop(els.loginPageModal);
  }

  function openLoginPageEditModal(loginPageId) {
    const item = getLoginPageById(loginPageId);

    if (!item) {
      setStatus("Khong tim thay trang dang nhap can cap nhat.", true);
      return;
    }

    state.loginPages.mode = "edit";
    state.loginPages.editingId = item.id;

    if (els.loginPageModalId) {
      els.loginPageModalId.value = item.id;
    }

    if (els.loginPageModalTitle) {
      els.loginPageModalTitle.textContent = "Sua trang dang nhap";
    }

    if (els.loginPageModalLead) {
      els.loginPageModalLead.textContent =
        "Cap nhat host, giao dien va cac lien ket hien thi tren trang dang nhap.";
    }

    if (els.loginPageModalSubmitBtn) {
      els.loginPageModalSubmitBtn.textContent = "Luu thay doi";
    }

    if (els.loginPageModalHost) {
      els.loginPageModalHost.value = item.host || "";
    }

    if (els.loginPageModalTitleInput) {
      els.loginPageModalTitleInput.value = item.title || "";
    }

    if (els.loginPageModalCompanyName) {
      els.loginPageModalCompanyName.value = item.companyName || "";
    }

    if (els.loginPageModalWebsite) {
      els.loginPageModalWebsite.value = item.website || "";
    }

    if (els.loginPageModalDescription) {
      els.loginPageModalDescription.value = item.description || "";
    }

    if (els.loginPageModalLogoImage) {
      els.loginPageModalLogoImage.value = item.logoImage || "";
    }

    if (els.loginPageModalIconImage) {
      els.loginPageModalIconImage.value = item.iconImage || "";
    }

    if (els.loginPageModalBackgroundImage) {
      els.loginPageModalBackgroundImage.value = item.backgroundImage || "";
    }

    if (els.loginPageModalIosAppLink) {
      els.loginPageModalIosAppLink.value = item.iosAppLink || "";
    }

    if (els.loginPageModalAndroidAppLink) {
      els.loginPageModalAndroidAppLink.value = item.androidAppLink || "";
    }

    if (els.loginPageModalGuideLink) {
      els.loginPageModalGuideLink.value = item.guideLink || "";
    }

    if (els.loginPageModalServicePhone) {
      els.loginPageModalServicePhone.value = item.servicePhone || "";
    }

    if (els.loginPageModalSupportPhone) {
      els.loginPageModalSupportPhone.value = item.supportPhone || "";
    }

    populateLoginPageThemeSelect(item.theme || "login-v1");
    setLoginPageAssetText("logo", item.logoImage ? "Da co logo" : "Chua chon logo");
    setLoginPageAssetText("icon", item.iconImage ? "Da co icon" : "Chua chon icon");
    setLoginPageAssetText(
      "background",
      item.backgroundImage ? "Da co anh nen" : "Chua chon anh nen"
    );
    openBackdrop(els.loginPageModal);
  }

  async function readLoginPageImage(file) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        reject(new Error("Chi ho tro tep anh cho logo, icon va anh nen."));
        return;
      }

      if (file.size > 1024 * 1024) {
        reject(new Error("Moi tep anh phai nho hon 1 MB."));
        return;
      }

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        resolve(String(reader.result || ""));
      });
      reader.addEventListener("error", () => {
        reject(new Error("Khong the doc tep anh da chon."));
      });
      reader.readAsDataURL(file);
    });
  }

  async function handleLoginPageAssetChange(type, file) {
    if (!file) {
      return;
    }

    const fieldMap = {
      logo: els.loginPageModalLogoImage,
      icon: els.loginPageModalIconImage,
      background: els.loginPageModalBackgroundImage
    };

    const field = fieldMap[type];

    try {
      const dataUrl = await readLoginPageImage(file);

      if (field) {
        field.value = dataUrl;
      }

      setLoginPageAssetText(type, file.name);
    } catch (error) {
      setStatus(error.message || "Khong the tai tep anh.", true);
    }
  }

  function renderLoginPagePanel() {
    const hostQuery = state.loginPages.searchHost.trim().toLowerCase();
    const titleQuery = state.loginPages.searchTitle.trim().toLowerCase();
    const companyQuery = state.loginPages.searchCompanyName.trim().toLowerCase();
    const websiteQuery = state.loginPages.searchWebsite.trim().toLowerCase();
    const rows = state.loginPages.items.filter((item) => {
      const matchesHost = hostQuery ? String(item.host || "").toLowerCase().includes(hostQuery) : true;
      const matchesTitle = titleQuery ? String(item.title || "").toLowerCase().includes(titleQuery) : true;
      const matchesCompany = companyQuery
        ? String(item.companyName || "").toLowerCase().includes(companyQuery)
        : true;
      const matchesWebsite = websiteQuery
        ? String(item.website || "").toLowerCase().includes(websiteQuery)
        : true;
      return matchesHost && matchesTitle && matchesCompany && matchesWebsite;
    });
    const themeCount = new Set(state.loginPages.items.map((item) => item.theme || "")).size;

    setSummary([
      { label: "Tong trang", value: String(state.loginPages.items.length) },
      { label: "Tong theme", value: String(themeCount) },
      { label: "Ket qua loc", value: String(rows.length) }
    ]);

    if (!els.managementContent) {
      return;
    }

    els.managementContent.innerHTML = `
      <section class="management-card permission-simple-panel login-page-panel">
        <div class="management-panel-header permission-simple-header">
          <div>
            <h2>Quan ly trang dang nhap</h2>
            <p>Quan ly host, logo, icon, anh nen va lien ket tai ung dung cho tung trang dang nhap.</p>
          </div>
          <button type="button" class="primary-btn" data-action="open-login-page-create">+ Tao moi</button>
        </div>
        <div class="login-page-search-grid">
          <div class="management-form-field">
            <label for="loginPageSearchHost">Host</label>
            <input id="loginPageSearchHost" class="management-search" type="search" value="${escapeHtml(
              state.loginPages.searchHost
            )}" placeholder="Nhap host">
          </div>
          <div class="management-form-field">
            <label for="loginPageSearchTitle">Tieu de</label>
            <input id="loginPageSearchTitle" class="management-search" type="search" value="${escapeHtml(
              state.loginPages.searchTitle
            )}" placeholder="Nhap tieu de">
          </div>
          <div class="management-form-field">
            <label for="loginPageSearchCompanyName">Ten cong ty</label>
            <input id="loginPageSearchCompanyName" class="management-search" type="search" value="${escapeHtml(
              state.loginPages.searchCompanyName
            )}" placeholder="Nhap ten cong ty">
          </div>
          <div class="management-form-field">
            <label for="loginPageSearchWebsite">Website</label>
            <input id="loginPageSearchWebsite" class="management-search" type="search" value="${escapeHtml(
              state.loginPages.searchWebsite
            )}" placeholder="Nhap website">
          </div>
          <div class="station-admin-search-actions">
            <button type="button" class="primary-btn" data-action="apply-login-page-search">Tim kiem</button>
            <button type="button" class="outline-btn" data-action="reset-login-page-search">Dat lai</button>
          </div>
        </div>
        <div class="management-table-card">
          ${
            rows.length
              ? `
                <div class="management-table-scroll">
                  <table class="management-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Host</th>
                        <th>Tieu de</th>
                        <th>Website</th>
                        <th>Ten cong ty</th>
                        <th>Theme</th>
                        <th>Mo ta</th>
                        <th>Ngay tao</th>
                        <th>Chuc nang</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${rows
                        .map(
                          (item, index) => `
                            <tr>
                              <td>${index + 1}</td>
                              <td><strong>${escapeHtml(item.host || "--")}</strong></td>
                              <td>${escapeHtml(item.title || "--")}</td>
                              <td>${escapeHtml(item.website || "--")}</td>
                              <td>${escapeHtml(item.companyName || "--")}</td>
                              <td>${escapeHtml(item.theme || "--")}</td>
                              <td>${escapeHtml(item.description || "--")}</td>
                              <td>${escapeHtml(formatDate(item.createdAt))}</td>
                              <td>
                                <div class="management-table-actions">
                                  <button type="button" class="management-mini-btn" data-action="login-page-edit" data-id="${escapeHtml(item.id)}">Sua</button>
                                  <button type="button" class="management-mini-btn primary" data-action="login-page-delete" data-id="${escapeHtml(item.id)}">Xoa</button>
                                </div>
                              </td>
                            </tr>
                          `
                        )
                        .join("")}
                    </tbody>
                  </table>
                </div>
              `
              : '<p class="management-empty">Chua co trang dang nhap phu hop voi bo loc hien tai.</p>'
          }
        </div>
      </section>
    `;
  }

  async function renderLoginPagePanelAsync(forceRefresh = false) {
    if (!hasSession()) {
      showLoginPrompt();
      return;
    }

    try {
      setStatus("Dang tai trang dang nhap...");
      await loadLoginPages(forceRefresh);
      renderLoginPagePanel();
      setStatus("Da tai danh sach trang dang nhap.");
    } catch (error) {
      setStatus(error.message || "Khong the tai trang dang nhap.", true);
    }
  }

  function getSimTypeById(simTypeId) {
    return state.simTypes.items.find((item) => item.id === simTypeId) || null;
  }

  function renderSimTypePanel() {
    const nameQuery = state.simTypes.searchName.trim().toLowerCase();
    const codeQuery = state.simTypes.searchCode.trim().toLowerCase();
    const rows = state.simTypes.items.filter((item) => {
      const matchesName = nameQuery ? String(item.name || "").toLowerCase().includes(nameQuery) : true;
      const matchesCode = codeQuery ? String(item.code || "").toLowerCase().includes(codeQuery) : true;
      return matchesName && matchesCode;
    });

    setSummary([
      { label: "Tong loai sim", value: String(state.simTypes.items.length) },
      { label: "Ket qua loc", value: String(rows.length) }
    ]);

    if (!els.managementContent) {
      return;
    }

    els.managementContent.innerHTML = `
      <section class="management-card permission-simple-panel sim-type-panel">
        <div class="management-panel-header permission-simple-header">
          <div>
            <h2>Quan ly loai sim</h2>
            <p>Hien thi danh sach loai sim, tim kiem theo ten va ma, dong thoi cho phep tao moi loai sim.</p>
          </div>
          <button type="button" class="primary-btn" data-action="open-sim-type-create">+ Tao moi</button>
        </div>
        <div class="sim-type-search-grid">
          <div class="management-form-field">
            <label for="simTypeSearchName">Ten</label>
            <input id="simTypeSearchName" class="management-search" type="search" value="${escapeHtml(
              state.simTypes.searchName
            )}" placeholder="Nhap ten loai sim">
          </div>
          <div class="management-form-field">
            <label for="simTypeSearchCode">Ma</label>
            <input id="simTypeSearchCode" class="management-search" type="search" value="${escapeHtml(
              state.simTypes.searchCode
            )}" placeholder="Nhap ma loai sim">
          </div>
          <div class="station-admin-search-actions">
            <button type="button" class="primary-btn" data-action="apply-sim-type-search">Tim kiem</button>
            <button type="button" class="outline-btn" data-action="reset-sim-type-search">Dat lai</button>
          </div>
        </div>
        <div class="management-table-card">
          ${
            rows.length
              ? `
                <div class="management-table-scroll">
                  <table class="management-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Ten</th>
                        <th>Ma</th>
                        <th>Mo ta</th>
                        <th>Ngay tao</th>
                        <th>Chuc nang</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${rows
                        .map(
                          (item, index) => `
                            <tr>
                              <td>${index + 1}</td>
                              <td><strong>${escapeHtml(item.name || "--")}</strong></td>
                              <td>${escapeHtml(item.code || "--")}</td>
                              <td>${escapeHtml(item.description || "--")}</td>
                              <td>${escapeHtml(formatDate(item.createdAt))}</td>
                              <td>
                                <div class="management-table-actions">
                                  <button type="button" class="management-mini-btn" data-action="sim-type-edit" data-id="${escapeHtml(item.id)}">Sua</button>
                                  <button type="button" class="management-mini-btn primary" data-action="sim-type-delete" data-id="${escapeHtml(item.id)}">Xoa</button>
                                </div>
                              </td>
                            </tr>
                          `
                        )
                        .join("")}
                    </tbody>
                  </table>
                </div>
              `
              : '<p class="management-empty">Chua co loai sim phu hop voi bo loc hien tai.</p>'
          }
        </div>
      </section>
    `;
  }

  async function renderSimTypePanelAsync(forceRefresh = false) {
    if (!hasSession()) {
      showLoginPrompt();
      return;
    }

    try {
      setStatus("Dang tai loai sim...");
      await loadSimTypes(forceRefresh);
      renderSimTypePanel();
      setStatus("Da tai danh sach loai sim.");
    } catch (error) {
      setStatus(error.message || "Khong the tai loai sim.", true);
    }
  }

  function resetSimTypeModal() {
    state.simTypes.mode = "create";
    state.simTypes.editingId = "";

    if (els.simTypeModalId) {
      els.simTypeModalId.value = "";
    }

    if (els.simTypeModalTitle) {
      els.simTypeModalTitle.textContent = "Tao moi loai SIM";
    }

    if (els.simTypeModalLead) {
      els.simTypeModalLead.textContent = "Nhap day du thong tin bat buoc de tao moi loai sim.";
    }

    if (els.simTypeModalSubmitBtn) {
      els.simTypeModalSubmitBtn.textContent = "Them";
    }

    if (els.simTypeModalName) {
      els.simTypeModalName.value = "";
    }

    if (els.simTypeModalCode) {
      els.simTypeModalCode.value = "";
    }

    if (els.simTypeModalDescription) {
      els.simTypeModalDescription.value = "";
    }
  }

  function openSimTypeCreateModal() {
    resetSimTypeModal();
    openBackdrop(els.simTypeModal);
  }

  function openSimTypeEditModal(simTypeId) {
    const item = getSimTypeById(simTypeId);

    if (!item) {
      setStatus("Khong tim thay loai sim can cap nhat.", true);
      return;
    }

    state.simTypes.mode = "edit";
    state.simTypes.editingId = item.id;

    if (els.simTypeModalId) {
      els.simTypeModalId.value = item.id;
    }

    if (els.simTypeModalTitle) {
      els.simTypeModalTitle.textContent = "Sua loai SIM";
    }

    if (els.simTypeModalLead) {
      els.simTypeModalLead.textContent = "Cap nhat thong tin co ban cua loai sim nay.";
    }

    if (els.simTypeModalSubmitBtn) {
      els.simTypeModalSubmitBtn.textContent = "Luu thay doi";
    }

    if (els.simTypeModalName) {
      els.simTypeModalName.value = item.name || "";
    }

    if (els.simTypeModalCode) {
      els.simTypeModalCode.value = item.code || "";
    }

    if (els.simTypeModalDescription) {
      els.simTypeModalDescription.value = item.description || "";
    }

    openBackdrop(els.simTypeModal);
  }

  function getDeviceTypeById(deviceTypeId) {
    return state.deviceTypes.items.find((item) => item.id === deviceTypeId) || null;
  }

  function setDeviceTypeImageText(message) {
    if (els.deviceTypeModalImageText) {
      els.deviceTypeModalImageText.textContent = message;
    }
  }

  function renderDeviceTypePanel() {
    const nameQuery = state.deviceTypes.searchName.trim().toLowerCase();
    const codeQuery = state.deviceTypes.searchCode.trim().toLowerCase();
    const manufacturerQuery = state.deviceTypes.searchManufacturer.trim().toLowerCase();
    const rows = state.deviceTypes.items.filter((item) => {
      const matchesName = nameQuery ? String(item.name || "").toLowerCase().includes(nameQuery) : true;
      const matchesCode = codeQuery ? String(item.code || "").toLowerCase().includes(codeQuery) : true;
      const matchesManufacturer = manufacturerQuery
        ? String(item.manufacturer || "").toLowerCase().includes(manufacturerQuery)
        : true;
      return matchesName && matchesCode && matchesManufacturer;
    });
    const manufacturerCount = new Set(
      state.deviceTypes.items.map((item) => String(item.manufacturer || "").trim()).filter(Boolean)
    ).size;

    setSummary([
      { label: "Tong loai thiet bi", value: String(state.deviceTypes.items.length) },
      { label: "Tong nha san xuat", value: String(manufacturerCount) },
      { label: "Ket qua loc", value: String(rows.length) }
    ]);

    if (!els.managementContent) {
      return;
    }

    els.managementContent.innerHTML = `
      <section class="management-card permission-simple-panel device-type-panel">
        <div class="management-panel-header permission-simple-header">
          <div>
            <h2>Quan ly loai thiet bi</h2>
            <p>Hien thi danh sach loai thiet bi, tim kiem theo ten, ma va nha san xuat, dong thoi cho phep tao moi loai thiet bi.</p>
          </div>
          <button type="button" class="primary-btn" data-action="open-device-type-create">+ Tao moi</button>
        </div>
        <div class="device-type-search-grid">
          <div class="management-form-field">
            <label for="deviceTypeSearchName">Ten</label>
            <input id="deviceTypeSearchName" class="management-search" type="search" value="${escapeHtml(
              state.deviceTypes.searchName
            )}" placeholder="Nhap ten loai thiet bi">
          </div>
          <div class="management-form-field">
            <label for="deviceTypeSearchCode">Ma</label>
            <input id="deviceTypeSearchCode" class="management-search" type="search" value="${escapeHtml(
              state.deviceTypes.searchCode
            )}" placeholder="Nhap ma loai thiet bi">
          </div>
          <div class="management-form-field">
            <label for="deviceTypeSearchManufacturer">Nha san xuat</label>
            <input id="deviceTypeSearchManufacturer" class="management-search" type="search" value="${escapeHtml(
              state.deviceTypes.searchManufacturer
            )}" placeholder="Nhap nha san xuat">
          </div>
          <div class="station-admin-search-actions">
            <button type="button" class="primary-btn" data-action="apply-device-type-search">Tim kiem</button>
            <button type="button" class="outline-btn" data-action="reset-device-type-search">Dat lai</button>
          </div>
        </div>
        <div class="management-table-card">
          ${
            rows.length
              ? `
                <div class="management-table-scroll">
                  <table class="management-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Ten</th>
                        <th>Ma</th>
                        <th>Nha san xuat</th>
                        <th>Mo ta</th>
                        <th>Ngay tao</th>
                        <th>Chuc nang</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${rows
                        .map(
                          (item, index) => `
                            <tr>
                              <td>${index + 1}</td>
                              <td><strong>${escapeHtml(item.name || "--")}</strong></td>
                              <td>${escapeHtml(item.code || "--")}</td>
                              <td>${escapeHtml(item.manufacturer || "--")}</td>
                              <td>${escapeHtml(item.description || "--")}</td>
                              <td>${escapeHtml(formatDate(item.createdAt))}</td>
                              <td>
                                <div class="management-table-actions">
                                  <button type="button" class="management-mini-btn" data-action="device-type-edit" data-id="${escapeHtml(item.id)}">Sua</button>
                                  <button type="button" class="management-mini-btn primary" data-action="device-type-delete" data-id="${escapeHtml(item.id)}">Xoa</button>
                                </div>
                              </td>
                            </tr>
                          `
                        )
                        .join("")}
                    </tbody>
                  </table>
                </div>
              `
              : '<p class="management-empty">Chua co loai thiet bi phu hop voi bo loc hien tai.</p>'
          }
        </div>
      </section>
    `;
  }

  async function renderDeviceTypePanelAsync(forceRefresh = false) {
    if (!hasSession()) {
      showLoginPrompt();
      return;
    }

    try {
      setStatus("Dang tai loai thiet bi...");
      await loadDeviceTypes(forceRefresh);
      renderDeviceTypePanel();
      setStatus("Da tai danh sach loai thiet bi.");
    } catch (error) {
      setStatus(error.message || "Khong the tai loai thiet bi.", true);
    }
  }

  function resetDeviceTypeModal() {
    state.deviceTypes.mode = "create";
    state.deviceTypes.editingId = "";

    if (els.deviceTypeModalId) {
      els.deviceTypeModalId.value = "";
    }

    if (els.deviceTypeModalTitle) {
      els.deviceTypeModalTitle.textContent = "Tao moi loai thiet bi";
    }

    if (els.deviceTypeModalLead) {
      els.deviceTypeModalLead.textContent =
        "Nhap day du thong tin bat buoc de tao moi loai thiet bi.";
    }

    if (els.deviceTypeModalSubmitBtn) {
      els.deviceTypeModalSubmitBtn.textContent = "Them";
    }

    if (els.deviceTypeModalName) {
      els.deviceTypeModalName.value = "";
    }

    if (els.deviceTypeModalCode) {
      els.deviceTypeModalCode.value = "";
    }

    if (els.deviceTypeModalManufacturer) {
      els.deviceTypeModalManufacturer.value = "";
    }

    if (els.deviceTypeModalDescription) {
      els.deviceTypeModalDescription.value = "";
    }

    if (els.deviceTypeModalImage) {
      els.deviceTypeModalImage.value = "";
    }

    if (els.deviceTypeModalImageUpload) {
      els.deviceTypeModalImageUpload.value = "";
    }

    setDeviceTypeImageText("Chua chon anh");
  }

  function openDeviceTypeCreateModal() {
    resetDeviceTypeModal();
    openBackdrop(els.deviceTypeModal);
  }

  function openDeviceTypeEditModal(deviceTypeId) {
    const item = getDeviceTypeById(deviceTypeId);

    if (!item) {
      setStatus("Khong tim thay loai thiet bi can cap nhat.", true);
      return;
    }

    state.deviceTypes.mode = "edit";
    state.deviceTypes.editingId = item.id;

    if (els.deviceTypeModalId) {
      els.deviceTypeModalId.value = item.id;
    }

    if (els.deviceTypeModalTitle) {
      els.deviceTypeModalTitle.textContent = "Sua loai thiet bi";
    }

    if (els.deviceTypeModalLead) {
      els.deviceTypeModalLead.textContent =
        "Cap nhat thong tin co ban cua loai thiet bi nay.";
    }

    if (els.deviceTypeModalSubmitBtn) {
      els.deviceTypeModalSubmitBtn.textContent = "Luu thay doi";
    }

    if (els.deviceTypeModalName) {
      els.deviceTypeModalName.value = item.name || "";
    }

    if (els.deviceTypeModalCode) {
      els.deviceTypeModalCode.value = item.code || "";
    }

    if (els.deviceTypeModalManufacturer) {
      els.deviceTypeModalManufacturer.value = item.manufacturer || "";
    }

    if (els.deviceTypeModalDescription) {
      els.deviceTypeModalDescription.value = item.description || "";
    }

    if (els.deviceTypeModalImage) {
      els.deviceTypeModalImage.value = item.image || "";
    }

    setDeviceTypeImageText(item.image ? "Da co anh" : "Chua chon anh");
    openBackdrop(els.deviceTypeModal);
  }

  async function handleDeviceTypeImageChange(file) {
    if (!file) {
      return;
    }

    try {
      const dataUrl = await readLoginPageImage(file);

      if (els.deviceTypeModalImage) {
        els.deviceTypeModalImage.value = dataUrl;
      }

      setDeviceTypeImageText(file.name);
    } catch (error) {
      setStatus(error.message || "Khong the tai tep anh loai thiet bi.", true);
    }
  }

  function getConnectorTypeById(connectorTypeId) {
    return state.connectorTypes.items.find((item) => item.id === connectorTypeId) || null;
  }

  function setConnectorTypeImageText(message) {
    if (els.connectorTypeModalImageText) {
      els.connectorTypeModalImageText.textContent = message;
    }
  }

  function renderConnectorTypePanel() {
    const nameQuery = state.connectorTypes.searchName.trim().toLowerCase();
    const shortNameQuery = state.connectorTypes.searchShortName.trim().toLowerCase();
    const rows = state.connectorTypes.items.filter((item) => {
      const matchesName = nameQuery ? String(item.name || "").toLowerCase().includes(nameQuery) : true;
      const matchesShortName = shortNameQuery
        ? String(item.shortName || "").toLowerCase().includes(shortNameQuery)
        : true;
      return matchesName && matchesShortName;
    });

    setSummary([
      { label: "Tong loai cong sac", value: String(state.connectorTypes.items.length) },
      { label: "Ket qua loc", value: String(rows.length) }
    ]);

    if (!els.managementContent) {
      return;
    }

    els.managementContent.innerHTML = `
      <section class="management-card permission-simple-panel connector-type-panel">
        <div class="management-panel-header permission-simple-header">
          <div>
            <h2>Quan ly loai cong sac</h2>
            <p>Hien thi danh sach cac loai cong sac, tim kiem theo ten va ten viet tat, dong thoi cho phep tao moi loai cong sac.</p>
          </div>
          <button type="button" class="primary-btn" data-action="open-connector-type-create">+ Tao moi</button>
        </div>
        <div class="connector-type-search-grid">
          <div class="management-form-field">
            <label for="connectorTypeSearchName">Ten cong sac</label>
            <input id="connectorTypeSearchName" class="management-search" type="search" value="${escapeHtml(
              state.connectorTypes.searchName
            )}" placeholder="Nhap ten cong sac">
          </div>
          <div class="management-form-field">
            <label for="connectorTypeSearchShortName">Ten viet tat</label>
            <input id="connectorTypeSearchShortName" class="management-search" type="search" value="${escapeHtml(
              state.connectorTypes.searchShortName
            )}" placeholder="Nhap ten viet tat">
          </div>
          <div class="station-admin-search-actions">
            <button type="button" class="primary-btn" data-action="apply-connector-type-search">Tim kiem</button>
            <button type="button" class="outline-btn" data-action="reset-connector-type-search">Dat lai</button>
          </div>
        </div>
        <div class="management-table-card">
          ${
            rows.length
              ? `
                <div class="management-table-scroll">
                  <table class="management-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Ten</th>
                        <th>Ten viet tat</th>
                        <th>Mo ta</th>
                        <th>Ngay tao</th>
                        <th>Chuc nang</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${rows
                        .map(
                          (item, index) => `
                            <tr>
                              <td>${index + 1}</td>
                              <td><strong>${escapeHtml(item.name || "--")}</strong></td>
                              <td>${escapeHtml(item.shortName || "--")}</td>
                              <td>${escapeHtml(item.description || "--")}</td>
                              <td>${escapeHtml(formatDate(item.createdAt))}</td>
                              <td>
                                <div class="management-table-actions">
                                  <button type="button" class="management-mini-btn" data-action="connector-type-edit" data-id="${escapeHtml(item.id)}">Sua</button>
                                  <button type="button" class="management-mini-btn primary" data-action="connector-type-delete" data-id="${escapeHtml(item.id)}">Xoa</button>
                                </div>
                              </td>
                            </tr>
                          `
                        )
                        .join("")}
                    </tbody>
                  </table>
                </div>
              `
              : '<p class="management-empty">Chua co loai cong sac phu hop voi bo loc hien tai.</p>'
          }
        </div>
      </section>
    `;
  }

  async function renderConnectorTypePanelAsync(forceRefresh = false) {
    if (!hasSession()) {
      showLoginPrompt();
      return;
    }

    try {
      setStatus("Dang tai loai cong sac...");
      await loadConnectorTypes(forceRefresh);
      renderConnectorTypePanel();
      setStatus("Da tai danh sach loai cong sac.");
    } catch (error) {
      setStatus(error.message || "Khong the tai loai cong sac.", true);
    }
  }

  function resetConnectorTypeModal() {
    state.connectorTypes.mode = "create";
    state.connectorTypes.editingId = "";

    if (els.connectorTypeModalId) {
      els.connectorTypeModalId.value = "";
    }

    if (els.connectorTypeModalTitle) {
      els.connectorTypeModalTitle.textContent = "Tao moi loai cong sac";
    }

    if (els.connectorTypeModalLead) {
      els.connectorTypeModalLead.textContent =
        "Nhap day du thong tin bat buoc de tao moi loai cong sac.";
    }

    if (els.connectorTypeModalSubmitBtn) {
      els.connectorTypeModalSubmitBtn.textContent = "Them";
    }

    if (els.connectorTypeModalName) {
      els.connectorTypeModalName.value = "";
    }

    if (els.connectorTypeModalShortName) {
      els.connectorTypeModalShortName.value = "";
    }

    if (els.connectorTypeModalChargingType) {
      els.connectorTypeModalChargingType.value = "";
    }

    if (els.connectorTypeModalCurrentType) {
      els.connectorTypeModalCurrentType.value = "";
    }

    if (els.connectorTypeModalDescription) {
      els.connectorTypeModalDescription.value = "";
    }

    if (els.connectorTypeModalImage) {
      els.connectorTypeModalImage.value = "";
    }

    if (els.connectorTypeModalImageUpload) {
      els.connectorTypeModalImageUpload.value = "";
    }

    setConnectorTypeImageText("Chua chon anh");
  }

  function openConnectorTypeCreateModal() {
    resetConnectorTypeModal();
    openBackdrop(els.connectorTypeModal);
  }

  function openConnectorTypeEditModal(connectorTypeId) {
    const item = getConnectorTypeById(connectorTypeId);

    if (!item) {
      setStatus("Khong tim thay loai cong sac can cap nhat.", true);
      return;
    }

    state.connectorTypes.mode = "edit";
    state.connectorTypes.editingId = item.id;

    if (els.connectorTypeModalId) {
      els.connectorTypeModalId.value = item.id;
    }

    if (els.connectorTypeModalTitle) {
      els.connectorTypeModalTitle.textContent = "Sua loai cong sac";
    }

    if (els.connectorTypeModalLead) {
      els.connectorTypeModalLead.textContent =
        "Cap nhat thong tin co ban cua loai cong sac nay.";
    }

    if (els.connectorTypeModalSubmitBtn) {
      els.connectorTypeModalSubmitBtn.textContent = "Luu thay doi";
    }

    if (els.connectorTypeModalName) {
      els.connectorTypeModalName.value = item.name || "";
    }

    if (els.connectorTypeModalShortName) {
      els.connectorTypeModalShortName.value = item.shortName || "";
    }

    if (els.connectorTypeModalChargingType) {
      els.connectorTypeModalChargingType.value = item.chargingType || "";
    }

    if (els.connectorTypeModalCurrentType) {
      els.connectorTypeModalCurrentType.value = item.currentType || "";
    }

    if (els.connectorTypeModalDescription) {
      els.connectorTypeModalDescription.value = item.description || "";
    }

    if (els.connectorTypeModalImage) {
      els.connectorTypeModalImage.value = item.image || "";
    }

    setConnectorTypeImageText(item.image ? "Da co anh" : "Chua chon anh");
    openBackdrop(els.connectorTypeModal);
  }

  async function handleConnectorTypeImageChange(file) {
    if (!file) {
      return;
    }

    try {
      const dataUrl = await readLoginPageImage(file);

      if (els.connectorTypeModalImage) {
        els.connectorTypeModalImage.value = dataUrl;
      }

      setConnectorTypeImageText(file.name);
    } catch (error) {
      setStatus(error.message || "Khong the tai tep anh loai cong sac.", true);
    }
  }

  function renderPermissionCatalogItems(items, selectedPermissions = [], level = 0) {
    return items
      .map((item) => {
        const childItems = Array.isArray(item.children) ? item.children : [];
        const childIds = childItems.map((child) => child.id);
        const allChildrenSelected = childIds.length
          ? childIds.every((id) => selectedPermissions.includes(id))
          : selectedPermissions.includes(item.id);

        if (!childItems.length) {
          return `
            <div class="role-permission-toggle role-permission-leaf">
              <label class="role-permission-switch">
                <input type="checkbox" value="${escapeHtml(item.id)}" ${
            selectedPermissions.includes(item.id) ? "checked" : ""
          } data-permission-checkbox>
                <span class="role-permission-slider"></span>
              </label>
              <span>${escapeHtml(item.name)}</span>
            </div>
          `;
        }

        return `
          <section class="role-permission-section">
            <div class="role-permission-section-head">
              <label class="role-permission-switch role-permission-switch-parent">
                <input type="checkbox" value="${escapeHtml(item.id)}" ${
          allChildrenSelected ? "checked" : ""
        } data-permission-checkbox data-permission-group-toggle="${escapeHtml(item.id)}">
                <span class="role-permission-slider"></span>
              </label>
              <strong>${escapeHtml(item.name)}</strong>
            </div>
            <div class="role-permission-grid">
              ${childItems
                .map(
                  (child) => `
                    <div class="role-permission-toggle">
                      <label class="role-permission-switch">
                        <input type="checkbox" value="${escapeHtml(child.id)}" ${
                    selectedPermissions.includes(child.id) ? "checked" : ""
                  } data-permission-checkbox data-parent-permission="${escapeHtml(item.id)}">
                        <span class="role-permission-slider"></span>
                      </label>
                      <span>${escapeHtml(child.name)}</span>
                    </div>
                  `
                )
                .join("")}
            </div>
          </section>
        `;
      })
      .join("");
  }

  function syncPermissionGroupToggleStates() {
    if (!els.permissionGroupPermissionList) {
      return;
    }

    const masterToggles = Array.from(
      els.permissionGroupPermissionList.querySelectorAll("[data-permission-group-toggle]")
    );

    masterToggles.forEach((toggle) => {
      const groupId = toggle.getAttribute("data-permission-group-toggle") || "";
      const childToggles = Array.from(
        els.permissionGroupPermissionList.querySelectorAll(`[data-parent-permission="${groupId}"]`)
      );

      if (!childToggles.length) {
        return;
      }

      toggle.checked = childToggles.every((child) => child.checked);
    });
  }

  function renderPermissionCatalogList(selectedPermissions = []) {
    if (!els.permissionGroupPermissionList) {
      return;
    }

    els.permissionGroupPermissionList.innerHTML = renderPermissionCatalogItems(
      state.permissionGroups.catalog,
      selectedPermissions
    );

    syncPermissionGroupToggleStates();
  }

  function resetPermissionGroupModal() {
    state.permissionGroups.mode = "create";
    state.permissionGroups.editingId = "";

    if (els.permissionGroupModalId) {
      els.permissionGroupModalId.value = "";
    }

    if (els.permissionGroupModalTitle) {
      els.permissionGroupModalTitle.textContent = "Tao moi vai tro";
    }

    if (els.permissionGroupModalLead) {
      els.permissionGroupModalLead.textContent = "Nhap day du thong tin bat buoc va chon cac quyen cho vai tro.";
    }

    if (els.permissionGroupModalSubmitBtn) {
      els.permissionGroupModalSubmitBtn.textContent = "Them";
    }

    if (els.permissionGroupModalName) {
      els.permissionGroupModalName.value = "";
    }

    if (els.permissionGroupModalCode) {
      els.permissionGroupModalCode.value = "";
    }

    if (els.permissionGroupModalDescription) {
      els.permissionGroupModalDescription.value = "";
    }

    renderRoleParentOptions("__root__", "");
    renderPermissionCatalogList([]);
  }

  function openPermissionGroupCreateModal() {
    resetPermissionGroupModal();
    openBackdrop(els.permissionGroupModal);
  }

  function openPermissionGroupEditModal(groupId) {
    const group = state.permissionGroups.items.find((item) => item.id === groupId);

    if (!group) {
      return;
    }

    state.permissionGroups.mode = "edit";
    state.permissionGroups.editingId = group.id;

    if (els.permissionGroupModalId) {
      els.permissionGroupModalId.value = group.id;
    }

    if (els.permissionGroupModalTitle) {
      els.permissionGroupModalTitle.textContent = "Sua vai tro";
    }

    if (els.permissionGroupModalLead) {
      els.permissionGroupModalLead.textContent = "Cap nhat thong tin, vai tro cha va danh sach quyen cho vai tro nay.";
    }

    if (els.permissionGroupModalSubmitBtn) {
      els.permissionGroupModalSubmitBtn.textContent = "Luu thay doi";
    }

    if (els.permissionGroupModalName) {
      els.permissionGroupModalName.value = group.name || "";
    }

    if (els.permissionGroupModalCode) {
      els.permissionGroupModalCode.value = group.code || "";
    }

    if (els.permissionGroupModalDescription) {
      els.permissionGroupModalDescription.value = group.description || "";
    }

    renderRoleParentOptions(group.parentGroup?.id || "__root__", group.id);
    renderPermissionCatalogList(group.permissions || []);

    openBackdrop(els.permissionGroupModal);
  }

  async function renderAccountsPanel(forceRefresh = false) {
    if (!hasSession()) {
      showLoginPrompt();
      return;
    }

    try {
      setStatus("Đang tải tài khoản...");
      await loadAccounts(forceRefresh);
      await loadPermissionGroups(forceRefresh);
      renderAccountPanel();
      setStatus("Đã tải xong cây tài khoản.");
    } catch (error) {
      setStatus(error.message || "Không thể tải tài khoản.", true);
    }
  }

  function setActiveNavigation(view) {
    els.topNavItems.forEach((item) => {
      item.classList.toggle("active", item.dataset.view === view && !managementPanels.has(view));
    });

    els.managementNavItems.forEach((item) => {
      item.classList.toggle("active", item.dataset.view === view);
    });

    if (els.managementNavToggle) {
      const isManagement =
        managementPanels.has(view) &&
        view !== "roles" &&
        view !== "permissions" &&
        view !== "login-pages" &&
        view !== "sim-types" &&
        view !== "device-types" &&
        view !== "connector-types";
      els.managementNavToggle.classList.toggle("active", isManagement);
    }

    if (els.reportNavToggle) {
      els.reportNavToggle.classList.toggle(
        "active",
        view === "bookings" || view === "station-distribution" || view === "report-summary"
      );
    }

    if (els.stationNavToggle) {
      const isStationSection = view === "station-map" || view === "station-info" || view === "manage-stations";
      els.stationNavToggle.classList.toggle("active", isStationSection);
    }

    if (els.systemNavToggle) {
      els.systemNavToggle.classList.toggle(
        "active",
        view === "roles" || view === "permissions" || view === "login-pages" || view === "sim-types"
      );
    }

    if (els.deviceConfigNavToggle) {
      els.deviceConfigNavToggle.classList.toggle(
        "active",
        view === "device-types" || view === "connector-types"
      );
    }
  }

  function switchWorkspace(view, options = {}) {
    const previousPanel = state.currentPanel;
    const isManagement = managementPanels.has(view);

    if (options.syncUrl !== false) {
      syncViewUrl(view, Boolean(options.replaceUrl));
    }

    if (
      (previousPanel === "station-map" && view !== "station-map") ||
      (previousPanel === "station-distribution" && view !== "station-distribution")
    ) {
      teardownStationManagementMap();
    }

    state.currentPanel = view;

    if (els.mapWorkspace) {
      els.mapWorkspace.hidden = isManagement;
    }

    if (els.managementWorkspace) {
      els.managementWorkspace.hidden = !isManagement;
    }

    setActiveNavigation(view);

    if (!isManagement) {
      return;
    }

    if (els.managementTitle) {
      els.managementTitle.textContent = panelMeta[view]?.title || "Quản lý";
    }

    if (els.managementLead) {
      els.managementLead.textContent = panelMeta[view]?.lead || "";
    }

    if (els.managementPrimaryBtn) {
      els.managementPrimaryBtn.textContent = panelMeta[view]?.primaryLabel || "Tạo mới";
    }

    renderCurrentPanel();
  }

  async function renderCurrentPanel(forceRefresh = false) {
    if (!state.currentPanel || !managementPanels.has(state.currentPanel)) {
      return;
    }

    if (state.currentPanel === "station-map" || state.currentPanel === "station-info") {
      await renderStationManagementPanel(forceRefresh);
      return;
    }

    if (state.currentPanel === "accounts") {
      await renderAccountsPanel(forceRefresh);
      return;
    }

    if (state.currentPanel === "charging-points") {
      await renderChargingPointManagementPanel(forceRefresh);
      return;
    }

    if (state.currentPanel === "pricings") {
      await renderPricingManagementPanel(forceRefresh);
      return;
    }

    if (state.currentPanel === "report-summary") {
      await renderAggregateReportPanelAsync(forceRefresh);
      return;
    }

    if (state.currentPanel === "station-distribution") {
      await renderStationDistributionPanel(forceRefresh);
      return;
    }

    if (state.currentPanel === "bookings") {
      await renderBookingHistoryPanelAsync(forceRefresh);
      return;
    }

    if (state.currentPanel === "roles") {
      await renderPermissionGroupPanelAsync(forceRefresh);
      return;
    }

    if (state.currentPanel === "permissions") {
      await renderPermissionItemPanelAsync(forceRefresh);
      return;
    }

    if (state.currentPanel === "login-pages") {
      await renderLoginPagePanelAsync(forceRefresh);
      return;
    }

    if (state.currentPanel === "sim-types") {
      await renderSimTypePanelAsync(forceRefresh);
      return;
    }

    if (state.currentPanel === "device-types") {
      await renderDeviceTypePanelAsync(forceRefresh);
      return;
    }

    if (state.currentPanel === "connector-types") {
      await renderConnectorTypePanelAsync(forceRefresh);
      return;
    }

    await renderGenericPanel(state.currentPanel, forceRefresh);
  }

  async function submitAccountForm() {
    const username = els.accountUsername?.value.trim() || "";
    const fullName = els.accountFullName?.value.trim() || "";
    const phone = els.accountPhone?.value.trim() || "";
    const email = els.accountEmail?.value.trim().toLowerCase() || "";
    const permissionGroupId = els.accountPermissionGroup?.value || "";
    const userType = els.accountUserType?.value.trim() || "Người dùng";
    const description = els.accountDescription?.value.trim() || "";
    const address = els.accountAddress?.value.trim() || "";
    const landingPage = els.accountLandingPage?.value || "map";
    const status = els.accountStatus?.value || "active";
    const walletBalance = Number(els.accountWalletBalance?.value || 0);
    const password = els.accountPassword?.value || "";
    const isEdit = state.accounts.modalMode === "edit" && state.accounts.editingId;
    setAccountModalStatus("");

    if (!username || !fullName || !phone) {
      setAccountModalStatus("Vui lòng nhập đủ tài khoản, họ tên và số điện thoại.");
      setStatus("Vui lòng nhập đủ tài khoản, họ tên và số điện thoại.", true);
      return;
    }

    if (!isEdit && !password) {
      setAccountModalStatus("Cần nhập mật khẩu cho tài khoản mới.");
      setStatus("Cần nhập mật khẩu cho tài khoản mới.", true);
      return;
    }

    if (password && password.length < 6) {
      setAccountModalStatus("Mật khẩu phải có ít nhất 6 ký tự.");
      setStatus("Mật khẩu phải có ít nhất 6 ký tự.", true);
      return;
    }

    const payload = {
      username,
      fullName,
      phone,
      email,
      permissionGroupId: permissionGroupId || null,
      userType,
      description,
      address,
      landingPage,
      status,
      walletBalance: Number.isFinite(walletBalance) && walletBalance >= 0 ? walletBalance : 0,
      parentId: state.accounts.modalParentId || state.accounts.profile?.id || ""
    };

    if (password) {
      payload.password = password;
    }

    try {
      setStatus(isEdit ? "Đang cập nhật tài khoản..." : "Đang tạo tài khoản...");

      await requestJson(isEdit ? `/api/admin/users/${state.accounts.editingId}` : "/api/admin/users", {
        method: isEdit ? "PATCH" : "POST",
        body: JSON.stringify(payload)
      });

      closeBackdrop(els.accountModal);
      state.accounts.items = [];
      await renderAccountsPanel(true);
      setStatus(isEdit ? "Đã cập nhật tài khoản." : "Đã tạo tài khoản mới.");
    } catch (error) {
      setAccountModalStatus(error.message || "Không thể lưu tài khoản.");
      setStatus(error.message || "Không thể lưu tài khoản.", true);
    }
  }

  async function submitPermissionGroupForm(form) {
    const id = form.querySelector("#permissionGroupModalId")?.value || "";
    const name = form.querySelector("#permissionGroupModalName")?.value.trim() || "";
    const code = form.querySelector("#permissionGroupModalCode")?.value.trim() || "";
    const parentGroupId = form.querySelector("#permissionGroupModalParentId")?.value || "__root__";
    const description = form.querySelector("#permissionGroupModalDescription")?.value.trim() || "";
    const permissions = Array.from(form.querySelectorAll("[data-permission-checkbox]:checked")).map((input) => input.value);

    if (!name || !code) {
      setStatus("Vui long nhap day du ten vai tro va khoa.", true);
      return;
    }

    try {
      setStatus(id ? "Dang cap nhat vai tro..." : "Dang tao vai tro...");

      await requestJson(id ? `/api/admin/roles/${id}` : "/api/admin/roles", {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify({
          name,
          code,
          description,
          permissions,
          status: "active",
          parentGroupId: parentGroupId === "__root__" ? null : parentGroupId
        })
      });

      closeBackdrop(els.permissionGroupModal);
      resetPermissionGroupModal();
      state.permissionGroups.items = [];
      await renderPermissionGroupPanelAsync(true);
      setStatus(id ? "Da cap nhat vai tro." : "Da tao vai tro.");
    } catch (error) {
      setStatus(error.message || "Khong the luu vai tro.", true);
    }
  }

  async function submitPermissionForm(form) {
    const id = form.querySelector("#permissionModalId")?.value || "";
    const name = form.querySelector("#permissionModalName")?.value.trim() || "";
    const groupKey = form.querySelector("#permissionModalGroupKey")?.value || "";
    const groupSelect = form.querySelector("#permissionModalGroupKey");
    const groupName =
      groupSelect && groupSelect.selectedIndex >= 0
        ? groupSelect.options[groupSelect.selectedIndex]?.text || ""
        : "";
    const description = form.querySelector("#permissionModalDescription")?.value.trim() || "";

    if (!name || !groupKey) {
      setStatus("Vui long nhap day du ten quyen va nhom quyen.", true);
      return;
    }

    try {
      setStatus(id ? "Dang cap nhat quyen..." : "Dang tao quyen...");

      await requestJson(id ? `/api/admin/permissions/${id}` : "/api/admin/permissions", {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify({
          name,
          groupKey,
          groupName,
          description,
          status: "active"
        })
      });

      closeBackdrop(els.permissionModal);
      resetPermissionModal();
      state.permissions.items = [];
      state.permissions.groups = [];
      state.permissionGroups.catalog = [];
      await Promise.all([
        renderPermissionItemPanelAsync(true),
        state.currentPanel === "roles" ? renderPermissionGroupPanelAsync(true) : Promise.resolve()
      ]);
      setStatus(id ? "Da cap nhat quyen." : "Da tao quyen.");
    } catch (error) {
      setStatus(error.message || "Khong the luu quyen.", true);
    }
  }

  async function submitLoginPageForm(form) {
    const id = form.querySelector("#loginPageModalId")?.value || "";
    const host = form.querySelector("#loginPageModalHost")?.value.trim().toLowerCase() || "";
    const title = form.querySelector("#loginPageModalPageTitle")?.value.trim() || "";
    const companyName = form.querySelector("#loginPageModalCompanyName")?.value.trim() || "";
    const theme = form.querySelector("#loginPageModalTheme")?.value || "login-v1";
    const logoImage = form.querySelector("#loginPageModalLogoImage")?.value || "";
    const iconImage = form.querySelector("#loginPageModalIconImage")?.value || "";
    const backgroundImage = form.querySelector("#loginPageModalBackgroundImage")?.value || "";
    const iosAppLink = form.querySelector("#loginPageModalIosAppLink")?.value.trim() || "";
    const androidAppLink = form.querySelector("#loginPageModalAndroidAppLink")?.value.trim() || "";
    const website = form.querySelector("#loginPageModalWebsite")?.value.trim() || "";
    const guideLink = form.querySelector("#loginPageModalGuideLink")?.value.trim() || "";
    const description = form.querySelector("#loginPageModalDescription")?.value.trim() || "";
    const servicePhone = form.querySelector("#loginPageModalServicePhone")?.value.trim() || "";
    const supportPhone = form.querySelector("#loginPageModalSupportPhone")?.value.trim() || "";

    if (!host || !theme || !website) {
      setStatus("Vui long nhap day du host, theme va website.", true);
      return;
    }

    if (!logoImage || !iconImage) {
      setStatus("Vui long tai len day du logo va icon cho trang dang nhap.", true);
      return;
    }

    try {
      setStatus(id ? "Dang cap nhat trang dang nhap..." : "Dang tao trang dang nhap...");

      await requestJson(id ? `/api/admin/login-pages/${id}` : "/api/admin/login-pages", {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify({
          host,
          title,
          companyName,
          theme,
          logoImage,
          iconImage,
          backgroundImage,
          iosAppLink,
          androidAppLink,
          website,
          guideLink,
          description,
          servicePhone,
          supportPhone
        })
      });

      closeBackdrop(els.loginPageModal);
      resetLoginPageModal();
      state.loginPages.items = [];
      await renderLoginPagePanelAsync(true);
      setStatus(id ? "Da cap nhat trang dang nhap." : "Da tao trang dang nhap.");
    } catch (error) {
      setStatus(error.message || "Khong the luu trang dang nhap.", true);
    }
  }

  async function submitSimTypeForm(form) {
    const id = form.querySelector("#simTypeModalId")?.value || "";
    const name = form.querySelector("#simTypeModalName")?.value.trim() || "";
    const code = form.querySelector("#simTypeModalCode")?.value.trim().toUpperCase() || "";
    const description = form.querySelector("#simTypeModalDescription")?.value.trim() || "";

    if (!name || !code) {
      setStatus("Vui long nhap day du ten va ma loai sim.", true);
      return;
    }

    try {
      setStatus(id ? "Dang cap nhat loai sim..." : "Dang tao loai sim...");

      await requestJson(id ? `/api/admin/sim-types/${id}` : "/api/admin/sim-types", {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify({
          name,
          code,
          description
        })
      });

      closeBackdrop(els.simTypeModal);
      resetSimTypeModal();
      state.simTypes.items = [];
      await renderSimTypePanelAsync(true);
      setStatus(id ? "Da cap nhat loai sim." : "Da tao loai sim.");
    } catch (error) {
      setStatus(error.message || "Khong the luu loai sim.", true);
    }
  }

  async function submitDeviceTypeForm(form) {
    const id = form.querySelector("#deviceTypeModalId")?.value || "";
    const name = form.querySelector("#deviceTypeModalName")?.value.trim() || "";
    const code = form.querySelector("#deviceTypeModalCode")?.value.trim().toUpperCase() || "";
    const manufacturer = form.querySelector("#deviceTypeModalManufacturer")?.value.trim() || "";
    const description = form.querySelector("#deviceTypeModalDescription")?.value.trim() || "";
    const image = form.querySelector("#deviceTypeModalImage")?.value || "";

    if (!name || !code) {
      setStatus("Vui long nhap day du ten va ma loai thiet bi.", true);
      return;
    }

    try {
      setStatus(id ? "Dang cap nhat loai thiet bi..." : "Dang tao loai thiet bi...");

      await requestJson(id ? `/api/admin/device-types/${id}` : "/api/admin/device-types", {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify({
          name,
          code,
          manufacturer,
          description,
          image
        })
      });

      closeBackdrop(els.deviceTypeModal);
      resetDeviceTypeModal();
      state.deviceTypes.items = [];
      await renderDeviceTypePanelAsync(true);
      setStatus(id ? "Da cap nhat loai thiet bi." : "Da tao loai thiet bi.");
    } catch (error) {
      setStatus(error.message || "Khong the luu loai thiet bi.", true);
    }
  }

  async function submitConnectorTypeForm(form) {
    const id = form.querySelector("#connectorTypeModalId")?.value || "";
    const name = form.querySelector("#connectorTypeModalName")?.value.trim() || "";
    const shortName = form.querySelector("#connectorTypeModalShortName")?.value.trim() || "";
    const chargingType = form.querySelector("#connectorTypeModalChargingType")?.value || "";
    const currentType = form.querySelector("#connectorTypeModalCurrentType")?.value || "";
    const description = form.querySelector("#connectorTypeModalDescription")?.value.trim() || "";
    const image = form.querySelector("#connectorTypeModalImage")?.value || "";

    if (!name || !shortName || !chargingType || !currentType) {
      setStatus("Vui long nhap day du ten, ten viet tat, loai sac va loai dong dien.", true);
      return;
    }

    try {
      setStatus(id ? "Dang cap nhat loai cong sac..." : "Dang tao loai cong sac...");

      await requestJson(id ? `/api/admin/connector-types/${id}` : "/api/admin/connector-types", {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify({
          name,
          shortName,
          chargingType,
          currentType,
          description,
          image
        })
      });

      closeBackdrop(els.connectorTypeModal);
      resetConnectorTypeModal();
      state.connectorTypes.items = [];
      await renderConnectorTypePanelAsync(true);
      setStatus(id ? "Da cap nhat loai cong sac." : "Da tao loai cong sac.");
    } catch (error) {
      setStatus(error.message || "Khong the luu loai cong sac.", true);
    }
  }

  function toggleManagementMenu() {
    if (!els.managementNavToggle || !els.managementNavSubmenu) {
      return;
    }

    const isExpanded = els.managementNavToggle.getAttribute("aria-expanded") !== "false";
    els.managementNavToggle.setAttribute("aria-expanded", String(!isExpanded));
    els.managementNavSubmenu.hidden = isExpanded;
  }

  function toggleReportMenu() {
    if (!els.reportNavToggle || !els.reportNavSubmenu) {
      return;
    }

    const isExpanded = els.reportNavToggle.getAttribute("aria-expanded") !== "false";
    els.reportNavToggle.setAttribute("aria-expanded", String(!isExpanded));
    els.reportNavSubmenu.hidden = isExpanded;
  }

  function toggleSystemMenu() {
    if (!els.systemNavToggle || !els.systemNavSubmenu) {
      return;
    }

    const isExpanded = els.systemNavToggle.getAttribute("aria-expanded") !== "false";
    els.systemNavToggle.setAttribute("aria-expanded", String(!isExpanded));
    els.systemNavSubmenu.hidden = isExpanded;
  }

  function toggleDeviceConfigMenu() {
    if (!els.deviceConfigNavToggle || !els.deviceConfigNavSubmenu) {
      return;
    }

    const isExpanded = els.deviceConfigNavToggle.getAttribute("aria-expanded") !== "false";
    els.deviceConfigNavToggle.setAttribute("aria-expanded", String(!isExpanded));
    els.deviceConfigNavSubmenu.hidden = isExpanded;
  }

  function toggleStationMenu() {
    if (!els.stationNavToggle || !els.stationNavSubmenu) {
      return;
    }

    const isExpanded = els.stationNavToggle.getAttribute("aria-expanded") !== "false";
    els.stationNavToggle.setAttribute("aria-expanded", String(!isExpanded));
    els.stationNavSubmenu.hidden = isExpanded;
  }

  function handleManagementContentInput(event) {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.id === "genericPanelSearch") {
      state.genericSearch = target.value || "";
      renderCurrentPanel(false);
      return;
    }

    if (target.id === "accountKeywordSearch") {
      state.accounts.searchKeyword = target.value || "";
      renderAccountPanel();
      return;
    }

    if (target.id === "accountEmailSearch") {
      state.accounts.searchEmail = target.value || "";
      renderAccountPanel();
      return;
    }

    if (target.id === "accountFilterChildOnly") {
      state.accounts.filterChildOnly = target.checked;
      renderAccountPanel();
      return;
    }

    if (target.id === "accountFilterLeafOnly") {
      state.accounts.filterLeafOnly = target.checked;
      renderAccountPanel();
      return;
    }

    if (target.id === "stationAdminSearchImei") {
      state.stations.searchImei = target.value || "";
      return;
    }

    if (target.id === "stationAdminSearchName") {
      state.stations.searchName = target.value || "";
      return;
    }

    if (target.id === "stationAdminSearchAddress") {
      state.stations.searchAddress = target.value || "";
      return;
    }

    if (target.id === "chargingPointSearchCode") {
      state.chargingPoints.searchCode = target.value || "";
      return;
    }

    if (target.id === "chargingPointSearchStationId") {
      state.chargingPoints.searchStationId = target.value || "";
      return;
    }

    if (target.id === "chargingPointSearchConnectorType") {
      state.chargingPoints.searchConnectorType = target.value || "all";
      return;
    }

    if (target.id === "pricingSearchName") {
      state.pricings.searchName = target.value || "";
      return;
    }

    if (target.id === "bookingHistoryStartFilter") {
      state.bookings.filterStart = target.value || "";
      return;
    }

    if (target.id === "bookingHistoryEndFilter") {
      state.bookings.filterEnd = target.value || "";
      return;
    }

    if (target.id === "bookingHistoryStatusFilter") {
      state.bookings.filterStatus = target.value || "all";
      return;
    }

    if (target.id === "permissionGroupSearch") {
      state.permissionGroups.search = target.value || "";
      renderPermissionGroupPanel();
      return;
    }

    if (target.id === "permissionSearchName") {
      state.permissions.searchName = target.value || "";
      renderPermissionItemPanel();
      return;
    }

    if (target.id === "permissionSearchGroup") {
      state.permissions.searchGroupKey = target.value || "all";
      renderPermissionItemPanel();
      return;
    }

    if (target.id === "loginPageSearchHost") {
      state.loginPages.searchHost = target.value || "";
      renderLoginPagePanel();
      return;
    }

    if (target.id === "loginPageSearchTitle") {
      state.loginPages.searchTitle = target.value || "";
      renderLoginPagePanel();
      return;
    }

    if (target.id === "loginPageSearchCompanyName") {
      state.loginPages.searchCompanyName = target.value || "";
      renderLoginPagePanel();
      return;
    }

    if (target.id === "loginPageSearchWebsite") {
      state.loginPages.searchWebsite = target.value || "";
      renderLoginPagePanel();
      return;
    }

    if (target.id === "simTypeSearchName") {
      state.simTypes.searchName = target.value || "";
      renderSimTypePanel();
      return;
    }

    if (target.id === "simTypeSearchCode") {
      state.simTypes.searchCode = target.value || "";
      renderSimTypePanel();
      return;
    }

    if (target.id === "deviceTypeSearchName") {
      state.deviceTypes.searchName = target.value || "";
      renderDeviceTypePanel();
      return;
    }

    if (target.id === "deviceTypeSearchCode") {
      state.deviceTypes.searchCode = target.value || "";
      renderDeviceTypePanel();
      return;
    }

    if (target.id === "deviceTypeSearchManufacturer") {
      state.deviceTypes.searchManufacturer = target.value || "";
      renderDeviceTypePanel();
      return;
    }

    if (target.id === "connectorTypeSearchName") {
      state.connectorTypes.searchName = target.value || "";
      renderConnectorTypePanel();
      return;
    }

    if (target.id === "connectorTypeSearchShortName") {
      state.connectorTypes.searchShortName = target.value || "";
      renderConnectorTypePanel();
      return;
    }
  }

  function handlePricingModalInput(event) {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.matches("[data-pricing-time-rate-draft]")) {
      state.pricings.timeRateDraft[target.dataset.pricingTimeRateDraft] = target.value || "";
      return;
    }

    if (target.matches("[data-pricing-time-frame-draft]")) {
      state.pricings.timeFrameDraft[target.dataset.pricingTimeFrameDraft] = target.value || "";
    }
  }

  function handleManagementContentClick(event) {
    const trigger = event.target.closest("[data-action]");

    if (!trigger) {
      return;
    }

    const action = trigger.dataset.action;

    if (action === "open-login") {
      window.location.href = "/admin/login";
      return;
    }

    if (action === "download-station-template") {
      downloadStationImportTemplate();
      return;
    }

    if (action === "trigger-station-import") {
      const fileInput = els.managementContent?.querySelector("#stationImportFileInput");

      if (fileInput instanceof HTMLInputElement) {
        fileInput.click();
      }
      return;
    }

    if (action === "entity-edit") {
      if (trigger.dataset.panel === "stations") {
        openEditStationModal(trigger.dataset.id || "");
        return;
      }

      window.location.href = `/admin/editor?panel=${encodeURIComponent(
        trigger.dataset.panel || "pricings"
      )}&id=${encodeURIComponent(trigger.dataset.id || "")}`;
      return;
    }

    if (action === "open-station-create") {
      openCreateStationModal();
      return;
    }

    if (action === "open-charging-point-create") {
      openCreateChargingPointModal().catch((error) => {
        setStatus(error.message || "Khong the mo form cong sac.", true);
      });
      return;
    }

    if (action === "open-charging-point-edit") {
      openEditChargingPointModal(trigger.dataset.id || "").catch((error) => {
        setStatus(error.message || "Khong the mo form sua cong sac.", true);
      });
      return;
    }

    if (action === "open-pricing-create") {
      openCreatePricingModal().catch((error) => {
        setStatus(error.message || "Khong the mo form bang gia.", true);
      });
      return;
    }

    if (action === "open-pricing-edit") {
      openEditPricingModal(trigger.dataset.id || "").catch((error) => {
        setStatus(error.message || "Khong the mo form sua bang gia.", true);
      });
      return;
    }

    if (action === "entity-delete") {
      const panel = trigger.dataset.panel || "";
      const itemId = trigger.dataset.id || "";
      const config = window.adminEntityConfigs?.[panel];

      if (!config || !itemId) {
        return;
      }

      openConfirmModal({
        title: "Xóa bản ghi",
        message: "Bạn có chắc chắn muốn xóa bản ghi này?",
        confirmLabel: "Xác nhận",
        onConfirm: async () => {
          try {
            setStatus("Đang xóa dữ liệu...");
            await requestJson(config.deleteEndpoint(itemId), { method: "DELETE" });
            state.cache[panel] = null;
            closeConfirmModal();
            await renderCurrentPanel(true);
            setStatus("Đã xóa bản ghi.");
          } catch (error) {
            setStatus(error.message || "Không thể xóa dữ liệu.", true);
          }
        }
      });
      return;
    }

    if (action === "reset-account-filters") {
      state.accounts.searchKeyword = "";
      state.accounts.searchEmail = "";
      state.accounts.filterChildOnly = false;
      state.accounts.filterLeafOnly = false;
      renderAccountPanel();
      return;
    }

    if (action === "apply-account-search") {
      renderAccountPanel();
      return;
    }

    if (action === "apply-station-search") {
      if (state.currentPanel === "station-map") {
        renderStationMapPanel();
      } else {
        renderStationInfoPanel();
        setStatus(`Đã lọc ${getFilteredStationManagementItems().length} trạm sạc.`);
      }
      return;
    }

    if (action === "apply-charging-point-search") {
      renderChargingPointPanel();
      setStatus(`Da loc ${getFilteredChargingPointItems().length} cong sac.`);
      return;
    }

    if (action === "apply-pricing-search") {
      renderPricingPanel();
      setStatus(`Da loc ${getFilteredPricingItems().length} bang gia.`);
      return;
    }

    if (action === "reset-station-search") {
      state.stations.searchImei = "";
      state.stations.searchName = "";
      state.stations.searchAddress = "";
      state.stations.statusFilter = "all";

      if (state.currentPanel === "station-map") {
        renderStationMapPanel();
      } else {
        renderStationInfoPanel();
        setStatus(`Đã tải ${state.stations.items.length} trạm sạc.`);
      }
      return;
    }

    if (action === "reset-charging-point-search") {
      state.chargingPoints.searchCode = "";
      state.chargingPoints.searchStationId = "";
      state.chargingPoints.searchConnectorType = "all";
      renderChargingPointPanel();
      setStatus(`Da tai ${state.chargingPoints.items.length} cong sac.`);
      return;
    }

    if (action === "reset-pricing-search") {
      state.pricings.searchName = "";
      renderPricingPanel();
      setStatus(`Da tai ${state.pricings.items.length} bang gia.`);
      return;
    }

    if (action === "apply-booking-history-search") {
      syncBookingHistoryFiltersFromInputs();
      renderBookingHistoryPanel();
      setStatus(`Da loc ${getFilteredBookingHistoryItems().length} lich dat.`);
      return;
    }

    if (action === "reset-booking-history-search") {
      state.bookings.filterStart = "";
      state.bookings.filterEnd = "";
      state.bookings.filterStatus = "all";
      renderBookingHistoryPanel();
      setStatus(`Da tai ${state.bookings.items.length} lich dat.`);
      return;
    }

    if (action === "apply-aggregate-report-search") {
      syncAggregateReportFiltersFromInputs();
      renderAggregateReportPanel();
      setStatus(`Da tong hop ${state.reportSummary.rows.length} chu ky bao cao.`);
      return;
    }

    if (action === "reset-aggregate-report-search") {
      const defaults = createDefaultReportSummaryState();
      state.reportSummary.filterStart = defaults.filterStart;
      state.reportSummary.filterEnd = defaults.filterEnd;
      state.reportSummary.cycle = defaults.cycle;
      renderAggregateReportPanel();
      setStatus(`Da dat lai bo loc bao cao tong hop tu ${defaults.filterStart} den ${defaults.filterEnd}.`);
      return;
    }

    if (action === "add-pricing-time-rate") {
      syncPricingDraftsFromInputs();
      const minutes = Number(state.pricings.timeRateDraft.minutes || 0);
      const price = Number(state.pricings.timeRateDraft.price || 0);

      if (!Number.isFinite(minutes) || minutes <= 0 || !Number.isFinite(price) || price < 0) {
        setPricingModalStatus("Nhap moc thoi gian va gia tien hop le truoc khi them.", true);
        return;
      }

      state.pricings.timeRates.push({
        minutes: String(minutes),
        price: String(price)
      });
      state.pricings.timeRateDraft = createEmptyTimeRate();
      setPricingModalStatus("");
      renderPricingTimeRateRows();
      return;
    }

    if (action === "remove-pricing-time-rate") {
      const removeIndex = Number(trigger.dataset.index || -1);
      syncPricingDraftsFromInputs();
      state.pricings.timeRates = state.pricings.timeRates.filter((_, index) => index !== removeIndex);
      renderPricingTimeRateRows();
      return;
    }

    if (action === "edit-pricing-time-rate") {
      const editIndex = Number(trigger.dataset.index || -1);
      const row = state.pricings.timeRates[editIndex];

      if (!row) {
        return;
      }

      syncPricingDraftsFromInputs();
      state.pricings.timeRateDraft = {
        minutes: row.minutes || "",
        price: row.price || ""
      };
      state.pricings.timeRates = state.pricings.timeRates.filter((_, index) => index !== editIndex);
      setPricingModalStatus("Da nap moc thoi gian len o nhap. Chinh sua va bam + de cap nhat.", false);
      renderPricingTimeRateRows();
      return;
    }

    if (action === "add-pricing-time-frame") {
      syncPricingDraftsFromInputs();
      const draft = state.pricings.timeFrameDraft;
      const price = Number(draft.price || 0);

      if (!draft.name.trim() || !draft.startTime || !draft.endTime || !Number.isFinite(price) || price < 0) {
        setPricingModalStatus("Nhap ten khung gio, gio bat dau, gio ket thuc va gia hop le.", true);
        return;
      }

      state.pricings.timeFrames.push({
        name: draft.name.trim(),
        startTime: draft.startTime,
        endTime: draft.endTime,
        price: String(price)
      });
      state.pricings.timeFrameDraft = createEmptyTimeFrame();
      setPricingModalStatus("");
      renderPricingTimeFrameRows();
      return;
    }

    if (action === "remove-pricing-time-frame") {
      const removeIndex = Number(trigger.dataset.index || -1);
      syncPricingDraftsFromInputs();
      state.pricings.timeFrames = state.pricings.timeFrames.filter((_, index) => index !== removeIndex);
      renderPricingTimeFrameRows();
      return;
    }

    if (action === "edit-pricing-time-frame") {
      const editIndex = Number(trigger.dataset.index || -1);
      const row = state.pricings.timeFrames[editIndex];

      if (!row) {
        return;
      }

      syncPricingDraftsFromInputs();
      state.pricings.timeFrameDraft = {
        name: row.name || "",
        startTime: row.startTime || "",
        endTime: row.endTime || "",
        price: row.price || ""
      };
      state.pricings.timeFrames = state.pricings.timeFrames.filter((_, index) => index !== editIndex);
      setPricingModalStatus("Da nap khung gio len o nhap. Chinh sua va bam + de cap nhat.", false);
      renderPricingTimeFrameRows();
      return;
    }

    if (action === "open-booking-history-detail") {
      openBookingHistoryDetailModal(trigger.dataset.id || "");
      return;
    }

    if (action === "cancel-booking-history") {
      submitBookingCancellation(trigger.dataset.id || "");
      return;
    }

    if (action === "station-status-filter") {
      state.stations.statusFilter = trigger.dataset.status || "all";

      if (state.currentPanel === "station-map") {
        renderStationMapPanel({ preserveViewport: true });
      } else {
        renderStationInfoPanel();
        setStatus(`Đã lọc ${getFilteredStationManagementItems().length} trạm sạc.`);
      }
      return;
    }

    if (action === "open-station-map-panel") {
      switchWorkspace("station-map");
      return;
    }

    if (action === "open-station-info-panel") {
      switchWorkspace("station-info");
      return;
    }

    if (action === "open-station-map-from-info") {
      state.stations.selectedId = trigger.dataset.id || "";
      switchWorkspace("station-map");
      return;
    }

    if (action === "focus-station-map-item") {
      state.stations.selectedId = trigger.dataset.id || "";
      renderStationMapPanel({ preserveViewport: true });
      return;
    }

    if (action === "refresh-station-map") {
      renderStationManagementPanel(true);
      return;
    }

    if (action === "refresh-station-distribution") {
      renderStationDistributionPanel(true);
      return;
    }

    if (action === "focus-station-distribution-item") {
      const stationId = trigger.dataset.id || "";
      const metric = buildStationDistributionMetrics(state.stations.items || []).find(
        (item) => item.id === stationId
      );

      if (!metric) {
        return;
      }

      state.stations.selectedId = stationId;
      renderStationDistributionPanel(false);
      return;
    }

    if (action === "select-station-location-result") {
      const index = Number(trigger.dataset.index || -1);
      const result = state.stations.modalSearchResults[index];

      if (!result) {
        return;
      }

      if (els.stationLocationSearchResults) {
        els.stationLocationSearchResults.hidden = true;
      }

      if (els.stationLocationSearch) {
        els.stationLocationSearch.value = result.address || "";
      }

      if (els.stationModalAddress) {
        els.stationModalAddress.value = result.address || "";
      }

      if (els.stationModalCity) {
        els.stationModalCity.value = result.city || "";
      }

      if (els.stationModalDistrict) {
        els.stationModalDistrict.value = result.district || "";
      }

      setStationModalLocation(result.lat, result.lng, { center: true });
      return;
    }

    if (action === "toggle-tree-node") {
      const accountId = trigger.dataset.id || "";

      if (state.accounts.expandedTreeIds.has(accountId)) {
        state.accounts.expandedTreeIds.delete(accountId);
      } else {
        state.accounts.expandedTreeIds.add(accountId);
      }

      renderAccountPanel();
      return;
    }

    if (action === "select-account-node") {
      state.accounts.selectedParentId = trigger.dataset.id || state.accounts.profile?.id || "";
      renderAccountPanel();
      return;
    }

    if (action === "open-account-create") {
      openCreateAccountModal();
      return;
    }

    if (action === "open-account-edit") {
      openEditAccountModal(trigger.dataset.id || "");
      return;
    }

    if (action === "open-account-reset-password") {
      const account = getAccountById(trigger.dataset.id || "");

      if (!account) {
        return;
      }

      openConfirmModal({
        title: "Cài đặt lại mật khẩu?",
        message: `Đặt lại mật khẩu mặc định cho tài khoản ${account.username}?`,
        hint: "Hệ thống sẽ sinh ra một mật khẩu mới và trả về ngay sau khi xác nhận.",
        confirmLabel: "Xác nhận",
        onConfirm: async () => {
          try {
            setStatus("Đang đặt lại mật khẩu...");
            const data = await requestJson(`/api/admin/users/${account.id}/reset-password`, {
              method: "POST"
            });
            if (els.accountConfirmTitle) {
              els.accountConfirmTitle.textContent = "Đặt lại mật khẩu thành công";
            }
            if (els.accountConfirmMessage) {
              els.accountConfirmMessage.textContent = `Mật khẩu mới cho ${account.username} là: ${data.password}`;
            }
            if (els.accountConfirmHint) {
              els.accountConfirmHint.textContent = "Hãy lưu lại mật khẩu mới này để bàn giao cho người dùng.";
            }
            if (els.accountConfirmSubmitBtn) {
              els.accountConfirmSubmitBtn.textContent = "Đóng";
            }
            state.confirmAction = null;
            setStatus("Đã đặt lại mật khẩu.");
          } catch (error) {
            setStatus(error.message || "Không thể đặt lại mật khẩu.", true);
          }
        }
      });
      return;
    }

    if (action === "open-account-delete") {
      const account = getAccountById(trigger.dataset.id || "");

      if (!account) {
        return;
      }

      openConfirmModal({
        title: "Xóa người dùng",
        message: `Bạn có chắc chắn muốn xóa người dùng ${account.username}?`,
        hint: "Nếu tài khoản này có tài khoản con thì toàn bộ nhánh con cũng sẽ bị xóa.",
        confirmLabel: "Xác nhận",
        onConfirm: async () => {
          try {
            setStatus("Đang xóa tài khoản...");
            await requestJson(`/api/admin/users/${account.id}`, {
              method: "DELETE"
            });
            closeConfirmModal();
            state.accounts.items = [];
            if (state.accounts.selectedParentId === account.id) {
              state.accounts.selectedParentId = state.accounts.profile?.id || "";
            }
            await renderAccountsPanel(true);
            setStatus("Đã xóa tài khoản.");
          } catch (error) {
            setStatus(error.message || "Không thể xóa tài khoản.", true);
          }
        }
      });
      return;
    }

    if (action === "permission-item-edit") {
      openPermissionItemEditModal(trigger.dataset.id || "");
      return;
    }

    if (action === "login-page-edit") {
      openLoginPageEditModal(trigger.dataset.id || "");
      return;
    }

    if (action === "sim-type-edit") {
      openSimTypeEditModal(trigger.dataset.id || "");
      return;
    }

    if (action === "device-type-edit") {
      openDeviceTypeEditModal(trigger.dataset.id || "");
      return;
    }

    if (action === "connector-type-edit") {
      openConnectorTypeEditModal(trigger.dataset.id || "");
      return;
    }

    if (action === "permission-edit" || action === "role-edit") {
      openPermissionGroupEditModal(trigger.dataset.id || "");
      return;
    }

    if (action === "login-page-delete") {
      const loginPageId = trigger.dataset.id || "";

      openConfirmModal({
        title: "Xoa trang dang nhap",
        message: "Ban co chac chan muon xoa trang dang nhap nay?",
        confirmLabel: "Xac nhan",
        onConfirm: async () => {
          try {
            setStatus("Dang xoa trang dang nhap...");
            await requestJson(`/api/admin/login-pages/${loginPageId}`, {
              method: "DELETE"
            });
            closeConfirmModal();
            state.loginPages.items = [];
            await renderLoginPagePanelAsync(true);
            setStatus("Da xoa trang dang nhap.");
          } catch (error) {
            setStatus(error.message || "Khong the xoa trang dang nhap.", true);
          }
        }
      });
      return;
    }

    if (action === "sim-type-delete") {
      const simTypeId = trigger.dataset.id || "";

      openConfirmModal({
        title: "Xoa loai sim",
        message: "Ban co chac chan muon xoa loai sim nay?",
        confirmLabel: "Xac nhan",
        onConfirm: async () => {
          try {
            setStatus("Dang xoa loai sim...");
            await requestJson(`/api/admin/sim-types/${simTypeId}`, {
              method: "DELETE"
            });
            closeConfirmModal();
            state.simTypes.items = [];
            await renderSimTypePanelAsync(true);
            setStatus("Da xoa loai sim.");
          } catch (error) {
            setStatus(error.message || "Khong the xoa loai sim.", true);
          }
        }
      });
      return;
    }

    if (action === "device-type-delete") {
      const deviceTypeId = trigger.dataset.id || "";

      openConfirmModal({
        title: "Xoa loai thiet bi",
        message: "Ban co chac chan muon xoa loai thiet bi nay?",
        confirmLabel: "Xac nhan",
        onConfirm: async () => {
          try {
            setStatus("Dang xoa loai thiet bi...");
            await requestJson(`/api/admin/device-types/${deviceTypeId}`, {
              method: "DELETE"
            });
            closeConfirmModal();
            state.deviceTypes.items = [];
            await renderDeviceTypePanelAsync(true);
            setStatus("Da xoa loai thiet bi.");
          } catch (error) {
            setStatus(error.message || "Khong the xoa loai thiet bi.", true);
          }
        }
      });
      return;
    }

    if (action === "connector-type-delete") {
      const connectorTypeId = trigger.dataset.id || "";

      openConfirmModal({
        title: "Xoa loai cong sac",
        message: "Ban co chac chan muon xoa loai cong sac nay?",
        confirmLabel: "Xac nhan",
        onConfirm: async () => {
          try {
            setStatus("Dang xoa loai cong sac...");
            await requestJson(`/api/admin/connector-types/${connectorTypeId}`, {
              method: "DELETE"
            });
            closeConfirmModal();
            state.connectorTypes.items = [];
            await renderConnectorTypePanelAsync(true);
            setStatus("Da xoa loai cong sac.");
          } catch (error) {
            setStatus(error.message || "Khong the xoa loai cong sac.", true);
          }
        }
      });
      return;
    }

    if (action === "permission-item-delete") {
      const permissionId = trigger.dataset.id || "";

      openConfirmModal({
        title: "Xoa quyen",
        message: "Ban co chac chan muon xoa quyen nay?",
        confirmLabel: "Xac nhan",
        onConfirm: async () => {
          try {
            setStatus("Dang xoa quyen...");
            await requestJson(`/api/admin/permissions/${permissionId}`, {
              method: "DELETE"
            });
            closeConfirmModal();
            state.permissions.items = [];
            state.permissions.groups = [];
            state.permissionGroups.catalog = [];
            await renderPermissionItemPanelAsync(true);
            setStatus("Da xoa quyen.");
          } catch (error) {
            setStatus(error.message || "Khong the xoa quyen.", true);
          }
        }
      });
      return;
    }

    if (action === "permission-delete" || action === "role-delete") {
      const groupId = trigger.dataset.id || "";

      openConfirmModal({
        title: "Xoa vai tro",
        message: "Ban co chac chan muon xoa vai tro nay?",
        confirmLabel: "Xác nhận",
        onConfirm: async () => {
          try {
            setStatus("Dang xoa vai tro...");
            await requestJson(`/api/admin/roles/${groupId}`, {
              method: "DELETE"
            });
            closeConfirmModal();
            state.permissionGroups.items = [];
            await renderPermissionGroupPanelAsync(true);
            setStatus("Da xoa vai tro.");
          } catch (error) {
            setStatus(error.message || "Khong the xoa vai tro.", true);
          }
        }
      });
      return;
    }

    if (action === "open-permission-item-create") {
      openPermissionItemCreateModal();
      return;
    }

    if (action === "open-login-page-create") {
      openLoginPageCreateModal();
      return;
    }

    if (action === "open-sim-type-create") {
      openSimTypeCreateModal();
      return;
    }

    if (action === "open-device-type-create") {
      openDeviceTypeCreateModal();
      return;
    }

    if (action === "open-connector-type-create") {
      openConnectorTypeCreateModal();
      return;
    }

    if (action === "open-permission-create" || action === "open-role-create") {
      openPermissionGroupCreateModal();
      return;
    }

    if (action === "apply-login-page-search") {
      renderLoginPagePanel();
      return;
    }

    if (action === "apply-sim-type-search") {
      renderSimTypePanel();
      return;
    }

    if (action === "apply-device-type-search") {
      renderDeviceTypePanel();
      return;
    }

    if (action === "apply-connector-type-search") {
      renderConnectorTypePanel();
      return;
    }

    if (action === "apply-permission-item-search") {
      renderPermissionItemPanel();
      return;
    }

    if (action === "apply-permission-search" || action === "apply-role-search") {
      renderPermissionGroupPanel();
      return;
    }

    if (action === "reset-permission-item-search") {
      state.permissions.searchName = "";
      state.permissions.searchGroupKey = "all";
      renderPermissionItemPanel();
      return;
    }

    if (action === "reset-login-page-search") {
      state.loginPages.searchHost = "";
      state.loginPages.searchTitle = "";
      state.loginPages.searchCompanyName = "";
      state.loginPages.searchWebsite = "";
      renderLoginPagePanel();
      return;
    }

    if (action === "reset-sim-type-search") {
      state.simTypes.searchName = "";
      state.simTypes.searchCode = "";
      renderSimTypePanel();
      return;
    }

    if (action === "reset-device-type-search") {
      state.deviceTypes.searchName = "";
      state.deviceTypes.searchCode = "";
      state.deviceTypes.searchManufacturer = "";
      renderDeviceTypePanel();
      return;
    }

    if (action === "reset-connector-type-search") {
      state.connectorTypes.searchName = "";
      state.connectorTypes.searchShortName = "";
      renderConnectorTypePanel();
      return;
    }

    if (action === "reset-role-search") {
      state.permissionGroups.search = "";
      renderPermissionGroupPanel();
      return;
    }
  }

  function handleStationModalInput(event) {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (
      target === els.stationModalImei ||
      target === els.stationModalName ||
      target === els.stationModalCity ||
      target === els.stationModalDistrict ||
      target === els.stationModalAddress ||
      target === els.stationModalStatusSelect ||
      target === els.stationModalNotes ||
      target === els.stationModalChargingType ||
      target === els.stationModalCurrentType ||
      target === els.stationModalIsActivated ||
      target === els.stationModalActivatedAt ||
      target === els.stationModalWarrantyUntil ||
      target === els.stationModalSimType ||
      target === els.stationModalSimNumber ||
      target === els.stationModalBillingSimNumber ||
      target === els.stationModalSupportPhone ||
      target === els.stationModalOpen247 ||
      target === els.stationModalAmenities
    ) {
      if (
        target === els.stationModalIsActivated &&
        els.stationModalIsActivated?.checked &&
        els.stationModalActivatedAt &&
        !els.stationModalActivatedAt.value
      ) {
        els.stationModalActivatedAt.value = getTodayInputValue();
      }

      setStationModalPreview();
      return;
    }

    if (target === els.stationModalLat || target === els.stationModalLng) {
      const lat = Number(els.stationModalLat?.value || 0);
      const lng = Number(els.stationModalLng?.value || 0);

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        setStationModalLocation(lat, lng, { silent: true });
      } else {
        setStationModalPreview();
      }
      return;
    }

    if (target === els.stationLocationSearch) {
      clearTimeout(state.stations.modalSearchTimer);
      const query = target.value.trim();

      if (query.length < 3) {
        clearStationLocationResults();
        return;
      }

      state.stations.modalSearchTimer = window.setTimeout(() => {
        searchStationLocations(query).catch((error) => {
          setStationModalStatus(error.message || "Không thể tìm vị trí.", true);
        });
      }, 350);
    }
  }

  function handleStationModalClick(event) {
    const trigger = event.target.closest("[data-action]");

    if (!trigger) {
      if (event.target === els.stationModal) {
        closeStationModalDialog();
      }
      return;
    }

    const action = trigger.dataset.action;

    if (action === "search-station-location") {
      const query = els.stationLocationSearch?.value.trim() || "";

      searchStationLocations(query).catch((error) => {
        setStationModalStatus(error.message || "Không thể tìm vị trí.", true);
      });
      return;
    }

    if (action === "select-station-location-result") {
      const index = Number(trigger.dataset.index || -1);
      const result = state.stations.modalSearchResults[index];

      if (!result) {
        return;
      }

      if (els.stationLocationSearch) {
        els.stationLocationSearch.value = result.address || "";
      }
      if (els.stationModalAddress) {
        els.stationModalAddress.value = result.address || "";
      }
      if (els.stationModalCity) {
        els.stationModalCity.value = result.city || "";
      }
      if (els.stationModalDistrict) {
        els.stationModalDistrict.value = result.district || "";
      }

      clearStationLocationResults();
      setStationModalLocation(result.lat, result.lng, { center: true });
    }
  }

  function handleStationModalSubmit(event) {
    event.preventDefault();
    submitStationForm();
  }

  function handleAccountModalClick(event) {
    const trigger = event.target.closest("[data-action]");

    if (!trigger) {
      return;
    }

    const action = trigger.dataset.action;

    if (action === "select-modal-parent") {
      state.accounts.modalParentId = trigger.dataset.id || state.accounts.profile?.id || "";
      renderParentTree();
      return;
    }

    if (action === "toggle-modal-parent-node") {
      const accountId = trigger.dataset.id || "";

      if (state.accounts.parentExpandedIds.has(accountId)) {
        state.accounts.parentExpandedIds.delete(accountId);
      } else {
        state.accounts.parentExpandedIds.add(accountId);
      }

      renderParentTree();
    }
  }

  function bindEvents() {
    els.topNavItems.forEach((item) => {
      item.addEventListener("click", () => {
        const view = item.dataset.view || "map";
        switchWorkspace(view);
      });
    });

    els.managementNavItems.forEach((item) => {
      item.addEventListener("click", () => {
        switchWorkspace(item.dataset.view || "accounts");
      });
    });

    els.managementNavToggle?.addEventListener("click", toggleManagementMenu);
    els.reportNavToggle?.addEventListener("click", toggleReportMenu);
    els.systemNavToggle?.addEventListener("click", toggleSystemMenu);
    els.deviceConfigNavToggle?.addEventListener("click", toggleDeviceConfigMenu);
    els.stationNavToggle?.addEventListener("click", toggleStationMenu);

    els.managementRefreshBtn?.addEventListener("click", () => {
      if (!state.currentPanel) {
        return;
      }

      state.cache = {};
      state.accounts.items = [];
      state.permissionGroups.items = [];
      state.permissionGroups.catalog = [];
      state.permissions.items = [];
      state.permissions.groups = [];
      state.loginPages.items = [];
      state.simTypes.items = [];
      state.deviceTypes.items = [];
      state.connectorTypes.items = [];
      renderCurrentPanel(true);
    });

    els.managementPrimaryBtn?.addEventListener("click", () => {
      if (state.currentPanel === "accounts") {
        openCreateAccountModal();
        return;
      }

      if (state.currentPanel === "station-map" || state.currentPanel === "station-info") {
        openCreateStationModal();
        return;
      }

      if (state.currentPanel === "charging-points") {
        openCreateChargingPointModal().catch((error) => {
          setStatus(error.message || "Khong the mo form cong sac.", true);
        });
        return;
      }

      if (state.currentPanel === "pricings") {
        openCreatePricingModal().catch((error) => {
          setStatus(error.message || "Khong the mo form bang gia.", true);
        });
        return;
      }

      if (state.currentPanel === "roles") {
        openPermissionGroupCreateModal();
        return;
      }

      if (state.currentPanel === "permissions") {
        openPermissionItemCreateModal();
        return;
      }

      if (state.currentPanel === "login-pages") {
        openLoginPageCreateModal();
        return;
      }

      if (state.currentPanel === "sim-types") {
        openSimTypeCreateModal();
        return;
      }

      if (state.currentPanel === "device-types") {
        openDeviceTypeCreateModal();
        return;
      }

      if (state.currentPanel === "connector-types") {
        openConnectorTypeCreateModal();
        return;
      }

      if (state.currentPanel === "bookings") {
        return;
      }

      const panel = entityPanelMap[state.currentPanel];

      if (panel) {
        window.location.href = `/admin/editor?panel=${encodeURIComponent(panel)}`;
      }
    });

    els.managementContent?.addEventListener("input", handleManagementContentInput);
    els.managementContent?.addEventListener("click", (event) => {
      handleManagementContentClick(event);

      window.setTimeout(() => {
        ensureStationImportActions();
      }, 0);
    });
    els.managementContent?.addEventListener("change", async (event) => {
      const target = event.target;

      if (!(target instanceof HTMLInputElement) || target.id !== "stationImportFileInput") {
        return;
      }

      const file = target.files?.[0];
      target.value = "";

      if (!file) {
        return;
      }

      try {
        await importStationDataFile(file);
      } catch (error) {
        setStatus(error.message || "Khong the nhap file du lieu tram sac.", true);
      }
    });
    els.managementContent?.addEventListener("submit", (event) => {
      event.preventDefault();

      const target = event.target;

      if (!(target instanceof HTMLFormElement)) {
        return;
      }

      if (target.id === "permissionGroupModalForm") {
        submitPermissionGroupForm(target);
      }
    });

    els.stationModal?.addEventListener("input", handleStationModalInput);
    els.stationModal?.addEventListener("click", handleStationModalClick);
    els.stationEditorForm?.addEventListener("submit", handleStationModalSubmit);
    els.closeStationModal?.addEventListener("click", closeStationModalDialog);
    els.stationEditorCancelBtn?.addEventListener("click", closeStationModalDialog);
    els.chargingPointEditorForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      submitChargingPointForm();
    });
    els.closeChargingPointModal?.addEventListener("click", closeChargingPointModalDialog);
    els.chargingPointEditorCancelBtn?.addEventListener("click", closeChargingPointModalDialog);
    els.chargingPointModal?.addEventListener("click", (event) => {
      if (event.target === els.chargingPointModal) {
        closeChargingPointModalDialog();
      }
    });
    els.pricingEditorForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      submitPricingForm();
    });
    els.pricingModal?.addEventListener("input", handlePricingModalInput);
    els.pricingModal?.addEventListener("click", (event) => {
      handleManagementContentClick(event);
    });
    els.closePricingModal?.addEventListener("click", closePricingModalDialog);
    els.pricingEditorCancelBtn?.addEventListener("click", closePricingModalDialog);
    els.pricingModal?.addEventListener("click", (event) => {
      if (event.target === els.pricingModal) {
        closePricingModalDialog();
      }
    });
    els.closePermissionModal?.addEventListener("click", () => {
      closeBackdrop(els.permissionModal);
      resetPermissionModal();
    });
    els.permissionModalCancelBtn?.addEventListener("click", () => {
      closeBackdrop(els.permissionModal);
      resetPermissionModal();
    });
    els.permissionModal?.addEventListener("click", (event) => {
      if (event.target === els.permissionModal) {
        closeBackdrop(els.permissionModal);
        resetPermissionModal();
      }
    });
    els.permissionModalForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      submitPermissionForm(event.target);
    });
    els.closeLoginPageModal?.addEventListener("click", () => {
      closeBackdrop(els.loginPageModal);
      resetLoginPageModal();
    });
    els.loginPageModalCancelBtn?.addEventListener("click", () => {
      closeBackdrop(els.loginPageModal);
      resetLoginPageModal();
    });
    els.loginPageModal?.addEventListener("click", (event) => {
      if (event.target === els.loginPageModal) {
        closeBackdrop(els.loginPageModal);
        resetLoginPageModal();
      }
    });
    els.loginPageModalForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      submitLoginPageForm(event.target);
    });
    els.loginPageModalLogoTrigger?.addEventListener("click", () => {
      els.loginPageModalLogoUpload?.click();
    });
    els.loginPageModalIconTrigger?.addEventListener("click", () => {
      els.loginPageModalIconUpload?.click();
    });
    els.loginPageModalBackgroundTrigger?.addEventListener("click", () => {
      els.loginPageModalBackgroundUpload?.click();
    });
    els.loginPageModalLogoUpload?.addEventListener("change", async () => {
      const file = els.loginPageModalLogoUpload?.files?.[0];
      if (!file) {
        return;
      }
      await handleLoginPageAssetChange("logo", file);
      els.loginPageModalLogoUpload.value = "";
    });
    els.loginPageModalIconUpload?.addEventListener("change", async () => {
      const file = els.loginPageModalIconUpload?.files?.[0];
      if (!file) {
        return;
      }
      await handleLoginPageAssetChange("icon", file);
      els.loginPageModalIconUpload.value = "";
    });
    els.loginPageModalBackgroundUpload?.addEventListener("change", async () => {
      const file = els.loginPageModalBackgroundUpload?.files?.[0];
      if (!file) {
        return;
      }
      await handleLoginPageAssetChange("background", file);
      els.loginPageModalBackgroundUpload.value = "";
    });
    els.closeSimTypeModal?.addEventListener("click", () => {
      closeBackdrop(els.simTypeModal);
      resetSimTypeModal();
    });
    els.simTypeModalCancelBtn?.addEventListener("click", () => {
      closeBackdrop(els.simTypeModal);
      resetSimTypeModal();
    });
    els.simTypeModal?.addEventListener("click", (event) => {
      if (event.target === els.simTypeModal) {
        closeBackdrop(els.simTypeModal);
        resetSimTypeModal();
      }
    });
    els.simTypeModalForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      submitSimTypeForm(event.target);
    });
    els.closeDeviceTypeModal?.addEventListener("click", () => {
      closeBackdrop(els.deviceTypeModal);
      resetDeviceTypeModal();
    });
    els.deviceTypeModalCancelBtn?.addEventListener("click", () => {
      closeBackdrop(els.deviceTypeModal);
      resetDeviceTypeModal();
    });
    els.deviceTypeModal?.addEventListener("click", (event) => {
      if (event.target === els.deviceTypeModal) {
        closeBackdrop(els.deviceTypeModal);
        resetDeviceTypeModal();
      }
    });
    els.deviceTypeModalForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      submitDeviceTypeForm(event.target);
    });
    els.deviceTypeModalImageTrigger?.addEventListener("click", () => {
      els.deviceTypeModalImageUpload?.click();
    });
    els.deviceTypeModalImageUpload?.addEventListener("change", async () => {
      const file = els.deviceTypeModalImageUpload?.files?.[0];
      if (!file) {
        return;
      }
      await handleDeviceTypeImageChange(file);
      els.deviceTypeModalImageUpload.value = "";
    });
    els.closeConnectorTypeModal?.addEventListener("click", () => {
      closeBackdrop(els.connectorTypeModal);
      resetConnectorTypeModal();
    });
    els.connectorTypeModalCancelBtn?.addEventListener("click", () => {
      closeBackdrop(els.connectorTypeModal);
      resetConnectorTypeModal();
    });
    els.connectorTypeModal?.addEventListener("click", (event) => {
      if (event.target === els.connectorTypeModal) {
        closeBackdrop(els.connectorTypeModal);
        resetConnectorTypeModal();
      }
    });
    els.connectorTypeModalForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      submitConnectorTypeForm(event.target);
    });
    els.connectorTypeModalImageTrigger?.addEventListener("click", () => {
      els.connectorTypeModalImageUpload?.click();
    });
    els.connectorTypeModalImageUpload?.addEventListener("change", async () => {
      const file = els.connectorTypeModalImageUpload?.files?.[0];
      if (!file) {
        return;
      }
      await handleConnectorTypeImageChange(file);
      els.connectorTypeModalImageUpload.value = "";
    });
    els.closeBookingHistoryDetailModal?.addEventListener("click", closeBookingHistoryDetailModal);
    els.bookingHistoryDetailModal?.addEventListener("click", (event) => {
      if (event.target === els.bookingHistoryDetailModal) {
        closeBookingHistoryDetailModal();
      }
    });

    els.accountTabs.forEach((button) => {
      button.addEventListener("click", () => {
        activateAccountTab(button.dataset.accountTab || "basic");
      });
    });

    els.closeAccountModal?.addEventListener("click", () => closeBackdrop(els.accountModal));
    els.accountEditorCancelBtn?.addEventListener("click", () => closeBackdrop(els.accountModal));
    els.accountModal?.addEventListener("click", (event) => {
      if (event.target === els.accountModal) {
        closeBackdrop(els.accountModal);
      }
    });

    els.accountEditorForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      submitAccountForm();
    });

    els.accountParentSearch?.addEventListener("input", (event) => {
      state.accounts.parentSearch = event.target.value || "";
      renderParentTree();
    });

    els.accountParentTree?.addEventListener("click", handleAccountModalClick);

    els.closeAccountConfirmModal?.addEventListener("click", closeConfirmModal);
    els.accountConfirmCancelBtn?.addEventListener("click", closeConfirmModal);
    els.accountConfirmModal?.addEventListener("click", (event) => {
      if (event.target === els.accountConfirmModal) {
        closeConfirmModal();
      }
    });

    els.accountConfirmSubmitBtn?.addEventListener("click", async () => {
      if (state.confirmAction) {
        await state.confirmAction();
        return;
      }

      closeConfirmModal();
    });

    els.closePermissionGroupModal?.addEventListener("click", () => {
      closeBackdrop(els.permissionGroupModal);
      resetPermissionGroupModal();
    });
    els.permissionGroupModalCancelBtn?.addEventListener("click", () => {
      closeBackdrop(els.permissionGroupModal);
      resetPermissionGroupModal();
    });
    els.permissionGroupModal?.addEventListener("click", (event) => {
      if (event.target === els.permissionGroupModal) {
        closeBackdrop(els.permissionGroupModal);
        resetPermissionGroupModal();
      }
    });
    els.permissionGroupModal?.addEventListener("change", (event) => {
      const target = event.target;

      if (!(target instanceof HTMLInputElement)) {
        return;
      }

      if (target.hasAttribute("data-permission-group-toggle") && els.permissionGroupPermissionList) {
        const groupId = target.getAttribute("data-permission-group-toggle") || "";
        const childToggles = Array.from(
          els.permissionGroupPermissionList.querySelectorAll(`[data-parent-permission="${groupId}"]`)
        );

        childToggles.forEach((child) => {
          child.checked = target.checked;
        });
      }

      if (target.hasAttribute("data-parent-permission")) {
        syncPermissionGroupToggleStates();
      }
    });
    els.permissionGroupModalForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      submitPermissionGroupForm(event.target);
    });
  }

  bindEvents();

  const initialView =
    pathViews[window.location.pathname] ||
    window.TRAM_SAC_CONFIG?.initialView ||
    "map";

  switchWorkspace(initialView, { syncUrl: true, replaceUrl: true });

  window.addEventListener("popstate", () => {
    const view = pathViews[window.location.pathname] || "map";
    switchWorkspace(view, { syncUrl: false });
    window.dispatchEvent(new CustomEvent("tram-sac:navigation", { detail: { view } }));
  });
})();
