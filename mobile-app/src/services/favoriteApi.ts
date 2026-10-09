import { apiClient } from "./api/client";
import type { FavoriteStationListResponse } from "../types/api";

export async function getFavoriteStations() {
  const { data } = await apiClient.get<FavoriteStationListResponse>("/api/app/favorites");
  return data;
}

export async function addFavoriteStation(stationId: string) {
  const { data } = await apiClient.post("/api/app/favorites", { stationId });
  return data;
}

export async function removeFavoriteStation(stationId: string) {
  const { data } = await apiClient.delete(`/api/app/favorites/${stationId}`);
  return data;
}
