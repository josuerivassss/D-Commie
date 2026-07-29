import { api } from "./api";

const STORAGE_KEY = "bcommie_token";

export function getToken() {
  return localStorage.getItem(STORAGE_KEY);
}

export function setToken(token) {
  localStorage.setItem(STORAGE_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(STORAGE_KEY);
}

export function isLoggedIn() {
  return Boolean(getToken());
}

/** Best-effort server-side revocation followed by unconditional local
 * cleanup -- a failed logout request must never leave the user stuck. */
export async function logout() {
  await api.logout();
  clearToken();
}