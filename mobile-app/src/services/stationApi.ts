import { apiClient } from "./api/client";
import type { StationListResponse } from "../types/api";

export async function getStations(params?: {
  keyword?: string;
  status?: string;
  connectorType?: string;
  minPowerKw?: number;
  maxPowerKw?: number;
  availableOnly?: boolean;
  page?: number;
  limit?: number;
}) {
  const { data } = await apiClient.get<StationListResponse>("/api/stations", {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
      ...params
    }
  });

  return data;
}
