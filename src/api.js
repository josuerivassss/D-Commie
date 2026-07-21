import { API_BASE_URL } from "./config";
import { clearToken, getToken } from "./auth";

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export function friendlyErrorMessage(err) {
  if (err instanceof ApiError && err.status === 0) {
    return "No se pudo conectar con el servidor. Si usas Brave, prueba desactivar Shields para este sitio (icono del león en la barra de direcciones) e intenta de nuevo.";
  }
  return err.message;
}

async function request(path, { method = "GET", body } = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
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
};