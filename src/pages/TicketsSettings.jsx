import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api, friendlyErrorMessage } from "../api";
import { useTranslation } from "../context/LocaleContext";
import { useToast } from "../context/ToastContext";
import { useActionCooldown } from "../hooks/useActionCooldown";
import { useUnsavedChangesGuard } from "../context/UnsavedChangesContext";
import Toggle from "../components/Toggle";
import AutoGrowTextarea from "../components/AutoGrowTextArea";
import { TICKET_LIMITS } from "../validation";

export default function TicketsSettings() {
  const { guild } = useOutletContext();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const saveCooldown = useActionCooldown();
  const panelCooldown = useActionCooldown();
  const { setGuard } = useUnsavedChangesGuard();
  const [config, setConfig] = useState({ enabled: false, staff_role_id: "", welcome_message: "" });
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [channelId, setChannelId] = useState("");
  const [panelStatus, setPanelStatus] = useState({ channelId: "", messageId: "" });
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sendingPanel, setSendingPanel] = useState(false);

  const isDirty = savedSnapshot !== null && JSON.stringify(config) !== savedSnapshot;

  useEffect(() => {
    setGuard(isDirty);
    return () => setGuard(false);
  }, [isDirty, setGuard]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    Promise.all([api.getTicketsConfig(guild.id), api.getTicketChannels(guild.id), api.getGuildRoles(guild.id)])
      .then(([doc, ch, rl]) => {
        if (cancelled) return;
        const loaded = {
           enabled: Boolean(doc.enabled),
           staff_role_id: doc.staff_role_id || "",
           welcome_message: doc.welcome_message || "",
         };
        setConfig(loaded);
        setSavedSnapshot(JSON.stringify(loaded));
        setChannelId(doc.panel_channel_id || "");
        setPanelStatus({ channelId: doc.panel_channel_id || "", messageId: doc.panel_message_id || "" });
        setChannels(ch);
        setRoles(rl);
      })
      .catch((err) => { if (!cancelled) setLoadError(friendlyErrorMessage(err, t)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [guild.id]);

  async function handleSubmit(e) {
    e.preventDefault();
    saveCooldown.startCooldown();
    setSaving(true);
    try {
      const trimmed = {
         enabled: config.enabled,
         staff_role_id: config.staff_role_id,
         welcome_message: config.welcome_message.slice(0, TICKET_LIMITS.MESSAGE_MAX),
       };
       await api.updateTicketsConfig(guild.id, { ...trimmed, staff_role_id: trimmed.staff_role_id || null });
      setConfig(trimmed);
      setSavedSnapshot(JSON.stringify(trimmed));
      showToast(t("common.saved"), "success");
    } catch (err) {
      showToast(friendlyErrorMessage(err, t), "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleSendPanel() {
    panelCooldown.startCooldown();
    setSendingPanel(true);
    try {
      const result = await api.postTicketPanel(guild.id, { channel_id: channelId });
      setPanelStatus({ channelId: result.panel_channel_id, messageId: result.panel_message_id });
      setConfig((prev) => {
        const updated = { ...prev, enabled: true };
        setSavedSnapshot(JSON.stringify(updated)); // panel post already flips `enabled` server-side too
        return updated;
      });
      showToast(t("tickets.panelSentSuccess"), "success");
    } catch (err) {
      showToast(friendlyErrorMessage(err, t), "error");
    } finally {
      setSendingPanel(false);
    }
  }

  if (loading) return <p className="section-sub">{t("common.loading")}</p>;

  if (loadError) {
    return (
      <>
        <h1>{t("tickets.title")}</h1>
        <div className="flash error">{loadError}</div>
        <button className="btn btn-outline" onClick={() => window.location.reload()}>{t("common.retry")}</button>
      </>
    );
  }

  const messageLength = config.welcome_message.length;
  const messageTooShort = messageLength > 0 && messageLength < TICKET_LIMITS.MESSAGE_MIN;
  const activePanelChannel = panelStatus.messageId ? channels.find((c) => c.id === panelStatus.channelId) : null;

  return (
    <>
      <h1>{t("tickets.title")}</h1>
      <p className="section-sub">{t("tickets.subtitle")}</p>

      <form className="card" onSubmit={handleSubmit}>
        <div className="field toggle-row">
          <label style={{ marginBottom: 0 }}>{t("common.enabledLabel")}</label>
          <Toggle checked={config.enabled} onChange={(checked) => setConfig({ ...config, enabled: checked })} label={t("tickets.enableToggle")} />
        </div>
        <div className="field">
          <label>{t("tickets.channelLabel")}</label>
          <select value={channelId} onChange={(e) => setChannelId(e.target.value)}>
            <option value="">{t("common.selectChannel")}</option>
            {channels.map((c) => (
              <option key={c.id} value={c.id} disabled={!c.can_host_tickets}>
                #{c.name}{!c.can_host_tickets ? t("common.noPermissionsSuffix") : ""}
              </option>
            ))}
          </select>
          <div className="hint">
            {activePanelChannel ? t("tickets.panelActiveHint", { channel: `#${activePanelChannel.name}` }) : t("tickets.channelHint")}
          </div>
        </div>
        <div className="field">
          <label>{t("tickets.staffRoleLabel")}</label>
          <select value={config.staff_role_id} onChange={(e) => setConfig({ ...config, staff_role_id: e.target.value })}>
            <option value="">{t("tickets.noStaffRole")}</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <div className="hint">{t("tickets.staffRoleHint")}</div>
        </div>
        <div className="field">
          <div className="field-label-row">
            <label>{t("tickets.welcomeMessageLabel")}</label>
            <span className={`char-count ${messageLength >= TICKET_LIMITS.MESSAGE_MAX ? "warn" : ""}`}>
              {messageLength}/{TICKET_LIMITS.MESSAGE_MAX}
            </span>
          </div>
          <AutoGrowTextarea
            maxLength={TICKET_LIMITS.MESSAGE_MAX}
            className={messageTooShort ? "invalid" : ""}
            value={config.welcome_message}
            onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })}
          />
          {messageTooShort ? (
            <div className="error-text">{t("tickets.messageTooShort", { min: TICKET_LIMITS.MESSAGE_MIN })}</div>
          ) : (
            <div className="hint">{t("tickets.welcomeMessageHint", { p1: "{user.mention}", p2: "{guild.name}" })}</div>
          )}
        </div>
        <div className="form-actions-row">
          <button className="btn btn-primary" type="submit" disabled={saving || saveCooldown.remaining > 0 || messageTooShort}>
            {saving
              ? t("common.saving")
              : saveCooldown.remaining > 0
              ? t("common.waitSeconds", { seconds: saveCooldown.remaining })
              : t("common.saveChanges")}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            disabled={!channelId || sendingPanel || panelCooldown.remaining > 0}
            onClick={handleSendPanel}
          >
            {sendingPanel
              ? t("tickets.sendingPanel")
              : panelCooldown.remaining > 0
              ? t("common.waitSeconds", { seconds: panelCooldown.remaining })
              : t("tickets.sendPanel")}
          </button>
        </div>
      </form>
    </>
  );
}