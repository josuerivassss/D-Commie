import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api, friendlyErrorMessage } from "../api";
import { useTranslation } from "../context/LocaleContext";
import { useToast } from "../context/ToastContext";
import { useActionCooldown } from "../hooks/useActionCooldown";
import { useUnsavedChangesGuard } from "../context/UnsavedChangesContext";
import { LIMITS } from "../validation";
import LanguageSelect from "../components/LanguageSelect";

export default function GeneralSettings() {
  const { guild } = useOutletContext();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { remaining, startCooldown } = useActionCooldown();
  const { setGuard } = useUnsavedChangesGuard();
  const [config, setConfig] = useState({ prefix: "", language: "en" });
  const [savedSnapshot, setSavedSnapshot] = useState(null);
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

    api
      .getGuildConfig(guild.id)
      .then((doc) => {
        if (cancelled) return;
        const loaded = { prefix: doc.prefix || "", language: doc.language || "en" };
        setConfig(loaded);
        setSavedSnapshot(JSON.stringify(loaded));
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
      const trimmed = { prefix: config.prefix.trim().slice(0, LIMITS.PREFIX_MAX), language: config.language };
      await api.updateGuildConfig(guild.id, trimmed);
      setConfig(trimmed);
      setSavedSnapshot(JSON.stringify(trimmed));
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
        <h1>{t("general.title")}</h1>
        <div className="flash error">{loadError}</div>
        <button className="btn btn-outline" onClick={() => window.location.reload()}>{t("common.retry")}</button>
      </>
    );
  }

  return (
    <>
      <h1>{t("general.title")}</h1>
      <p className="section-sub">{t("general.subtitle")}</p>
      <form className="card" onSubmit={handleSubmit}>
        <div className="field">
          <div className="field-label-row">
            <label>{t("general.prefixLabel")}</label>
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
          <div className="hint">{t("general.prefixHint", { prefix: "c!" })}</div>
        </div>
        <div className="field">
          <label>{t("general.languageLabel")}</label>
          <LanguageSelect value={config.language} onChange={(code) => setConfig({ ...config, language: code })} />
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving || remaining > 0}>
          {saving ? t("common.saving") : remaining > 0 ? t("common.waitSeconds", { seconds: remaining }) : t("common.saveChanges")}
        </button>
      </form>
    </>
  );
}