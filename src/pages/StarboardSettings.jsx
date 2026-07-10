import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../api";
import Toggle from "../components/Toggle";
import { LIMITS, clamp } from "../validation";

export default function StarboardSettings() {
  const { guild } = useOutletContext();
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
          channel_id: doc.channel_id ? String(doc.channel_id) : "",
          emoji: doc.emoji || "\u2b50",
          threshold: doc.threshold || 3,
          count_self_stars: Boolean(doc.count_self_stars),
        });
        setChannels(ch);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err.message);
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
        channel_id: config.channel_id ? Number(config.channel_id) : null,
        emoji: config.emoji.trim().slice(0, LIMITS.EMOJI_MAX) || "\u2b50",
        threshold: clamp(config.threshold, LIMITS.THRESHOLD_MIN, LIMITS.THRESHOLD_MAX),
        count_self_stars: config.count_self_stars,
      });
      setFlash({ type: "success", message: "Saved!" });
    } catch (err) {
      setFlash({ type: "error", message: err.message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="section-sub">Loading&hellip;</p>;

  if (loadError) {
    return (
      <>
        <h1>Starboard</h1>
        <div className="flash error">{loadError}</div>
        <button className="btn btn-outline" onClick={() => window.location.reload()}>
          Retry
        </button>
      </>
    );
  }

  const thresholdOutOfRange =
    config.threshold !== "" &&
    (Number(config.threshold) < LIMITS.THRESHOLD_MIN || Number(config.threshold) > LIMITS.THRESHOLD_MAX);

  return (
    <>
      <h1>Starboard</h1>
      <p className="section-sub">Pins community-highlighted messages once they collect enough star reactions.</p>
      {flash && <div className={`flash ${flash.type}`}>{flash.message}</div>}
      <form className="card" onSubmit={handleSubmit}>
        <div className="field toggle-row">
          <label style={{ marginBottom: 0 }}>Enabled</label>
          <Toggle
            checked={config.enabled}
            onChange={(checked) => setConfig({ ...config, enabled: checked })}
            label="Enable starboard"
          />
        </div>
        <div className="field">
          <label>Channel</label>
          <select
            value={config.channel_id}
            onChange={(e) => setConfig({ ...config, channel_id: e.target.value })}
          >
            <option value="">&mdash; Select a channel &mdash;</option>
            {channels.map((c) => (
              <option key={c.id} value={c.id}>
                #{c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <div className="field-label-row">
            <label>Emoji</label>
            <span className={`char-count ${config.emoji.length >= LIMITS.EMOJI_MAX ? "warn" : ""}`}>
              {config.emoji.length}/{LIMITS.EMOJI_MAX}
            </span>
          </div>
          <input
            type="text"
            maxLength={LIMITS.EMOJI_MAX}
            value={config.emoji}
            onChange={(e) => setConfig({ ...config, emoji: e.target.value })}
          />
          <div className="hint">A standard emoji (&#11088;) or a custom server emoji.</div>
        </div>
        <div className="field">
          <label>Star threshold</label>
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
              Must be between {LIMITS.THRESHOLD_MIN} and {LIMITS.THRESHOLD_MAX}.
            </div>
          ) : (
            <div className="hint">Minimum number of stars a message needs to reach the starboard.</div>
          )}
        </div>
        <div className="field toggle-row">
          <label style={{ marginBottom: 0 }}>Allow authors to star their own messages</label>
          <Toggle
            checked={config.count_self_stars}
            onChange={(checked) => setConfig({ ...config, count_self_stars: checked })}
            label="Allow self-stars"
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving\u2026" : "Save changes"}
        </button>
      </form>
    </>
  );
}
