import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api, friendlyErrorMessage } from "../api";
import { useTranslation } from "../context/LocaleContext";
import Toggle from "../components/Toggle";
import EmojiPicker from "../components/EmojiPicker";
import { LIMITS, clamp } from "../validation";

export default function StarboardSettings() {
  const { guild } = useOutletContext();
  const { t } = useTranslation();
  const [config, setConfig] = useState({
    enabled: false,
    channel_id: "",
    emoji: "\u2b50",
    threshold: 3,
    count_self_stars: false,
  });
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    Promise.all([api.getStarboard(guild.id), api.getGuildChannels(guild.id)])
      .then(([doc, ch]) => {
        if (cancelled) return;
        setConfig({
          enabled: Boolean(doc.enabled),
          channel_id: doc.channel_id || "",
          emoji: doc.emoji || "\u2b50",
          threshold: doc.threshold || 3,
          count_self_stars: Boolean(doc.count_self_stars),
        });
        setChannels(ch);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(friendlyErrorMessage(err, t));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [guild.id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setFlash(null);
    try {
      await api.updateStarboard(guild.id, {
        enabled: config.enabled,
        channel_id: config.channel_id || null,
        emoji: config.emoji.slice(0, LIMITS.EMOJI_MAX) || "\u2b50",
        threshold: clamp(config.threshold, LIMITS.THRESHOLD_MIN, LIMITS.THRESHOLD_MAX),
        count_self_stars: config.count_self_stars,
      });
      setFlash({ type: "success", message: t("common.saved") });
    } catch (err) {
      setFlash({ type: "error", message: friendlyErrorMessage(err, t) });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="section-sub">{t("common.loading")}</p>;

  if (loadError) {
    return (
      <>
        <h1>{t("starboard.title")}</h1>
        <div className="flash error">{loadError}</div>
        <button className="btn btn-outline" onClick={() => window.location.reload()}>{t("common.retry")}</button>
      </>
    );
  }

  const thresholdOutOfRange =
    config.threshold !== "" &&
    (Number(config.threshold) < LIMITS.THRESHOLD_MIN || Number(config.threshold) > LIMITS.THRESHOLD_MAX);

  return (
    <>
      <h1>{t("starboard.title")}</h1>
      <p className="section-sub">{t("starboard.subtitle")}</p>
      {flash && <div className={`flash ${flash.type}`}>{flash.message}</div>}
      <form className="card" onSubmit={handleSubmit}>
        <div className="field toggle-row">
          <label style={{ marginBottom: 0 }}>{t("common.enabledLabel")}</label>
          <Toggle
            checked={config.enabled}
            onChange={(checked) => setConfig({ ...config, enabled: checked })}
            label={t("starboard.enableToggle")}
          />
        </div>
        <div className="field">
          <label>{t("common.channelLabel")}</label>
          <select
            value={config.channel_id}
            onChange={(e) => setConfig({ ...config, channel_id: e.target.value })}
          >
            <option value="">{t("common.selectChannel")}</option>
            {channels.map((c) => (
              <option key={c.id} value={c.id}>
                #{c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>{t("starboard.emojiLabel")}</label>
          <EmojiPicker value={config.emoji} onChange={(emoji) => setConfig({ ...config, emoji })} guildId={guild.id} />
          <div className="hint">{t("starboard.emojiHint")}</div>
        </div>
        <div className="field">
          <label>{t("starboard.thresholdLabel")}</label>
          <input
            type="number"
            min={LIMITS.THRESHOLD_MIN}
            max={LIMITS.THRESHOLD_MAX}
            className={thresholdOutOfRange ? "invalid" : ""}
            value={config.threshold}
            onChange={(e) => setConfig({ ...config, threshold: e.target.value })}
            onBlur={(e) =>
              setConfig({ ...config, threshold: clamp(e.target.value, LIMITS.THRESHOLD_MIN, LIMITS.THRESHOLD_MAX) })
            }
          />
          {thresholdOutOfRange ? (
            <div className="error-text">
              {t("starboard.thresholdError", { min: LIMITS.THRESHOLD_MIN, max: LIMITS.THRESHOLD_MAX })}
            </div>
          ) : (
            <div className="hint">{t("starboard.thresholdHint")}</div>
          )}
        </div>
        <div className="field toggle-row">
          <label style={{ marginBottom: 0 }}>{t("starboard.selfStarsLabel")}</label>
          <Toggle
            checked={config.count_self_stars}
            onChange={(checked) => setConfig({ ...config, count_self_stars: checked })}
            label={t("starboard.selfStarsToggle")}
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? t("common.saving") : t("common.saveChanges")}
        </button>
      </form>
    </>
  );
}