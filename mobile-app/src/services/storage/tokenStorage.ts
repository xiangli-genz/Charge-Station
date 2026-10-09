import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "tram_sac_mobile_token";
const IDENTIFIER_KEY = "tram_sac_mobile_identifier";

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function saveIdentifier(identifier: string) {
  await SecureStore.setItemAsync(IDENTIFIER_KEY, identifier);
}

export async function getIdentifier() {
  return SecureStore.getItemAsync(IDENTIFIER_KEY);
}

export async function clearIdentifier() {
  await SecureStore.deleteItemAsync(IDENTIFIER_KEY);
}
