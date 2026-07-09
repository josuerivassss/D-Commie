import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../api";

export default function WelcomeSettings() {
  const { guild } = useOutletContext();
  const [config, setConfig] = useState({ enabled: false, channel: "", message: "" });
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    Promise.all([api.getGuildConfig(guild.id), api.getGuildChannels(guild.id)]).then(([doc, ch]) => {
      const welcome = doc.welcome || {};
      setConfig({
        enabled: Boolean(welcome.enabled),
        channel: welcome.channel ? String(welcome.channel) : "",
        message: welcome.message || "",
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
      await api.updateGuildConfig(guild.id, {
        welcome_enabled: config.enabled,
        welcome_channel_id: config.channel ? Number(config.channel) : null,
        welcome_message: config.message,
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
      <h1>Welcome</h1>
      <p className="section-sub">Sent when a new member joins the server.</p>
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
          <select value={config.channel} onChange={(e) => setConfig({ ...config, channel: e.target.value })}>
            <option value="">&mdash; Select a channel &mdash;</option>
            {channels.map((c) => (
              <option key={c.id} value={c.id}>
                #{c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Message</label>
          <textarea
            placeholder="Welcome {user.mention} to {guild.name}!"
            value={config.message}
            onChange={(e) => setConfig({ ...config, message: e.target.value })}
          />
          <div className="hint">
            Supports placeholders like <code>{"{user.mention}"}</code>, <code>{"{user.name}"}</code>,{" "}
            <code>{"{guild.name}"}</code>, <code>{"{guild.members}"}</code>, and embed builders like{" "}
            <code>{"{embed.title:...}"}</code>.
          </div>
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving\u2026" : "Save changes"}
        </button>
      </form>
    </>
  );
}
