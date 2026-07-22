import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api, ApiError, friendlyErrorMessage } from "../api";
import { useTranslation } from "../context/LocaleContext";
import { EMBED_LIMITS, embedCharacterCount, isValidUrl, validateEmbedPayload } from "../validation";
import { useUnsavedChangesGuard } from "../context/UnsavedChangesContext";
import EmbedPreview from "../components/EmbedPreview";
import EmojiPicker from "../components/EmojiPicker";
import Toggle from "../components/Toggle";

const DEFAULT_COLOR = 0xf1574b;

function cloneEmptyEmbed() {
  return {
    title: "", description: "", url: "", color: DEFAULT_COLOR, timestamp: null,
    image: "", thumbnail: "",
    author: { name: "", url: "", icon_url: "" },
    footer: { text: "", icon_url: "" },
    fields: [],
  };
}

function isEmbedEmpty(embed) {
  return !embed.title && !embed.description && !embed.image && !embed.thumbnail &&
    !embed.author.name && !embed.footer.text && embed.fields.length === 0;
}

function toDiscordShape(embed) {
  const payload = {};
  if (embed.title) payload.title = embed.title;
  if (embed.description) payload.description = embed.description;
  if (embed.url) payload.url = embed.url;
  if (embed.color != null) payload.color = embed.color;
  if (embed.timestamp) payload.timestamp = embed.timestamp;
  if (embed.image) payload.image = embed.image;
  if (embed.thumbnail) payload.thumbnail = embed.thumbnail;
  if (embed.author?.name || embed.author?.url || embed.author?.icon_url) {
    payload.author = {};
    if (embed.author.name) payload.author.name = embed.author.name;
    if (embed.author.url) payload.author.url = embed.author.url;
    if (embed.author.icon_url) payload.author.icon_url = embed.author.icon_url;
  }
  if (embed.footer?.text || embed.footer?.icon_url) {
    payload.footer = {};
    if (embed.footer.text) payload.footer.text = embed.footer.text;
    if (embed.footer.icon_url) payload.footer.icon_url = embed.footer.icon_url;
  }
  if (embed.fields?.length) payload.fields = embed.fields;
  return payload;
}

function fromDiscordShape(raw) {
  return {
    title: raw.title || "",
    description: raw.description || "",
    url: raw.url || "",
    color: typeof raw.color === "number" ? raw.color : DEFAULT_COLOR,
    timestamp: raw.timestamp || null,
    image: raw.image?.url || raw.image || "",
    thumbnail: raw.thumbnail?.url || raw.thumbnail || "",
    author: { name: raw.author?.name || "", url: raw.author?.url || "", icon_url: raw.author?.icon_url || "" },
    footer: { text: raw.footer?.text || "", icon_url: raw.footer?.icon_url || "" },
    fields: Array.isArray(raw.fields)
      ? raw.fields.map((f) => ({ name: f.name || "", value: f.value || "", inline: Boolean(f.inline) }))
      : [],
  };
}

function normalizeImportedPayload(parsed) {
  if (Array.isArray(parsed)) return { embeds: parsed };
  if (parsed && typeof parsed === "object" && !parsed.embeds && (parsed.title || parsed.description || parsed.fields || parsed.color !== undefined)) {
    return { embeds: [parsed], content: parsed.content };
  }
  return parsed;
}

function buildSnapshot(content, embeds, channelId, reactions) {
  return JSON.stringify({ content, embeds, channelId, reactions });
}

function intToHex(n) {
  return "#" + n.toString(16).padStart(6, "0");
}

function hexToInt(hex) {
  return parseInt(hex.replace("#", ""), 16);
}

function embedHasInvalidUrl(embed) {
  return Boolean(
    (embed.url && !isValidUrl(embed.url)) ||
    (embed.image && !isValidUrl(embed.image)) ||
    (embed.thumbnail && !isValidUrl(embed.thumbnail)) ||
    (embed.author?.url && !isValidUrl(embed.author.url)) ||
    (embed.author?.icon_url && !isValidUrl(embed.author.icon_url)) ||
    (embed.footer?.icon_url && !isValidUrl(embed.footer.icon_url))
  );
}

function UrlField({ value, placeholder, onChange }) {
  const { t } = useTranslation();
  const invalid = value && !isValidUrl(value);
  return (
    <div>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        className={invalid ? "invalid" : ""}
        onChange={(e) => onChange(e.target.value)}
      />
      {invalid && <div className="error-text">{t("embeds.invalidUrl")}</div>}
    </div>
  );
}

