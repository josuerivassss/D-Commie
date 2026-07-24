import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api, friendlyErrorMessage } from "../api";
import { useTranslation } from "../context/LocaleContext";
import Toggle from "../components/Toggle";
import { TICKET_LIMITS } from "../validation";

export default function TicketsSettings() {
  const { guild } = useOutletContext();
  const { t } = useTranslation();
  const [config, setConfig] = useState({ enabled: false, parent_channel_id: "", staff_role_id: "", welcome_message: "" });
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [panelChannelId, setPanelChannelId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [flash, setFlash] = useState(null);
  const [panelFlash, setPanelFlash] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    Promise.all([api.getTicketsConfig(guild.id), api.getTicketChannels(guild.id), api.getGuildRoles(guild.id)])
      .then(([doc, ch, rl]) => {
        if (cancelled) return;
        setConfig({
          enabled: Boolean(doc.enabled),
          parent_channel_id: doc.parent_channel_id || "",
          staff_role_id: doc.staff_role_id || "",
          welcome_message: doc.welcome_message || "",
        });
        setChannels(ch);
        setRoles(rl);
      })
      .catch((err) => { if (!cancelled) setLoadError(friendlyErrorMessage(err, t)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [guild.id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setFlash(null);
    try {
      await api.updateTicketsConfig(guild.id, {
        enabled: config.enabled,
        parent_channel_id: config.parent_channel_id || null,
        staff_role_id: config.staff_role_id || null,
        welcome_message: config.welcome_message.slice(0, TICKET_LIMITS.MESSAGE_MAX),
      });
      setFlash({ type: "success", message: t("common.saved") });
    } catch (err) {
      setFlash({ type: "error", message: friendlyErrorMessage(err, t) });
    } finally {
      setSaving(false);
    }
  }

  async function handlePublishPanel() {
    setPublishing(true);
    setPanelFlash(null);
    try {
      await api.postTicketPanel(guild.id, { channel_id: panelChannelId });
      setPanelFlash({ type: "success", message: t("tickets.panelPublished") });
      setConfig((prev) => ({ ...prev, enabled: true }));
    } catch (err) {
      setPanelFlash({ type: "error", message: friendlyErrorMessage(err, t) });
    } finally {
      setPublishing(false);
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

  return (
    <>
      <h1>{t("tickets.title")}</h1>
      <p className="section-sub">{t("tickets.subtitle")}</p>

      {flash && <div className={`flash ${flash.type}`}>{flash.message}</div>}
      <form className="card" onSubmit={handleSubmit}>
        <div className="field toggle-row">
          <label style={{ marginBottom: 0 }}>{t("common.enabledLabel")}</label>
          <Toggle checked={config.enabled} onChange={(checked) => setConfig({ ...config, enabled: checked })} label={t("tickets.enableToggle")} />
        </div>
        <div className="field">
          <label>{t("tickets.parentChannelLabel")}</label>
          <select value={config.parent_channel_id} onChange={(e) => setConfig({ ...config, parent_channel_id: e.target.value })}>
            <option value="">{t("common.selectChannel")}</option>
            {channels.map((c) => (
              <option key={c.id} value={c.id} disabled={!c.can_host_tickets}>
                #{c.name}{!c.can_host_tickets ? t("common.noPermissionsSuffix") : ""}
              </option>
            ))}
          </select>
          <div className="hint">{t("tickets.parentChannelHint")}</div>
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
          <textarea
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
        <button className="btn btn-primary" type="submit" disabled={saving || messageTooShort}>
          {saving ? t("common.saving") : t("common.saveChanges")}
        </button>
      </form>

      <div className="card">
        <div className="embed-section-title">{t("tickets.panelSection")}</div>
        <p className="hint" style={{ marginBottom: "1rem" }}>{t("tickets.panelSectionHint")}</p>
        {panelFlash && <div className={`flash ${panelFlash.type}`}>{panelFlash.message}</div>}
        <div className="field">
          <label>{t("common.channelLabel")}</label>
          <select value={panelChannelId} onChange={(e) => setPanelChannelId(e.target.value)}>
            <option value="">{t("common.selectChannel")}</option>
            {channels.map((c) => (
              <option key={c.id} value={c.id} disabled={!c.can_send_panel}>
                #{c.name}{!c.can_send_panel ? t("common.noPermissionsSuffix") : ""}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!panelChannelId || !config.parent_channel_id || publishing}
          onClick={handlePublishPanel}
        >
          {publishing ? t("tickets.publishing") : t("tickets.publishPanel")}
        </button>
        {!config.parent_channel_id && <div className="hint" style={{ marginTop: "0.5rem" }}>{t("tickets.needParentFirst")}</div>}
      </div>
    </>
  );
}