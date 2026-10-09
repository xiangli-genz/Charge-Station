import { apiClient } from "./api/client";
import type { ActivityLogListResponse } from "../types/api";

export async function getActivityLogs(params?: { page?: number; limit?: number }) {
  const { data } = await apiClient.get<ActivityLogListResponse>("/api/app/activity-logs", {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20
    }
  });

  return data;
}
