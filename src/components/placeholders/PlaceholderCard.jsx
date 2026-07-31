import { useTranslation } from "../../context/LocaleContext";
import CodeBlock from "./CodeBlock";

export default function PlaceholderCard({ placeholder }) {
  const { t } = useTranslation();
  const isFunction = placeholder.type === "function";

  return (
    <div className="ph-card">
      <div className="ph-card-header">
        <code className="ph-card-key">{placeholder.key}</code>
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