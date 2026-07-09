import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../api";

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
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    Promise.all([api.getStarboard(guild.id), api.getGuildChannels(guild.id)]).then(([doc, ch]) => {
      setConfig({
        enabled: Boolean(doc.enabled),
        channel_id: doc.channel_id ? String(doc.channel_id) : "",
        emoji: doc.emoji || "\u2b50",
        threshold: doc.threshold || 3,
        count_self_stars: Boolean(doc.count_self_stars),
      });
      setChannels(ch);
      setLoading(false);
    });
  }, [guild.id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setFlash(null);
    try {
      await api.updateStarboard(guild.id, {
        enabled: config.enabled,
        channel_id: config.channel_id ? Number(config.channel_id) : null,
        emoji: config.emoji.trim() || "\u2b50",
        threshold: Math.min(Math.max(Number(config.threshold) || 1, 1), 500),
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

  return (
    <>
      <h1>Starboard</h1>
      <p className="section-sub">Pins community-highlighted messages once they collect enough star reactions.</p>
      {flash && <div className={`flash ${flash.type}`}>{flash.message}</div>}
      <form className="card" onSubmit={handleSubmit}>
        <div className="field toggle-row">
          <label style={{ marginBottom: 0 }}>Enabled</label>
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
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
          <label>Emoji</label>
          <input
            type="text"
            maxLength={60}
            value={config.emoji}
            onChange={(e) => setConfig({ ...config, emoji: e.target.value })}
          />
          <div className="hint">A standard emoji (&#11088;) or a custom server emoji.</div>
        </div>
        <div className="field">
          <label>Star threshold</label>
          <input
            type="number"
            min={1}
            max={500}
            value={config.threshold}
            onChange={(e) => setConfig({ ...config, threshold: e.target.value })}
          />
          <div className="hint">Minimum number of stars a message needs to reach the starboard.</div>
        </div>
        <div className="field toggle-row">
          <label style={{ marginBottom: 0 }}>Allow authors to star their own messages</label>
          <input
            type="checkbox"
            checked={config.count_self_stars}
            onChange={(e) => setConfig({ ...config, count_self_stars: e.target.checked })}
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving\u2026" : "Save changes"}
        </button>
      </form>
    </>
  );
}
