import { apiClient } from "./api/client";
import type { BookingListResponse, BookingItem } from "../types/api";

export async function getBookingHistory(params?: { page?: number; limit?: number; status?: string }) {
  const { data } = await apiClient.get<BookingListResponse>("/api/app/bookings", {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
      ...params
    }
  });

  return data;
}

export async function getBookingById(bookingId: string) {
  const { data } = await apiClient.get<{ success: boolean; item: BookingItem }>(
    `/api/app/bookings/${bookingId}`
  );

  return data.item;
}

export async function createBooking(input: {
  chargingPointId: string;
  startTime: string;
  endTime: string;
}) {
  const { data } = await apiClient.post<{ success: boolean; item: BookingItem; message: string }>(
    "/api/app/bookings",
    input
  );

  return data.item;
}

export async function cancelBooking(bookingId: string) {
  const { data } = await apiClient.patch(`/api/app/bookings/${bookingId}/cancel`);
  return data;
}
