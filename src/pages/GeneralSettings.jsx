import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api, friendlyErrorMessage } from "../api";
import { useTranslation } from "../context/LocaleContext";
import { useToast } from "../context/ToastContext";
import { useActionCooldown } from "../hooks/useActionCooldown";
import { LIMITS } from "../validation";
import LanguageSelect from "../components/LanguageSelect";

export default function GeneralSettings() {
  const { guild } = useOutletContext();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { remaining, startCooldown } = useActionCooldown();
  const [config, setConfig] = useState({ prefix: "", language: "en" });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);

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
      await api.updateGuildConfig(guild.id, {
        language: config.language,
        prefix: config.prefix.trim().slice(0, LIMITS.PREFIX_MAX),
      });
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