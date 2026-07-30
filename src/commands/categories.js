// Static mapping from cog name (== "category" field in commands-data.json)
// to display color/description. Not derivable from the JSON itself since
// it's presentation-only metadata, not something discord.py exposes.
export const CATEGORY_META = {
  Moderation: { color: "#da373c", description: "Locks, timeouts, kicks, bans, and message purges." },
  Fun: { color: "#f1574b", description: "Avatar edits, ships, and text toys." },
  Tags: { color: "#5865f2", description: "Reusable text snippets your server can recall on demand." },
  Utility: { color: "#23a55a", description: "Profile, server, currency, color, and HTTP lookups." },
  Configuration: { color: "#949ba4", description: "Prefix and language settings." },
  Autoroles: { color: "#f1c40f", description: "Automatic role assignment on member join." },
  Starboard: { color: "#f1c40f", description: "Highlight community-starred messages." },
  Tickets: { color: "#5865f2", description: "Private support threads opened from a panel." },
  Reminders: { color: "#23a55a", description: "Personal, timezone-aware reminders." },
  Greetings: { color: "#5865f2", description: "Welcome and leave messages." },
};

export function categoryMeta(name) {
  return CATEGORY_META[name] || { color: "#949ba4", description: "" };
}