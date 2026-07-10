// Centralized limits so every form validates consistently, and so a limit
// only ever needs to change in one place.

export const LIMITS = {
  PREFIX_MAX: 10,
  MESSAGE_MAX: 1000, // welcome/leave templates; comfortably under Discord's 2000-char message cap
  EMOJI_MAX: 60,
  THRESHOLD_MIN: 1,
  THRESHOLD_MAX: 500,
};

export function clamp(value, min, max) {
  const n = Number(value);
  if (Number.isNaN(n)) return min;
  return Math.min(Math.max(n, min), max);
}

export const LANGUAGES = [
  { code: "es", label: "Español", flag: "\uD83C\uDDF2\uD83C\uDDFD" }, // 🇲🇽
  { code: "en", label: "English", flag: "\uD83C\uDDFA\uD83C\uDDF8" }, // 🇺🇸
];
