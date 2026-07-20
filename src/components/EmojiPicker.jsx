import { useEffect, useRef, useState } from "react";
import emojiData from "unicode-emoji-json/data-by-group.json";
import { api, friendlyErrorMessage } from "../api";

const CUSTOM_EMOJI_PATTERN = /^<:(\w+):(\d+)>$/;
const TWEMOJI_BASE = "https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/";

// Same conversion Twemoji itself uses to derive asset filenames from a
// unicode emoji string -- keeps the dashboard's glyphs visually identical
// to what the bot renders (see ImagesManager.EMOJI_CDN in the bot repo).
function toCodePoint(unicodeSurrogates) {
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

function twemojiUrl(emoji) {
  // Twemoji drops the FE0F variation selector from single-codepoint emoji,
  // but keeps it for ZWJ sequences (combined emoji like professions/families).
  const normalized = emoji.includes("\u200d") ? emoji : emoji.replace(/\ufe0f/g, "");
  return `${TWEMOJI_BASE}${toCodePoint(normalized)}.png`;
}

function TwemojiImage({ emoji, className, alt }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className={className}>{emoji}</span>;
  return <img className={className} src={twemojiUrl(emoji)} alt={alt || emoji} onError={() => setFailed(true)} />;
}

function EmojiPreview({ value }) {
  const custom = CUSTOM_EMOJI_PATTERN.exec(value || "");
  if (custom) {
    return (
      <img
        className="emoji-preview-img"
        src={`https://cdn.discordapp.com/emojis/${custom[2]}.png`}
        alt={custom[1]}
      />
    );
  }
  return <TwemojiImage emoji={value || "\u2b50"} className="emoji-preview-img" />;
}

export default function EmojiPicker({ value, onChange, guildId }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("standard");
  const [search, setSearch] = useState("");
  const [customEmojis, setCustomEmojis] = useState(null);
  const [customLoading, setCustomLoading] = useState(false);
  const [customError, setCustomError] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    function handleEscape(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function loadCustomEmojis() {
    setCustomLoading(true);
    setCustomError(null);
    try {
      setCustomEmojis(await api.getGuildEmojis(guildId));
    } catch (err) {
      setCustomError(friendlyErrorMessage(err));
    } finally {
      setCustomLoading(false);
    }
  }

  function togglePanel() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (tab === "custom" && customEmojis === null) loadCustomEmojis();
  }

  function switchTab(nextTab) {
    setTab(nextTab);
    setSearch("");
    if (nextTab === "custom" && customEmojis === null) loadCustomEmojis();
  }

  function selectStandard(emoji) {
    onChange(emoji);
    setOpen(false);
  }

  function selectCustom(emoji) {
    onChange(`<:${emoji.name}:${emoji.id}>`);
    setOpen(false);
  }

  const query = search.trim().toLowerCase();
  const filteredGroups = Object.entries(emojiData)
    .map(([group, items]) => [
      group,
      query ? items.filter((item) => item.name.toLowerCase().includes(query) || item.slug.includes(query)) : items,
    ])
    .filter(([, items]) => items.length > 0);
  const filteredCustom = (customEmojis || []).filter((e) => !query || e.name.toLowerCase().includes(query));

  return (
    <div className="emoji-picker" ref={containerRef}>
      <button type="button" className="emoji-picker-trigger" onClick={togglePanel}>
        <EmojiPreview value={value} />
      </button>
      {open && (
        <div className="emoji-picker-panel">
          <div className="emoji-picker-tabs">
            <button
              type="button"
              className={`emoji-picker-tab ${tab === "standard" ? "active" : ""}`}
              onClick={() => switchTab("standard")}
            >
              Estándar
            </button>
            <button
              type="button"
              className={`emoji-picker-tab ${tab === "custom" ? "active" : ""}`}
              onClick={() => switchTab("custom")}
            >
              Del servidor
            </button>
          </div>
          <input
            type="text"
            className="emoji-picker-search"
            placeholder="Buscar emoji..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="emoji-picker-grid-wrap">
            {tab === "standard" &&
              filteredGroups.map(([group, items]) => (
                <div key={group} className="emoji-picker-group">
                  <div className="emoji-picker-group-title">{group}</div>
                  <div className="emoji-picker-grid">
                    {items.map((item) => (
                      <button
                        type="button"
                        key={item.slug}
                        className="emoji-picker-cell"
                        title={item.name}
                        onClick={() => selectStandard(item.emoji)}
                      >
                        <TwemojiImage emoji={item.emoji} className="emoji-picker-img" alt={item.name} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            {tab === "custom" && customLoading && <p className="hint emoji-picker-status">Cargando emojis&hellip;</p>}
            {tab === "custom" && customError && <p className="error-text emoji-picker-status">{customError}</p>}
            {tab === "custom" && !customLoading && !customError && filteredCustom.length === 0 && (
              <p className="hint emoji-picker-status">No hay emojis personalizados disponibles para todos.</p>
            )}
            {tab === "custom" && !customLoading && !customError && filteredCustom.length > 0 && (
              <div className="emoji-picker-grid">
                {filteredCustom.map((emoji) => (
                  <button
                    type="button"
                    key={emoji.id}
                    className="emoji-picker-cell"
                    title={emoji.name}
                    onClick={() => selectCustom(emoji)}
                  >
                    <img className="emoji-picker-img" src={emoji.url} alt={emoji.name} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}