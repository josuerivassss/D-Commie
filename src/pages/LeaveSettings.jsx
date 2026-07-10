import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../api";
import Toggle from "../components/Toggle";
import { LIMITS } from "../validation";

export default function LeaveSettings() {
  const { guild } = useOutletContext();
  const [config, setConfig] = useState({ enabled: false, channel: "", message: "" });
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    Promise.all([api.getGuildConfig(guild.id), api.getGuildChannels(guild.id)])
      .then(([doc, ch]) => {
        if (cancelled) return;
        const leave = doc.leave || {};
        setConfig({
          enabled: Boolean(leave.enabled),
          channel: leave.channel ? String(leave.channel) : "",
          message: leave.message || "",
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
      await api.updateGuildConfig(guild.id, {
        leave_enabled: config.enabled,
        leave_channel_id: config.channel ? Number(config.channel) : null,
        leave_message: config.message.slice(0, LIMITS.MESSAGE_MAX),
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
        <h1>Leave</h1>
        <div className="flash error">{loadError}</div>
        <button className="btn btn-outline" onClick={() => window.location.reload()}>
          Retry
        </button>
      </>
    );
  }

  return (
    <>
      <h1>Leave</h1>
      <p className="section-sub">Sent when a member leaves the server.</p>
      {flash && <div className={`flash ${flash.type}`}>{flash.message}</div>}
      <form className="card" onSubmit={handleSubmit}>
        <div className="field toggle-row">
          <label style={{ marginBottom: 0 }}>Enabled</label>
          <Toggle
            checked={config.enabled}
            onChange={(checked) => setConfig({ ...config, enabled: checked })}
            label="Enable leave messages"
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
          <div className="field-label-row">
            <label>Message</label>
            <span className={`char-count ${config.message.length >= LIMITS.MESSAGE_MAX ? "warn" : ""}`}>
              {config.message.length}/{LIMITS.MESSAGE_MAX}
            </span>
          </div>
          <textarea
            maxLength={LIMITS.MESSAGE_MAX}
            placeholder="{user.name} left {guild.name}."
            value={config.message}
            onChange={(e) => setConfig({ ...config, message: e.target.value })}
          />
          <div className="hint">
            Supports the same placeholders as the welcome message, e.g. <code>{"{user.name}"}</code>,{" "}
            <code>{"{guild.name}"}</code>, <code>{"{guild.members}"}</code>.
          </div>
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving\u2026" : "Save changes"}
        </button>
      </form>
    </>
  );
}
