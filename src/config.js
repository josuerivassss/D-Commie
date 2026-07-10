// Values are baked in at build time from Vite env vars (see .env.example).
// Vite only exposes variables prefixed with VITE_ to client code -- this is
// intentional and safe: none of these are secret (client_id, permissions,
// and public URLs are meant to be visible in the browser).

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
export const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID || "";
export const SUPPORT_SERVER_URL = import.meta.env.VITE_SUPPORT_SERVER_URL || "https://discord.gg/change-me";
export const BOT_INVITE_PERMISSIONS = import.meta.env.VITE_BOT_INVITE_PERMISSIONS || "8";

/** "Add to Server" link with no guild preselected. */
export function botInviteUrl() {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    permissions: BOT_INVITE_PERMISSIONS,
    scope: "bot applications.commands",
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

/** "Add to Server" link with one specific guild preselected and locked. */
export function botInviteUrlForGuild(guildId) {
  return `${botInviteUrl()}&guild_id=${guildId}&disable_guild_select=true`;
}

/** Sends the browser to Discord's OAuth consent screen. Discord redirects
 * back to the API's own /json/auth/callback (registered in the Discord
 * Developer Portal), which then redirects here to /auth/callback with a
 * session token -- see pages/AuthCallback.jsx. */
export function discordLoginUrl() {
  const redirectUri = `${API_BASE_URL}/json/auth/callback`;
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify guilds",
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}