function ReactionChip({ value, onRemove }) {
  const custom = /^<a?:(\w+):(\d+)>$/.exec(value);
  return (
    <span className="reaction-chip">
      {custom ? (
        <img className="reaction-chip-img" src={`https://cdn.discordapp.com/emojis/${custom[2]}.png`} alt={custom[1]} />
      ) : (
        <span className="reaction-chip-glyph">{value}</span>
      )}
      <button type="button" onClick={onRemove} aria-label="Remove reaction">×</button>
    </span>
  );
}

export default function EmbedSender() {
  const { guild } = useOutletContext();
  const { t } = useTranslation();
  const { setGuard } = useUnsavedChangesGuard();

  const [content, setContent] = useState("");
  const [embeds, setEmbeds] = useState([cloneEmptyEmbed()]);
  const [activeEmbedIndex, setActiveEmbedIndex] = useState(0);
  const [channelId, setChannelId] = useState("");
  const [channels, setChannels] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [sending, setSending] = useState(false);
  const [sendFlash, setSendFlash] = useState(null);
  const [importError, setImportError] = useState(null);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const fileInputRef = useRef(null);

  const embed = embeds[activeEmbedIndex];
  const isDirty = savedSnapshot !== null && buildSnapshot(content, embeds, channelId, reactions) !== savedSnapshot;
  const totalCharacters = embeds.reduce((sum, e) => sum + embedCharacterCount(e), 0);
  const hasInvalidUrls = embeds.some(embedHasInvalidUrl);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    Promise.all([api.getSendableChannels(guild.id), api.getEmbedCooldown(guild.id)])
      .then(([ch, cd]) => {
        if (cancelled) return;
        setChannels(ch);
        setCooldownRemaining(Math.ceil(cd.seconds_remaining));
        setSavedSnapshot(buildSnapshot("", [cloneEmptyEmbed()], "", []));
      })
      .catch((err) => { if (!cancelled) setLoadError(friendlyErrorMessage(err, t)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [guild.id]);

  useEffect(() => {
    const timer = setInterval(() => setCooldownRemaining((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setGuard(isDirty ? "Tienes cambios sin enviar. ¿Deseas salir de todas formas?" : null);
    return () => setGuard(null);
  }, [isDirty, setGuard]);

  useEffect(() => {
    function handleBeforeUnload(e) {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  function updateActiveEmbed(patch) {
    setEmbeds((prev) => prev.map((e, i) => (i === activeEmbedIndex ? { ...e, ...patch } : e)));
  }

  function updateActiveEmbedNested(section, patch) {
    setEmbeds((prev) => prev.map((e, i) => (i === activeEmbedIndex ? { ...e, [section]: { ...e[section], ...patch } } : e)));
  }

  function addEmbed() {
    if (embeds.length >= EMBED_LIMITS.EMBEDS_MAX) return;
    setEmbeds((prev) => [...prev, cloneEmptyEmbed()]);
    setActiveEmbedIndex(embeds.length);
  }

  function removeEmbed(index) {
    setEmbeds((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length ? next : [cloneEmptyEmbed()];
    });
    setActiveEmbedIndex((prev) => Math.max(0, Math.min(prev, embeds.length - 2)));
  }

  function addField() {
    if (embed.fields.length >= EMBED_LIMITS.FIELDS_MAX) return;
    updateActiveEmbed({ fields: [...embed.fields, { name: "", value: "", inline: false }] });
  }

  function updateField(fieldIndex, patch) {
    updateActiveEmbed({ fields: embed.fields.map((f, i) => (i === fieldIndex ? { ...f, ...patch } : f)) });
  }

  function removeField(fieldIndex) {
    updateActiveEmbed({ fields: embed.fields.filter((_, i) => i !== fieldIndex) });
  }

  function addReaction(value) {
    if (reactions.length >= EMBED_LIMITS.REACTIONS_MAX || reactions.includes(value)) return;
    setReactions((prev) => [...prev, value]);
  }

  function removeReaction(value) {
    setReactions((prev) => prev.filter((r) => r !== value));
  }

  function handleExport() {
    const payload = { content: content || undefined, embeds: embeds.map(toDiscordShape), reactions };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commie-embed-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      let parsed;
      try {
        parsed = JSON.parse(reader.result);
      } catch {
        setImportError({ title: t("embeds.corruptedJsonTitle"), details: [t("validation.parseError")] });
        return;
      }
      const normalized = normalizeImportedPayload(parsed);
      const errors = validateEmbedPayload(normalized, t);
      if (errors.length > 0) {
        setImportError({ title: t("embeds.corruptedJsonTitle"), details: errors });
        return;
      }
      setContent(normalized.content || "");
      setEmbeds(normalized.embeds.map(fromDiscordShape));
      setActiveEmbedIndex(0);
      setReactions(Array.isArray(normalized.reactions) ? normalized.reactions : []);
    };
    reader.onerror = () => setImportError({ title: t("embeds.corruptedJsonTitle"), details: [t("validation.readError")] });
    reader.readAsText(file);
  }

  async function handleSend() {
    const nonEmptyEmbeds = embeds.filter((e) => !isEmbedEmpty(e)).map(toDiscordShape);
    if (nonEmptyEmbeds.length === 0 && !content.trim()) {
      setSendFlash({ type: "error", message: t("embeds.emptyEmbedError") });
      return;
    }
    setSending(true);
    setSendFlash(null);
    try {
      const result = await api.sendEmbed(guild.id, {
        channel_id: channelId,
        content: content || null,
        embeds: nonEmptyEmbeds,
        reactions,
      });
      setSendFlash({
        type: "success",
        message: result.failed_reactions?.length
          ? t("embeds.sentPartial", { count: result.failed_reactions.length })
          : t("embeds.sentSuccess"),
      });
      setSavedSnapshot(buildSnapshot(content, embeds, channelId, reactions));
      const cooldown = await api.getEmbedCooldown(guild.id);
      setCooldownRemaining(Math.ceil(cooldown.seconds_remaining));
    } catch (err) {
      if (err instanceof ApiError && err.status === 429 && err.data?.seconds_remaining) {
        setCooldownRemaining(Math.ceil(err.data.seconds_remaining));
      }
      setSendFlash({ type: "error", message: friendlyErrorMessage(err, t) });
    } finally {
      setSending(false);
    }
  }

  if (loading) return <p className="section-sub">{t("common.loading")}</p>;

  if (loadError) {
    return (
      <>
        <h1>{t("embeds.title")}</h1>
        <div className="flash error">{loadError}</div>
        <button className="btn btn-outline" onClick={() => window.location.reload()}>{t("common.retry")}</button>
      </>
    );
  }

  return (
    <>
      <h1>{t("embeds.title")}</h1>
      <p className="section-sub">{t("embeds.subtitle")}</p>

      {cooldownRemaining > 0 && (
        <div className="flash cooldown">{t("embeds.cooldownActive", { seconds: cooldownRemaining })}</div>
      )}
      {sendFlash && <div className={`flash ${sendFlash.type}`}>{sendFlash.message}</div>}

      <div className="embed-builder-layout">
        <div className="embed-builder-form">
          <div className="card">
            <div className="field">
              <div className="field-label-row">
                <label>{t("embeds.contentLabel")}</label>
                <span className={`char-count ${content.length >= EMBED_LIMITS.CONTENT_MAX ? "warn" : ""}`}>
                  {content.length}/{EMBED_LIMITS.CONTENT_MAX}
                </span>
              </div>
              <textarea maxLength={EMBED_LIMITS.CONTENT_MAX} value={content} onChange={(e) => setContent(e.target.value)} />
            </div>
          </div>

          <div className="card">
            <div className="embed-tabs">
              {embeds.map((_, index) => (
                <button
                  type="button"
                  key={index}
                  className={`embed-tab ${activeEmbedIndex === index ? "active" : ""}`}
                  onClick={() => setActiveEmbedIndex(index)}
                >
                  {t("embeds.embedTabLabel", { n: index + 1 })}
                  {embeds.length > 1 && (
                    <span className="embed-tab-remove" onClick={(e) => { e.stopPropagation(); removeEmbed(index); }}>×</span>
                  )}
                </button>
              ))}
              <button type="button" className="embed-tab-add" onClick={addEmbed} disabled={embeds.length >= EMBED_LIMITS.EMBEDS_MAX}>
                {t("embeds.addEmbed")}
              </button>
            </div>

            <div className="embed-section-title">{t("embeds.sectionContent")}</div>

            <div className="field">
              <div className="field-label-row">
                <label>{t("embeds.titleLabel")}</label>
                <span className={`char-count ${embed.title.length >= EMBED_LIMITS.TITLE_MAX ? "warn" : ""}`}>
                  {embed.title.length}/{EMBED_LIMITS.TITLE_MAX}
                </span>
              </div>
              <input type="text" maxLength={EMBED_LIMITS.TITLE_MAX} value={embed.title} onChange={(e) => updateActiveEmbed({ title: e.target.value })} />
            </div>

            <div className="field">
              <label>{t("embeds.titleUrlLabel")}</label>
              <UrlField value={embed.url} placeholder="https://..." onChange={(v) => updateActiveEmbed({ url: v })} />
            </div>

            <div className="field">
              <div className="field-label-row">
                <label>{t("embeds.descriptionLabel")}</label>
                <span className={`char-count ${embed.description.length >= EMBED_LIMITS.DESCRIPTION_MAX ? "warn" : ""}`}>
                  {embed.description.length}/{EMBED_LIMITS.DESCRIPTION_MAX}
                </span>
              </div>
              <textarea maxLength={EMBED_LIMITS.DESCRIPTION_MAX} value={embed.description} onChange={(e) => updateActiveEmbed({ description: e.target.value })} />
              <div className="hint">{t("embeds.descriptionHint")}</div>
            </div>

            <div className="embed-section-title">{t("embeds.sectionAppearance")}</div>

            <div className="field">
              <label>{t("embeds.colorLabel")}</label>
              <div className="embed-color-row">
                <input type="color" value={embed.color != null ? intToHex(embed.color) : "#2b2d31"} onChange={(e) => updateActiveEmbed({ color: hexToInt(e.target.value) })} />
                <input
                  type="text"
                  className="embed-color-hex"
                  placeholder="#f1574b"
                  value={embed.color != null ? intToHex(embed.color) : ""}
                  onChange={(e) => {
                    const hex = e.target.value.trim();
                    if (/^#?[0-9a-fA-F]{6}$/.test(hex)) updateActiveEmbed({ color: hexToInt(hex) });
                  }}
                />
                {embed.color != null && (
                  <button type="button" className="btn btn-outline" onClick={() => updateActiveEmbed({ color: null })}>{t("embeds.removeColor")}</button>
                )}
              </div>
            </div>

            <div className="field toggle-row">
              <label style={{ marginBottom: 0 }}>{t("embeds.timestampToggle")}</label>
              <Toggle checked={Boolean(embed.timestamp)} onChange={(checked) => updateActiveEmbed({ timestamp: checked ? new Date().toISOString() : null })} />
            </div>

            <details className="embed-collapsible" key={`images-${activeEmbedIndex}`} open={Boolean(embed.image || embed.thumbnail)}>
              <summary>{t("embeds.imagesSection")}</summary>
              <div className="embed-collapsible-body">
                <div className="field">
                  <label>{t("embeds.imageLabel")}</label>
                  <UrlField value={embed.image} placeholder="https://..." onChange={(v) => updateActiveEmbed({ image: v })} />
                </div>
                <div className="field">
                  <label>{t("embeds.thumbnailLabel")}</label>
                  <UrlField value={embed.thumbnail} placeholder="https://..." onChange={(v) => updateActiveEmbed({ thumbnail: v })} />
                </div>
              </div>
            </details>

            <details className="embed-collapsible" key={`author-${activeEmbedIndex}`} open={Boolean(embed.author.name)}>
              <summary>{t("embeds.authorSection")}</summary>
              <div className="embed-collapsible-body">
                <input type="text" placeholder={t("embeds.authorNamePlaceholder")} maxLength={EMBED_LIMITS.AUTHOR_NAME_MAX} value={embed.author.name} onChange={(e) => updateActiveEmbedNested("author", { name: e.target.value })} />
                <UrlField value={embed.author.url} placeholder={t("embeds.authorUrlPlaceholder")} onChange={(v) => updateActiveEmbedNested("author", { url: v })} />
                <UrlField value={embed.author.icon_url} placeholder={t("embeds.authorIconPlaceholder")} onChange={(v) => updateActiveEmbedNested("author", { icon_url: v })} />
              </div>
            </details>

            <details className="embed-collapsible" key={`footer-${activeEmbedIndex}`} open={Boolean(embed.footer.text)}>
              <summary>{t("embeds.footerSection")}</summary>
              <div className="embed-collapsible-body">
                <input type="text" placeholder={t("embeds.footerTextPlaceholder")} maxLength={EMBED_LIMITS.FOOTER_TEXT_MAX} value={embed.footer.text} onChange={(e) => updateActiveEmbedNested("footer", { text: e.target.value })} />
                <UrlField value={embed.footer.icon_url} placeholder={t("embeds.footerIconPlaceholder")} onChange={(v) => updateActiveEmbedNested("footer", { icon_url: v })} />
              </div>
            </details>

            <div className="embed-section-title">{t("embeds.fieldsSection")} ({embed.fields.length}/{EMBED_LIMITS.FIELDS_MAX})</div>

            {embed.fields.map((field, index) => (
              <div key={index} className="embed-field-card">
                <div className="embed-field-inputs">
                  <input type="text" placeholder={t("embeds.fieldNamePlaceholder")} maxLength={EMBED_LIMITS.FIELD_NAME_MAX} value={field.name} onChange={(e) => updateField(index, { name: e.target.value })} />
                  <input type="text" placeholder={t("embeds.fieldValuePlaceholder")} maxLength={EMBED_LIMITS.FIELD_VALUE_MAX} value={field.value} onChange={(e) => updateField(index, { value: e.target.value })} />
                </div>
                <div className="embed-field-controls">
                  <label className="embed-field-inline-toggle">
                    <input type="checkbox" checked={field.inline} onChange={(e) => updateField(index, { inline: e.target.checked })} /> {t("embeds.inlineLabel")}
                  </label>
                  <button type="button" className="btn btn-outline" onClick={() => removeField(index)}>{t("embeds.removeField")}</button>
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-outline" onClick={addField} disabled={embed.fields.length >= EMBED_LIMITS.FIELDS_MAX}>
              {t("embeds.addField")}
            </button>
          </div>

          <div className="card">
            <div className="embed-section-title">{t("embeds.sectionSend")}</div>

            <div className="field">
              <label>{t("embeds.reactionsLabel")} ({reactions.length}/{EMBED_LIMITS.REACTIONS_MAX})</label>
              <div className="reactions-row">
                {reactions.map((r) => (
                  <ReactionChip key={r} value={r} onRemove={() => removeReaction(r)} />
                ))}
                {reactions.length < EMBED_LIMITS.REACTIONS_MAX && (
                  <EmojiPicker value="" guildId={guild.id} onChange={addReaction} renderTrigger={() => <span className="emoji-picker-add-icon">+</span>} />
                )}
              </div>
            </div>

            <div className="field">
              <label>{t("common.channelLabel")}</label>
              <select value={channelId} onChange={(e) => setChannelId(e.target.value)}>
                <option value="">{t("common.selectChannel")}</option>
                {channels.map((c) => (
                  <option key={c.id} value={c.id} disabled={!c.can_send}>
                    #{c.name}{!c.can_send ? t("common.noPermissionsSuffix") : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="embed-actions-row">
              <button type="button" className="btn btn-outline" onClick={handleExport}>{t("embeds.exportJson")}</button>
              <button type="button" className="btn btn-outline" onClick={() => fileInputRef.current?.click()}>{t("embeds.importJson")}</button>
              <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={handleImportFile} />
              <span className={`char-count ${totalCharacters > EMBED_LIMITS.TOTAL_CHARACTERS_MAX ? "warn" : ""}`}>
                {t("embeds.totalCharacters")}: {totalCharacters}/{EMBED_LIMITS.TOTAL_CHARACTERS_MAX}
              </span>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-wide"
              disabled={!channelId || sending || cooldownRemaining > 0 || hasInvalidUrls}
              onClick={handleSend}
            >
              {sending
                ? t("embeds.sending")
                : cooldownRemaining > 0
                ? t("embeds.waitSeconds", { seconds: cooldownRemaining })
                : hasInvalidUrls
                ? t("embeds.fixInvalidUrls")
                : t("embeds.sendButton")}
            </button>
          </div>
        </div>

        <div className="embed-builder-preview-pane">
          <EmbedPreview content={content} embeds={embeds} />
        </div>
      </div>

      {importError && (
        <div className="modal-overlay" onClick={() => setImportError(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>{importError.title}</h3>
            <ul className="modal-error-list">
              {importError.details.map((detail, index) => <li key={index}>{detail}</li>)}
            </ul>
            <button type="button" className="btn btn-primary" onClick={() => setImportError(null)}>{t("embeds.close")}</button>
          </div>
        </div>
      )}
    </>
  );
}