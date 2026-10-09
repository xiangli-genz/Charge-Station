import { apiClient } from "./api/client";
import type {
  AuthResponse,
  CustomerProfile,
  RegistrationOtpResponse
} from "../types/api";

export async function loginCustomer(input: { identifier: string; password: string }) {
  const { data } = await apiClient.post<AuthResponse>("/api/app/auth/login", input);
  return data;
}

export async function registerCustomer(input: {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  verificationChannel?: "email" | "phone";
}) {
  const { data } = await apiClient.post<RegistrationOtpResponse>(
    "/api/app/auth/register",
    input
  );
  return data;
}

export async function verifyCustomerRegistration(input: {
  userId: string;
  channel: "email" | "phone";
  code: string;
}) {
  const { data } = await apiClient.post<AuthResponse>(
    "/api/app/auth/register/verify",
    input
  );
  return data;
}

export async function loginCustomerByPin(input: {
  identifier: string;
  pin: string;
}) {
  const { data } = await apiClient.post<AuthResponse>(
    "/api/app/auth/login/pin",
    input
  );
  return data;
}

export async function getLoginMethods(identifier: string) {
  const { data } = await apiClient.get<{
    success: boolean;
    pinEnabled: boolean;
    user?: { fullName: string };
  }>("/api/app/auth/login/methods", {
    params: { identifier }
  });
  return data;
}

export async function setCustomerPin(pin: string) {
  const { data } = await apiClient.post<{ success: boolean; user: CustomerProfile }>(
    "/api/app/auth/pin",
    { pin }
  );
  return data.user;
}

export async function resetPinWithPassword(input: {
  identifier: string;
  password: string;
  pin: string;
}) {
  const { data } = await apiClient.post<AuthResponse>(
    "/api/app/auth/pin/reset/password",
    input
  );
  return data;
}

export async function requestPinResetOtp(input: {
  identifier: string;
  channel: "email" | "phone";
}) {
  const { data } = await apiClient.post<{
    success: boolean;
    message: string;
    channel: "email" | "phone";
    target: string;
    expiresAt: string;
    devCode?: string;
  }>("/api/app/auth/pin/reset/request-otp", input);
  return data;
}

export async function resetPinWithOtp(input: {
  identifier: string;
  channel: "email" | "phone";
  code: string;
  pin: string;
}) {
  const { data } = await apiClient.post<AuthResponse>(
    "/api/app/auth/pin/reset/verify-otp",
    input
  );
  return data;
}

export async function getCurrentCustomer() {
  const { data } = await apiClient.get<{ success: boolean; user: CustomerProfile }>("/api/app/auth/me");
  return data.user;
}
