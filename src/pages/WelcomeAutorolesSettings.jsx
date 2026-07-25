import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api, friendlyErrorMessage } from "../api";
import { useTranslation } from "../context/LocaleContext";
import { useToast } from "../context/ToastContext";
import { useActionCooldown } from "../hooks/useActionCooldown";
import Toggle from "../components/Toggle";
import { LIMITS } from "../validation";

const MAX_ROLES_PER_KIND = 2;

function RoleSelector({ title, roles, selected, onToggle }) {
  const { t } = useTranslation();
  return (
    <div className="autoroles-group">
      <div className="autoroles-group-title">
        <span>{title}</span>
        <span className="char-count">{selected.length}/{MAX_ROLES_PER_KIND}</span>
      </div>
      {roles.length === 0 ? (
        <p className="hint">{t("welcome.noRoles")}</p>
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
  const { t } = useTranslation();
  const { showToast } = useToast();
  const welcomeCooldown = useActionCooldown();
  const autorolesCooldown = useActionCooldown();
  const [config, setConfig] = useState({ enabled: false, channel: "", message: "" });
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [autoroles, setAutoroles] = useState({ humans: [], bots: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [savingWelcome, setSavingWelcome] = useState(false);
  const [savingAutoroles, setSavingAutoroles] = useState(false);

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
        setLoadError(friendlyErrorMessage(err, t));
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
    welcomeCooldown.startCooldown();
    setSavingWelcome(true);
    try {
      await api.updateGuildConfig(guild.id, {
        welcome_enabled: config.enabled,
        welcome_channel_id: config.channel || null,
        welcome_message: config.message.slice(0, LIMITS.MESSAGE_MAX),
      });
      showToast(t("common.saved"), "success");
    } catch (err) {
      showToast(friendlyErrorMessage(err, t), "error");
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
    autorolesCooldown.startCooldown();
    setSavingAutoroles(true);
    try {
      await api.updateAutoroles(guild.id, {
        humans: autoroles.humans,
        bots: autoroles.bots,
      });
      showToast(t("common.saved"), "success");
    } catch (err) {
      showToast(friendlyErrorMessage(err, t), "error");
    } finally {
      setSavingAutoroles(false);
    }
  }

  if (loading) return <p className="section-sub">{t("common.loading")}</p>;

  if (loadError) {
    return (
      <>
        <h1>{t("welcome.title")}</h1>
        <div className="flash error">{loadError}</div>
        <button className="btn btn-outline" onClick={() => window.location.reload()}>{t("common.retry")}</button>
      </>
    );
  }

  return (
    <>
      <h1>{t("welcome.title")}</h1>
      <p className="section-sub">{t("welcome.subtitle")}</p>

      <form className="card" onSubmit={handleWelcomeSubmit}>
        <div className="field toggle-row">
          <label style={{ marginBottom: 0 }}>{t("common.enabledLabel")}</label>
          <Toggle
            checked={config.enabled}
            onChange={(checked) => setConfig({ ...config, enabled: checked })}
            label={t("welcome.enableToggle")}
          />
        </div>
        <div className="field">
          <label>{t("common.channelLabel")}</label>
          <select value={config.channel} onChange={(e) => setConfig({ ...config, channel: e.target.value })}>
            <option value="">{t("common.selectChannel")}</option>
            {channels.map((c) => (
              <option key={c.id} value={c.id}>#{c.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <div className="field-label-row">
            <label>{t("common.messageLabel")}</label>
            <span className={`char-count ${config.message.length >= LIMITS.MESSAGE_MAX ? "warn" : ""}`}>
              {config.message.length}/{LIMITS.MESSAGE_MAX}
            </span>
          </div>
          <textarea
            maxLength={LIMITS.MESSAGE_MAX}
            placeholder={t("welcome.messagePlaceholder", { p1: "{user.mention}", p2: "{guild.name}" })}
            value={config.message}
            onChange={(e) => setConfig({ ...config, message: e.target.value })}
          />
          <div className="hint">
            {t("welcome.messageHint", {
              p1: "{user.mention}",
              p2: "{user.name}",
              p3: "{guild.name}",
              p4: "{guild.members}",
              p5: "{embed.title:...}",
            })}
          </div>
        </div>
        <button className="btn btn-primary" type="submit" disabled={savingWelcome || welcomeCooldown.remaining > 0}>
          {savingWelcome
            ? t("common.saving")
            : welcomeCooldown.remaining > 0
            ? t("common.waitSeconds", { seconds: welcomeCooldown.remaining })
            : t("common.saveChanges")}
        </button>
      </form>

      <form className="card" onSubmit={handleAutorolesSubmit}>
        <p className="section-sub" style={{ marginBottom: "1rem" }}>
          {t("welcome.autorolesSubtitle")}
        </p>
        <RoleSelector title={t("welcome.humans")} roles={roles} selected={autoroles.humans} onToggle={(id) => toggleRole("humans", id)} />
        <RoleSelector title={t("welcome.bots")} roles={roles} selected={autoroles.bots} onToggle={(id) => toggleRole("bots", id)} />
        <button className="btn btn-primary" type="submit" disabled={savingAutoroles || autorolesCooldown.remaining > 0}>
          {savingAutoroles
            ? t("common.saving")
            : autorolesCooldown.remaining > 0
            ? t("common.waitSeconds", { seconds: autorolesCooldown.remaining })
            : t("common.saveChanges")}
        </button>
      </form>
    </>
  );
}