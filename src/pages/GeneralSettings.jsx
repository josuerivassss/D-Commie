import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../api";
import { LIMITS, LANGUAGES } from "../validation";

export default function GeneralSettings() {
  const { guild } = useOutletContext();
  const [config, setConfig] = useState({ prefix: "", language: "en" });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    api
      .getGuildConfig(guild.id)
      .then((doc) => {
        if (cancelled) return;
        setConfig({ prefix: doc.prefix || "", language: doc.language || "en" });
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
      // Always send prefix (even empty) so clearing the field actually
      // resets it server-side, instead of the old value silently sticking.
      await api.updateGuildConfig(guild.id, {
        language: config.language,
        prefix: config.prefix.trim().slice(0, LIMITS.PREFIX_MAX),
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
        <h1>General</h1>
        <div className="flash error">{loadError}</div>
        <button className="btn btn-outline" onClick={() => window.location.reload()}>
          Retry
        </button>
      </>
    );
  }

  return (
    <>
      <h1>General</h1>
      <p className="section-sub">Command prefix and language.</p>
      {flash && <div className={`flash ${flash.type}`}>{flash.message}</div>}
      <form className="card" onSubmit={handleSubmit}>
        <div className="field">
          <div className="field-label-row">
            <label>Command prefix</label>
            <span className={`char-count ${config.prefix.length >= LIMITS.PREFIX_MAX ? "warn" : ""}`}>
              {config.prefix.length}/{LIMITS.PREFIX_MAX}
            </span>
          </div>
          <input
            type="text"
            maxLength={LIMITS.PREFIX_MAX}
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
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.label}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving\u2026" : "Save changes"}
        </button>
      </form>
    </>
  );
}
