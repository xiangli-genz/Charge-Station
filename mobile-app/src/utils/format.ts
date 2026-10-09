export function formatDateTime(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

export function formatBookingTimeRange(startValue: string | Date, endValue: string | Date) {
  const start = typeof startValue === "string" ? new Date(startValue) : startValue;
  const end = typeof endValue === "string" ? new Date(endValue) : endValue;

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "--";
  }

  const date = `${start.getDate()}/${start.getMonth() + 1}/${start.getFullYear()}`;
  const formatTime = (value: Date) =>
    `${`${value.getHours()}`.padStart(2, "0")}:${`${value.getMinutes()}`.padStart(2, "0")}`;

  return `(${date}) ${formatTime(start)} - ${formatTime(end)}`;
}

export function formatDateOnly(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium"
  }).format(date);
}

export function formatNumber(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0";
  }

  return new Intl.NumberFormat("vi-VN").format(value);
}

export function formatCurrency(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0 đ";
  }

  return `${new Intl.NumberFormat("vi-VN").format(value)} đ`;
}

export function getStationStatusLabel(status: string) {
  switch (status) {
    case "active":
      return "Đang hoạt động";
    case "inactive":
      return "Chưa hoạt động";
    case "maintenance":
      return "Bảo trì";
    case "closed":
      return "Đóng cửa";
    default:
      return status || "Không rõ";
  }
}

export function getChargingPointStatusLabel(status: string) {
  switch (status) {
    case "available":
      return "Sẵn sàng";
    case "occupied":
      return "Đang sạc";
    case "reserved":
      return "Đã đặt";
    case "maintenance":
      return "Bảo trì";
    default:
      return status || "Không rõ";
  }
}

export function getBookingStatusLabel(status: string) {
  switch (status) {
    case "pending":
      return "Chờ xác nhận";
    case "confirmed":
      return "Đã xác nhận";
    case "cancelled":
      return "Đã hủy";
    case "completed":
      return "Hoàn thành";
    default:
      return status || "Không rõ";
  }
}
