import axios from "axios";
import { appConfig } from "../../constants/appConfig";

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 15000
});

export function setApiAuthToken(token: string | null) {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete apiClient.defaults.headers.common.Authorization;
}
