import { useTranslation } from "../context/LocaleContext";

export default function UnsavedChangesPrompt({ onAccept, onCancel }) {
  const { t } = useTranslation();

  return (
    <div className="unsaved-popup" role="alertdialog" aria-live="assertive">
      <svg className="unsaved-popup-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 3 2 20h20L12 3Z" strokeLinejoin="round" />
        <path d="M12 9.5v5" strokeLinecap="round" />
        <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
      </svg>
      <div className="unsaved-popup-body">
        <div className="unsaved-popup-title">{t("common.unsavedTitle")}</div>
        <p className="unsaved-popup-text">{t("common.unsavedMessage")}</p>
      </div>
      <div className="unsaved-popup-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          {t("common.unsavedCancel")}
        </button>
        <button type="button" className="btn btn-danger" onClick={onAccept}>
          {t("common.unsavedDiscard")}
        </button>
      </div>
    </div>
  );
}