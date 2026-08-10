import { API_BASE_URL } from "./config";
import { clearToken, getToken } from "./auth";

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export function friendlyErrorMessage(err, t) {
  if (err instanceof ApiError && err.status === 0) {
    if (t) return t("common.networkError");
    return "No se pudo conectar con el servidor. Si usas Brave, prueba desactivar Shields para este sitio (icono del león en la barra de direcciones) e intenta de nuevo.";
  }
  return err.message;
}

const FETCH_RETRIES = 2;
const FETCH_RETRY_DELAY_MS = 400;

// A raw fetch() failure (TypeError: Failed to fetch) can come from a
// transient blip -- DNS hiccup, a browser extension's request interception
// racing with the page, a stale keep-alive socket right after the machine
// wakes from sleep -- not just an actual connectivity block. Retrying a
// couple of times with a short backoff transparently absorbs those without
// forcing the user to hard-refresh the page.
async function fetchWithRetry(url, options) {
  let lastError;
  for (let attempt = 0; attempt <= FETCH_RETRIES; attempt++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      lastError = err;
      if (attempt < FETCH_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, FETCH_RETRY_DELAY_MS * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

async function request(path, { method = "GET", body } = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetchWithRetry(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("network_error", 0);
  }

  if (res.status === 401) {
    clearToken();
    window.location.href = "/";
    throw new ApiError("Session expired", 401);
  }

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(payload.error || `Request failed (${res.status})`, res.status, payload.data);
  }
  return payload.data;
}

export const api = {
  exchangeCode: (sessionCode) =>
    request("/json/auth/exchange", { method: "POST", body: { session_code: sessionCode } }),
  me: () => request("/json/auth/me"),
  getGuildConfig: (guildId) => request(`/json/guilds/${guildId}`),
  getGuildNickname: (guildId) => request(`/json/guilds/${guildId}/nickname`),
  updateGuildConfig: (guildId, body) => request(`/json/guilds/${guildId}`, { method: "PATCH", body }),
  getGuildChannels: (guildId) => request(`/json/guilds/${guildId}/channels`),
  getGuildRoles: (guildId) => request(`/json/guilds/${guildId}/roles`),
  getAutoroles: (guildId) => request(`/json/guilds/${guildId}/autoroles`),
  updateAutoroles: (guildId, body) => request(`/json/guilds/${guildId}/autoroles`, { method: "PATCH", body }),
  getStarboard: (guildId) => request(`/json/guilds/${guildId}/starboard`),
  updateStarboard: (guildId, body) => request(`/json/guilds/${guildId}/starboard`, { method: "PATCH", body }),
  getGuildEmojis: (guildId) => request(`/json/guilds/${guildId}/emojis`),
  getSendableChannels: (guildId) => request(`/json/guilds/${guildId}/embeds/channels`),
  getEmbedCooldown: (guildId) => request(`/json/guilds/${guildId}/embeds/cooldown`),
  sendEmbed: (guildId, body) => request(`/json/guilds/${guildId}/embeds/send`, { method: "POST", body }),
  getTicketsConfig: (guildId) => request(`/json/guilds/${guildId}/tickets`),
  updateTicketsConfig: (guildId, body) => request(`/json/guilds/${guildId}/tickets`, { method: "PATCH", body }),
  getTicketChannels: (guildId) => request(`/json/guilds/${guildId}/tickets/channels`),
  postTicketPanel: (guildId, body) => request(`/json/guilds/${guildId}/tickets/panel`, { method: "POST", body }),
  getGuildDisabledCommands: (guildId) => request(`/json/guilds/${guildId}/commands`),
  toggleGuildCommand: (guildId, body) => request(`/json/guilds/${guildId}/commands/toggle`, { method: "PATCH", body }),
  logout: () => request("/json/auth/logout", { method: "POST" }).catch(() => null),
};