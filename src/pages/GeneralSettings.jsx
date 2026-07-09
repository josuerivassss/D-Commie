import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../api";

export default function GeneralSettings() {
  const { guild } = useOutletContext();
  const [config, setConfig] = useState({ prefix: "", language: "en" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    api.getGuildConfig(guild.id).then((doc) => {
      setConfig({ prefix: doc.prefix || "", language: doc.language || "en" });
      setLoading(false);
    });
  }, [guild.id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setFlash(null);
    try {
      const body = { language: config.language };
      if (config.prefix.trim()) body.prefix = config.prefix.trim().slice(0, 10);
      await api.updateGuildConfig(guild.id, body);
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
      <h1>General</h1>
      <p className="section-sub">Command prefix and language.</p>
      {flash && <div className={`flash ${flash.type}`}>{flash.message}</div>}
      <form className="card" onSubmit={handleSubmit}>
        <div className="field">
          <label>Command prefix</label>
          <input
            type="text"
            maxLength={10}
            placeholder="c!"
            value={config.prefix}
            onChange={(e) => setConfig({ ...config, prefix: e.target.value })}
          />
          <div className="hint">
            Used alongside slash commands, e.g. <code>c!ping</code>. Leave blank to use the default.
          </div>
        </div>
        <div className="field">
          <label>Language</label>
          <select value={config.language} onChange={(e) => setConfig({ ...config, language: e.target.value })}>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving\u2026" : "Save changes"}
        </button>
      </form>
    </>
  );
}
