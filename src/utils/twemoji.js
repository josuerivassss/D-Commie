// Shared Twemoji helpers: converts a unicode emoji string into the code
// point path Twitter's Twemoji CDN uses for its SVG assets. Used by any
// component that needs a rendered emoji image instead of relying on the
// OS/browser's own (often inconsistent) emoji font -- see EmojiPicker and
// LanguageSelect.
export const TWEMOJI_BASE = "https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/";

export function toCodePoint(unicodeSurrogates) {
  const codePoints = [];
  let previousSurrogate = 0;
  for (let i = 0; i < unicodeSurrogates.length; i++) {
    const charCode = unicodeSurrogates.charCodeAt(i);
    if (previousSurrogate) {
      codePoints.push((0x10000 + (previousSurrogate - 0xd800) * 0x400 + (charCode - 0xdc00)).toString(16));
      previousSurrogate = 0;
    } else if (charCode >= 0xd800 && charCode <= 0xdbff) {
      previousSurrogate = charCode;
    } else {
      codePoints.push(charCode.toString(16));
    }
  }
  return codePoints.join("-");
}

export function twemojiUrl(emoji) {
  // Twemoji drops the FE0F variation selector from single-codepoint emoji,
  // but keeps it for ZWJ sequences (combined emoji like professions/families).
  const normalized = emoji.includes("\u200d") ? emoji : emoji.replace(/\ufe0f/g, "");
  return `${TWEMOJI_BASE}${toCodePoint(normalized)}.svg`;
}