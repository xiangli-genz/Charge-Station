import { apiClient } from "./api/client";
import type { CustomerProfile } from "../types/api";

export async function getProfile() {
  const { data } = await apiClient.get<{ success: boolean; user: CustomerProfile }>("/api/app/profile");
  return data.user;
}

export async function updateProfile(
  input: Partial<
    Pick<
      CustomerProfile,
      | "fullName"
      | "phone"
      | "email"
      | "address"
      | "description"
      | "vehicleType"
      | "vehicleName"
      | "vehicleImageUrl"
    >
  >
) {
  const { data } = await apiClient.patch<{ success: boolean; user: CustomerProfile }>("/api/app/profile", input);
  return data.user;
}
