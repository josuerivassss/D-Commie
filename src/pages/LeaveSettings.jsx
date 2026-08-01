import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api, friendlyErrorMessage } from "../api";
import { useTranslation } from "../context/LocaleContext";
import { useToast } from "../context/ToastContext";
import { useActionCooldown } from "../hooks/useActionCooldown";
import { useUnsavedChangesGuard } from "../context/UnsavedChangesContext";
import Toggle from "../components/Toggle";
import { LIMITS } from "../validation";

export default function LeaveSettings() {
  const { guild } = useOutletContext();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { remaining, startCooldown } = useActionCooldown();
  const { setGuard } = useUnsavedChangesGuard();
  const [config, setConfig] = useState({ enabled: false, channel: "", message: "" });
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);

  const isDirty = savedSnapshot !== null && JSON.stringify(config) !== savedSnapshot;

  useEffect(() => {
    setGuard(isDirty);
    return () => setGuard(false);
  }, [isDirty, setGuard]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    Promise.all([api.getGuildConfig(guild.id), api.getGuildChannels(guild.id)])
      .then(([doc, ch]) => {
        if (cancelled) return;
        const leave = doc.leave || {};
        const loaded = { enabled: Boolean(leave.enabled), channel: leave.channel || "", message: leave.message || "" };
        setConfig(loaded);
        setSavedSnapshot(JSON.stringify(loaded));
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
    startCooldown();
    setSaving(true);
    try {
      const trimmedMessage = config.message.slice(0, LIMITS.MESSAGE_MAX);
      await api.updateGuildConfig(guild.id, {
        leave_enabled: config.enabled,
        leave_channel_id: config.channel || null,
        leave_message: trimmedMessage,
      });
      const updated = { ...config, message: trimmedMessage };
      setConfig(updated);
      setSavedSnapshot(JSON.stringify(updated));
      showToast(t("common.saved"), "success");
    } catch (err) {
      showToast(friendlyErrorMessage(err, t), "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="section-sub">{t("common.loading")}</p>;

  if (loadError) {
    return (
      <>
        <h1>{t("leave.title")}</h1>
        <div className="flash error">{loadError}</div>
        <button className="btn btn-outline" onClick={() => window.location.reload()}>{t("common.retry")}</button>
      </>
    );
  }

  return (
    <>
      <h1>{t("leave.title")}</h1>
      <p className="section-sub">{t("leave.subtitle")}</p>
      <form className="card" onSubmit={handleSubmit}>
        <div className="field toggle-row">
          <label style={{ marginBottom: 0 }}>{t("common.enabledLabel")}</label>
          <Toggle
            checked={config.enabled}
            onChange={(checked) => setConfig({ ...config, enabled: checked })}
            label={t("leave.enableToggle")}
          />
        </div>
        <div className="field">
          <label>{t("common.channelLabel")}</label>
          <select value={config.channel} onChange={(e) => setConfig({ ...config, channel: e.target.value })}>
            <option value="">{t("common.selectChannel")}</option>
            {channels.map((c) => (
              <option key={c.id} value={c.id}>
                #{c.name}
              </option>
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
            placeholder={t("leave.messagePlaceholder", { p1: "{user.name}", p2: "{guild.name}" })}
            value={config.message}
            onChange={(e) => setConfig({ ...config, message: e.target.value })}
          />
          <div className="hint">
            {t("leave.messageHint", { p1: "{user.name}", p2: "{guild.name}", p3: "{guild.members}" })}
          </div>
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving || remaining > 0}>
          {saving ? t("common.saving") : remaining > 0 ? t("common.waitSeconds", { seconds: remaining }) : t("common.saveChanges")}
        </button>
      </form>
    </>
  );
}