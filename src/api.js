import { API_BASE_URL } from "./config";
import { clearToken, getToken } from "./auth";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/**
 * Calls the A-Commie API and unwraps its {status, data, error, success}
 * envelope. On a 401 (expired/invalid session), clears the stored token
 * and sends the user back to the landing page -- every page that depends
 * on being logged in will naturally redirect there instead of showing a
 * broken, half-loaded screen.
 */
async function request(path, { method = "GET", body } = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    clearToken();
    window.location.href = "/";
    throw new ApiError("Session expired", 401);
  }

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(payload.error || `Request failed (${res.status})`, res.status);
  }
  return payload.data;
}

export const api = {
  exchangeCode: (sessionCode) =>
    request("/json/auth/exchange", { method: "POST", body: { session_code: sessionCode } }),
  me: () => request("/json/auth/me"),
  getGuildConfig: (guildId) => request(`/json/guilds/${guildId}`),
  updateGuildConfig: (guildId, body) => request(`/json/guilds/${guildId}`, { method: "PATCH", body }),
  getGuildChannels: (guildId) => request(`/json/guilds/${guildId}/channels`),
  getStarboard: (guildId) => request(`/json/guilds/${guildId}/starboard`),
  updateStarboard: (guildId, body) => request(`/json/guilds/${guildId}/starboard`, { method: "PATCH", body }),
};
