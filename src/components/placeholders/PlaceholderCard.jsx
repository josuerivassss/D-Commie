import { useTranslation } from "../../context/LocaleContext";
import CodeBlock from "./CodeBlock";

function VariableIcon() {
  return (
    <span className="ph-card-type-icon ph-card-type-icon-variable" aria-hidden="true">
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#e9f3f4" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 4C6 4 5.5 5 5.5 7V9.5C5.5 10.5 5 11 4 11.5C5 12 5.5 12.5 5.5 13.5V17C5.5 19 6 20 8 20" />
        <path d="M16 4C18 4 18.5 5 18.5 7V9.5C18.5 10.5 19 11 20 11.5C19 12 18.5 12.5 18.5 13.5V17C18.5 19 18 20 16 20" />
      </svg>
    </span>
  );
}

function FunctionIcon() {
  return (
    <span className="ph-card-type-icon ph-card-type-icon-function" aria-hidden="true">
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#f7f0e0" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 4C6 4 5.5 5 5.5 7V9.5C5.5 10.5 5 11 4 11.5C5 12 5.5 12.5 5.5 13.5V17C5.5 19 6 20 8 20" />
        <path d="M16 4C18 4 18.5 5 18.5 7V9.5C18.5 10.5 19 11 20 11.5C19 12 18.5 12.5 18.5 13.5V17C18.5 19 18 20 16 20" />
        <circle cx="12" cy="9.3" r="1.3" fill="#f7f0e0" stroke="none" />
        <circle cx="12" cy="14.7" r="1.3" fill="#f7f0e0" stroke="none" />
      </svg>
    </span>
  );
}

export default function PlaceholderCard({ placeholder }) {
  const { t } = useTranslation();
  const isFunction = placeholder.type === "function";

  return (
    <div className="ph-card">
      <div className="ph-card-header">
        <div className="ph-card-title-row">
          {isFunction ? <FunctionIcon /> : <VariableIcon />}
          <code className="ph-card-key">{placeholder.key}</code>
        </div>
        <span className={`ph-card-type ${isFunction ? "function" : "variable"}`}>
          {isFunction ? t("placeholders.reference.function") : t("placeholders.reference.variable")}
        </span>
      </div>
      <p className="ph-card-desc">{t(`placeholders.reference.ref.${placeholder.descKey}`)}</p>
      {isFunction && placeholder.args?.length > 0 && (
        <div className="ph-card-args">
          <span>{t("placeholders.reference.argsLabel")}:</span>
          {placeholder.args.map((arg) => <code key={arg}>{arg}</code>)}
        </div>
      )}
      <CodeBlock output={placeholder.output}>{placeholder.syntax}</CodeBlock>
    </div>
  );
}