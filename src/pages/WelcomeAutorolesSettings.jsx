import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api, friendlyErrorMessage } from "../api";
import Toggle from "../components/Toggle";
import { LIMITS } from "../validation";

const MAX_ROLES_PER_KIND = 2;

function RoleSelector({ title, roles, selected, onToggle }) {
  return (
    <div className="autoroles-group">
      <div className="autoroles-group-title">
        <span>{title}</span>
        <span className="char-count">{selected.length}/{MAX_ROLES_PER_KIND}</span>
      </div>
      {roles.length === 0 ? (
        <p className="hint">No assignable roles found in this server.</p>
      ) : (
        <div className="role-chip-grid">
          {roles.map((role) => {
            const active = selected.includes(role.id);
            const disabled = !active && selected.length >= MAX_ROLES_PER_KIND;
            return (
              <button
                type="button"
                key={role.id}
                className={`role-chip ${active ? "active" : ""}`}
                disabled={disabled}
                onClick={() => onToggle(role.id)}
              >
                {role.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function WelcomeAutorolesSettings() {
  const { guild } = useOutletContext();
  const [config, setConfig] = useState({ enabled: false, channel: "", message: "" });
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [autoroles, setAutoroles] = useState({ humans: [], bots: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [savingWelcome, setSavingWelcome] = useState(false);
  const [savingAutoroles, setSavingAutoroles] = useState(false);
  const [welcomeFlash, setWelcomeFlash] = useState(null);
  const [autorolesFlash, setAutorolesFlash] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    Promise.all([
      api.getGuildConfig(guild.id),
      api.getGuildChannels(guild.id),
      api.getGuildRoles(guild.id),
      api.getAutoroles(guild.id),
    ])
      .then(([doc, ch, gr, ar]) => {
        if (cancelled) return;
        const welcome = doc.welcome || {};
        setConfig({
          enabled: Boolean(welcome.enabled),
          channel: welcome.channel || "",
          message: welcome.message || "",
        });
        setChannels(ch);
        setRoles(gr);
        setAutoroles({
          humans: ar.humans || [],
          bots: ar.bots || [],
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(friendlyErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [guild.id]);

  async function handleWelcomeSubmit(e) {
    e.preventDefault();
    setSavingWelcome(true);
    setWelcomeFlash(null);
    try {
      await api.updateGuildConfig(guild.id, {
        welcome_enabled: config.enabled,
        welcome_channel_id: config.channel || null,
        welcome_message: config.message.slice(0, LIMITS.MESSAGE_MAX),
      });
      setWelcomeFlash({ type: "success", message: "Saved!" });
    } catch (err) {
      setWelcomeFlash({ type: "error", message: friendlyErrorMessage(err) });
    } finally {
      setSavingWelcome(false);
    }
  }

  function toggleRole(kind, roleId) {
    setAutoroles((prev) => {
      const current = prev[kind];
      if (current.includes(roleId)) return { ...prev, [kind]: current.filter((id) => id !== roleId) };
      if (current.length >= MAX_ROLES_PER_KIND) return prev;
      return { ...prev, [kind]: [...current, roleId] };
    });
  }

  async function handleAutorolesSubmit(e) {
    e.preventDefault();
    setSavingAutoroles(true);
    setAutorolesFlash(null);
    try {
      await api.updateAutoroles(guild.id, {
        humans: autoroles.humans,
        bots: autoroles.bots,
      });
      setAutorolesFlash({ type: "success", message: "Saved!" });
    } catch (err) {
      setAutorolesFlash({ type: "error", message: friendlyErrorMessage(err) });
    } finally {
      setSavingAutoroles(false);
    }
  }

  if (loading) return <p className="section-sub">Loading&hellip;</p>;

  if (loadError) {
    return (
      <>
        <h1>Welcome &amp; Autoroles</h1>
        <div className="flash error">{loadError}</div>
        <button className="btn btn-outline" onClick={() => window.location.reload()}>
          Retry
        </button>
      </>
    );
  }

  return (
    <>
      <h1>Welcome &amp; Autoroles</h1>
      <p className="section-sub">Welcome message and automatic role assignment for new members.</p>

      {welcomeFlash && <div className={`flash ${welcomeFlash.type}`}>{welcomeFlash.message}</div>}
      <form className="card" onSubmit={handleWelcomeSubmit}>
        <div className="field toggle-row">
          <label style={{ marginBottom: 0 }}>Enabled</label>
          <Toggle
            checked={config.enabled}
            onChange={(checked) => setConfig({ ...config, enabled: checked })}
            label="Enable welcome messages"
          />
        </div>
        <div className="field">
          <label>Channel</label>
          <select value={config.channel} onChange={(e) => setConfig({ ...config, channel: e.target.value })}>
            <option value="">&mdash; Select a channel &mdash;</option>
            {channels.map((c) => (
              <option key={c.id} value={c.id}>#{c.name}</option>
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
        <button className="btn btn-primary" type="submit" disabled={savingWelcome}>
          {savingWelcome ? "Saving\u2026" : "Save changes"}
        </button>
      </form>

      {autorolesFlash && <div className={`flash ${autorolesFlash.type}`}>{autorolesFlash.message}</div>}
      <form className="card" onSubmit={handleAutorolesSubmit}>
        <p className="section-sub" style={{ marginBottom: "1rem" }}>
          Up to 2 roles per type, assigned automatically when a member joins.
        </p>
        <RoleSelector title="Humans" roles={roles} selected={autoroles.humans} onToggle={(id) => toggleRole("humans", id)} />
        <RoleSelector title="Bots" roles={roles} selected={autoroles.bots} onToggle={(id) => toggleRole("bots", id)} />
        <button className="btn btn-primary" type="submit" disabled={savingAutoroles}>
          {savingAutoroles ? "Saving\u2026" : "Save changes"}
        </button>
      </form>
    </>
  );
}