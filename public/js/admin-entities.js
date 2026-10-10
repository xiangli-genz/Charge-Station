window.adminEntityHelpers = {
  formatDateTime(value) {
    if (!value) {
      return "--";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date);
  },

  toDatetimeLocalValue(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
  },

  splitToArray(value) {
    return String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  },

  toIsoString(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  },

  getPanelFromQuery(defaultPanel = "pricings") {
    const panel = new URLSearchParams(window.location.search).get("panel");
    return panel && window.adminEntityConfigs[panel] ? panel : defaultPanel;
  }
};

(function initializeAdminEntities() {
  const {
    formatDateTime,
    toDatetimeLocalValue,
    splitToArray,
    toIsoString
  } = window.adminEntityHelpers;

  window.adminEntityConfigs = {
    pricings: {
      title: "Bang gia",
      summary: "Quan ly danh sach pricing, tim kiem theo ten va sua/xoa nhanh.",
      listEndpoint: "/api/admin/pricings?limit=50",
      createEndpoint: "/api/admin/pricings",
      getEndpoint(id) {
        return `/api/admin/pricings/${id}`;
      },
      updateEndpoint(id) {
        return `/api/admin/pricings/${id}`;
      },
      deleteEndpoint(id) {
        return `/api/admin/pricings/${id}`;
      },
      importDataset: "pricings",
      formTitle: "Nhap tay bang gia",
      formLead: "Tao moi hoac sua bang gia hien co.",
      hint: "Nhap ten bang gia, gia theo kWh va gia theo phut.",
      fields: [
        { key: "name", label: "Ten bang gia", type: "text", placeholder: "Gia nhanh", required: true },
        { key: "pricePerKwh", label: "Gia / kWh", type: "number", placeholder: "4200", required: true, min: "0", step: "0.01" },
        { key: "pricePerMinute", label: "Gia / phut", type: "number", placeholder: "150", required: false, min: "0", step: "0.01" }
      ],
      buildPayload(values) {
        return {
          name: values.name,
          pricePerKwh: Number(values.pricePerKwh),
          pricePerMinute: values.pricePerMinute ? Number(values.pricePerMinute) : 0
        };
      },
      toFormValues(item) {
        return {
          name: item.name,
          pricePerKwh: String(item.pricePerKwh),
          pricePerMinute: String(item.pricePerMinute ?? 0)
        };
      },
      searchText(item) {
        return `${item.name} ${item.pricePerKwh} ${item.pricePerMinute}`.toLowerCase();
      },
      renderItem(item) {
        return {
          title: item.name,
          lines: [
            `Gia / kWh: ${item.pricePerKwh}`,
            `Gia / phut: ${item.pricePerMinute}`,
            `Cap nhat: ${formatDateTime(item.updatedAt)}`
          ]
        };
      }
    },
    stations: {
      title: "Tram sac",
      summary: "Danh sach tram sac de phuc vu tim kiem, du doan va booking.",
      listEndpoint: "/api/admin/stations?limit=50",
      createEndpoint: "/api/admin/stations",
      getEndpoint(id) {
        return `/api/admin/stations/${id}`;
      },
      updateEndpoint(id) {
        return `/api/admin/stations/${id}`;
      },
      deleteEndpoint(id) {
        return `/api/admin/stations/${id}`;
      },
      importDataset: "stations",
      formTitle: "Nhap tay tram sac",
      formLead: "Dien IMEI, thong tin tram, toa do va trang thai van hanh.",
      hint: "Nhap IMEI, ten tram, dia chi, toa do va trang thai van hanh.",
      fields: [
        { key: "imei", label: "IMEI", type: "text", placeholder: "8657265579" },
        { key: "name", label: "Ten tram", type: "text", placeholder: "Tram Sac Quan 1", required: true },
        { key: "address", label: "Dia chi", type: "text", placeholder: "123 Le Loi, Quan 1, TP.HCM", required: true },
        { key: "location.lat", label: "Vi do", type: "number", placeholder: "10.7769", required: true, step: "0.000001" },
        { key: "location.lng", label: "Kinh do", type: "number", placeholder: "106.7009", required: true, step: "0.000001" },
        {
          key: "status",
          label: "Trang thai",
          type: "select",
          required: true,
          options: [
            { value: "active", label: "active" },
            { value: "inactive", label: "inactive" },
            { value: "maintenance", label: "maintenance" },
            { value: "closed", label: "closed" }
          ]
        }
      ],
      buildPayload(values) {
        return {
          imei: values.imei,
          name: values.name,
          address: values.address,
          location: {
            lat: Number(values["location.lat"]),
            lng: Number(values["location.lng"])
          },
          status: values.status
        };
      },
      toFormValues(item) {
        return {
          imei: item.imei || "",
          name: item.name,
          address: item.address,
          "location.lat": String(item.location?.lat ?? ""),
          "location.lng": String(item.location?.lng ?? ""),
          status: item.status
        };
      },
      searchText(item) {
        return `${item.imei || ""} ${item.name} ${item.address} ${item.status}`.toLowerCase();
      },
      renderItem(item) {
        return {
          title: item.name,
          lines: [
            item.address,
            `Toa do: ${item.location?.lat}, ${item.location?.lng}`,
            `Trang thai: ${item.status}`
          ]
        };
      }
    },
    "charging-points": {
      title: "Cong sac",
      summary: "Danh sach cong sac, ma cong, loai dau noi va pricing dang ap dung.",
      listEndpoint: "/api/admin/charging-points?limit=50",
      createEndpoint: "/api/admin/charging-points",
      getEndpoint(id) {
        return `/api/admin/charging-points/${id}`;
      },
      updateEndpoint(id) {
        return `/api/admin/charging-points/${id}`;
      },
      deleteEndpoint(id) {
        return `/api/admin/charging-points/${id}`;
      },
      importDataset: "charging-points",
      formTitle: "Nhap tay cong sac",
      formLead: "Can nhap dung stationId va pricingId da ton tai trong he thong.",
      hint: "Can nhap dung stationId va pricingId da co trong he thong.",
      fields: [
        { key: "stationId", label: "Station ID", type: "text", placeholder: "66b000000000000000000001", required: true },
        { key: "pricingId", label: "Pricing ID", type: "text", placeholder: "66b000000000000000000002", required: true },
        { key: "code", label: "Ma cong sac", type: "text", placeholder: "Q1-CP-01", required: true },
        {
          key: "connectorType",
          label: "Loai dau noi",
          type: "select",
          required: true,
          options: [
            { value: "AC_Type2", label: "AC_Type2" },
            { value: "CCS2", label: "CCS2" },
            { value: "CHAdeMO", label: "CHAdeMO" },
            { value: "GB_T", label: "GB_T" }
          ]
        },
        { key: "powerKw", label: "Cong suat (kW)", type: "number", placeholder: "120", required: true, min: "0", step: "0.01" },
        {
          key: "status",
          label: "Trang thai",
          type: "select",
          required: true,
          options: [
            { value: "available", label: "available" },
            { value: "occupied", label: "occupied" },
            { value: "reserved", label: "reserved" },
            { value: "maintenance", label: "maintenance" }
          ]
        }
      ],
      buildPayload(values) {
        return {
          stationId: values.stationId,
          pricingId: values.pricingId,
          code: values.code,
          connectorType: values.connectorType,
          powerKw: Number(values.powerKw),
          status: values.status
        };
      },
      toFormValues(item) {
        return {
          stationId: item.station?.id || "",
          pricingId: item.pricing?.id || "",
          code: item.code,
          connectorType: item.connectorType,
          powerKw: String(item.powerKw ?? ""),
          status: item.status
        };
      },
      searchText(item) {
        return [
          item.code,
          item.station?.name,
          item.pricing?.name,
          item.connectorType,
          item.status
        ].join(" ").toLowerCase();
      },
      renderItem(item) {
        return {
          title: item.code,
          lines: [
            `${item.station?.name || "--"} | ${item.pricing?.name || "--"}`,
            `${item.connectorType} | ${item.powerKw} kW`,
            `Trang thai: ${item.status}`
          ]
        };
      }
    },
    bookings: {
      title: "Booking",
      summary: "Danh sach lich dat cong sac, co kiem tra trung lich va customer lien quan.",
      listEndpoint: "/api/admin/bookings?limit=50",
      createEndpoint: "/api/admin/bookings",
      getEndpoint(id) {
        return `/api/admin/bookings/${id}`;
      },
      updateEndpoint(id) {
        return `/api/admin/bookings/${id}`;
      },
      deleteEndpoint(id) {
        return `/api/admin/bookings/${id}`;
      },
      importDataset: "",
      formTitle: "Nhap tay booking",
      formLead: "Nhap userId neu customer da co. Neu bo trong, he thong se tao hoac tai su dung customer theo thong tin ben duoi.",
      hint: "Booking can co chargingPointId, thoi gian bat dau va ket thuc hop le.",
      fields: [
        { key: "chargingPointId", label: "Charging Point ID", type: "text", placeholder: "66b000000000000000000003", required: true },
        { key: "startTime", label: "Bat dau", type: "datetime-local", required: true },
        { key: "endTime", label: "Ket thuc", type: "datetime-local", required: true },
        {
          key: "status",
          label: "Trang thai",
          type: "select",
          required: true,
          options: [
            { value: "pending", label: "pending" },
            { value: "confirmed", label: "confirmed" },
            { value: "cancelled", label: "cancelled" },
            { value: "completed", label: "completed" }
          ]
        },
        { key: "userId", label: "Customer User ID", type: "text", placeholder: "Bo trong neu tao customer tu thong tin ben duoi", required: false },
        { key: "customer.fullName", label: "Ten khach hang", type: "text", placeholder: "Nguyen Van A", required: false },
        { key: "customer.phone", label: "So dien thoai", type: "text", placeholder: "0901234567", required: false },
        { key: "customer.email", label: "Email khach hang", type: "email", placeholder: "customer@example.com", required: false }
      ],
      buildPayload(values, mode) {
        const payload = {
          chargingPointId: values.chargingPointId,
          startTime: toIsoString(values.startTime),
          endTime: toIsoString(values.endTime),
          status: values.status
        };

        if (mode === "edit") {
          return payload;
        }

        if (values.userId) {
          payload.userId = values.userId;
          return payload;
        }

        payload.customer = {
          fullName: values["customer.fullName"],
          phone: values["customer.phone"],
          email: values["customer.email"]
        };
        return payload;
      },
      toFormValues(item) {
        return {
          chargingPointId: item.chargingPoint?.id || "",
          startTime: toDatetimeLocalValue(item.startTime),
          endTime: toDatetimeLocalValue(item.endTime),
          status: item.status,
          userId: item.user?.id || "",
          "customer.fullName": item.user?.fullName || "",
          "customer.phone": item.user?.phone || "",
          "customer.email": item.user?.email || ""
        };
      },
      searchText(item) {
        return [
          item.user?.fullName,
          item.user?.email,
          item.user?.phone,
          item.chargingPoint?.code,
          item.status
        ].join(" ").toLowerCase();
      },
      renderItem(item) {
        return {
          title: `${item.user?.fullName || "Customer"} | ${item.chargingPoint?.code || "--"}`,
          lines: [
            `${item.user?.email || "--"} | ${item.user?.phone || "--"}`,
            `${formatDateTime(item.startTime)} -> ${formatDateTime(item.endTime)}`,
            `Trang thai: ${item.status} | Tram: ${item.chargingPoint?.station?.name || "--"}`
          ]
        };
      }
    }
  };
})();
