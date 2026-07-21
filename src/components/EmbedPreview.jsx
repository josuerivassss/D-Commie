import { renderDiscordMarkdown } from "../utils/discordMarkdown";
import { isValidUrl } from "../validation";

function EmbedCard({ embed }) {
  const color = embed.color != null ? `#${embed.color.toString(16).padStart(6, "0")}` : "#2b2d31";
  const hasAuthor = embed.author?.name;
  const hasFooter = embed.footer?.text || embed.timestamp;

  return (
    <div className="embed-preview-card" style={{ borderLeftColor: color }}>
      {embed.thumbnail && <img className="embed-preview-thumbnail" src={embed.thumbnail} alt="" />}
      {hasAuthor && (
        <div className="embed-preview-author">
          {embed.author.icon_url && <img className="embed-preview-author-icon" src={embed.author.icon_url} alt="" />}
          <span>{embed.author.name}</span>
        </div>
      )}
      {embed.title && (
        <div className="embed-preview-title">
          {embed.url && isValidUrl(embed.url) ? (
            <a href={embed.url} target="_blank" rel="noopener noreferrer">{embed.title}</a>
          ) : (
            embed.title
          )}
        </div>
      )}
      {embed.description && <div className="embed-preview-description">{renderDiscordMarkdown(embed.description)}</div>}
      {embed.fields?.length > 0 && (
        <div className="embed-preview-fields">
          {embed.fields.map((field, index) => (
            <div key={index} className={`embed-preview-field ${field.inline ? "inline" : ""}`}>
              <div className="embed-preview-field-name">{renderDiscordMarkdown(field.name)}</div>
              <div className="embed-preview-field-value">{renderDiscordMarkdown(field.value)}</div>
            </div>
          ))}
        </div>
      )}
      {embed.image && <img className="embed-preview-image" src={embed.image} alt="" />}
      {hasFooter && (
        <div className="embed-preview-footer">
          {embed.footer?.icon_url && <img className="embed-preview-footer-icon" src={embed.footer.icon_url} alt="" />}
          <span>
            {embed.footer?.text}
            {embed.footer?.text && embed.timestamp && " • "}
            {embed.timestamp && new Date(embed.timestamp).toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}

export default function EmbedPreview({ content, embeds }) {
  const hasContent = content && content.trim();
  const hasAnyEmbed = embeds.some((e) => e.title || e.description || e.fields?.length || e.image || e.thumbnail || e.author?.name);

  return (
    <div className="embed-preview">
      <div className="embed-preview-message-header">
        <div className="embed-preview-avatar" />
        <div>
          <span className="embed-preview-bot-name">Commie</span>
          <span className="embed-preview-bot-tag">BOT</span>
        </div>
      </div>
      {hasContent && <div className="embed-preview-content">{renderDiscordMarkdown(content)}</div>}
      {!hasContent && !hasAnyEmbed && <p className="hint">La vista previa aparecerá aquí conforme escribas.</p>}
      {embeds.map((embed, index) => (
        <EmbedCard key={index} embed={embed} />
      ))}
    </div>
  );
}