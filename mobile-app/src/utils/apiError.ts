import axios from "axios";

export function getApiErrorMessage(error: unknown, fallback = "Đã có lỗi xảy ra") {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }

    if (error.code === "ECONNABORTED") {
      return "Kết nối tới backend bị quá thời gian. Kiểm tra server và địa chỉ API.";
    }

    if (error.message === "Network Error") {
      return "Không kết nối được backend. Kiểm tra API đang dùng và thử mở http://10.0.2.2:5000/api/health trên máy ảo.";
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
