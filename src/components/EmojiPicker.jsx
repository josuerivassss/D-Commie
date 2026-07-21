import { useEffect, useMemo, useRef, useState } from "react";
import emojiData from "unicode-emoji-json/data-by-group.json";
import { api, friendlyErrorMessage } from "../api";

const CUSTOM_EMOJI_PATTERN = /^<:(\w+):(\d+)>$/;
const TWEMOJI_BASE = "https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/";
const SEARCH_DEBOUNCE_MS = 150;

// One tab per unicode group, icon = first emoji in that group. Computed
// once at module scope since emojiData never changes at runtime.
const CATEGORIES = emojiData.map((category, index) => ({
  index,
  slug: category.slug,
  name: category.name,
  icon: category.emojis[0]?.emoji,
}));

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
  return `${TWEMOJI_BASE}${toCodePoint(normalized)}.svg`;
}

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

function TwemojiImage({ emoji, className, alt }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className={className}>{emoji}</span>;
  return (
    <img
      className={className}
      src={twemojiUrl(emoji)}
      alt={alt || emoji}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
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

export default function EmojiPicker({ value, onChange, guildId, renderTrigger }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("standard");
  const [activeCategory, setActiveCategory] = useState(0);
  // Categories the user has already opened stay mounted (hidden via CSS,
  // not removed from the DOM) so switching back is instant -- no re-decode,
  // no re-fetch, no layout recomputation.
  const [visitedCategories, setVisitedCategories] = useState(() => new Set([0]));
  const [search, setSearch] = useState("");
  const [customEmojis, setCustomEmojis] = useState(null);
  const [customLoading, setCustomLoading] = useState(false);
  const [customError, setCustomError] = useState(null);
  const containerRef = useRef(null);
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

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

  function selectCategory(index) {
    setActiveCategory(index);
    setVisitedCategories((prev) => (prev.has(index) ? prev : new Set(prev).add(index)));
  }

  function selectStandard(emoji) {
    onChange(emoji);
    setOpen(false);
  }

  function selectCustom(emoji) {
    onChange(`<:${emoji.name}:${emoji.id}>`);
    setOpen(false);
  }

  const query = debouncedSearch.trim().toLowerCase();

  // Only when searching do we scan every category -- otherwise just the
  // visited categories stay mounted (see visitedCategories above).
  const searchResults = useMemo(() => {
    if (!query) return null;
    const results = [];
    for (const category of emojiData) {
      for (const item of category.emojis) {
        if (item.name.toLowerCase().includes(query) || item.slug.includes(query)) results.push(item);
      }
    }
    return results;
  }, [query]);

  const filteredCustom = useMemo(
    () => (customEmojis || []).filter((e) => !query || e.name.toLowerCase().includes(query)),
    [customEmojis, query]
  );

  return (
    
    <div className="emoji-picker" ref={containerRef}>
      <button type="button" className="emoji-picker-trigger" onClick={togglePanel}>
        {renderTrigger ? renderTrigger() : <EmojiPreview value={value} />}
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
          <div className="emoji-picker-search-row">
            <input
              type="text"
              className="emoji-picker-search"
              placeholder="Buscar emoji..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {tab === "standard" && !query && (
            <div className="emoji-picker-categories">
              {CATEGORIES.map((category) => (
                <button
                  type="button"
                  key={category.slug}
                  className={`emoji-picker-category-btn ${activeCategory === category.index ? "active" : ""}`}
                  title={category.name}
                  onClick={() => selectCategory(category.index)}
                >
                  {category.icon && <TwemojiImage emoji={category.icon} className="emoji-picker-category-icon" />}
                </button>
              ))}
            </div>
          )}
          <div className="emoji-picker-grid-wrap">
            {tab === "standard" && query && (
              <div className="emoji-picker-grid">
                {searchResults.length === 0 && <p className="hint emoji-picker-status">Sin resultados.</p>}
                {searchResults.map((item) => (
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
            )}
            {tab === "standard" &&
              !query &&
              emojiData.map((category, index) =>
                visitedCategories.has(index) ? (
                  <div
                    key={category.slug}
                    className="emoji-picker-group"
                    style={{ display: activeCategory === index ? "block" : "none" }}
                  >
                    <div className="emoji-picker-group-title">{category.name}</div>
                    <div className="emoji-picker-grid">
                      {category.emojis.map((item) => (
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
                ) : null
              )}
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
                    <img className="emoji-picker-img" src={emoji.url} alt={emoji.name} loading="lazy" decoding="async" />
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