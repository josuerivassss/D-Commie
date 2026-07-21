const CODE_BLOCK_REGEX = /```(\w*)\n?([\s\S]*?)```/g;
const INLINE_TOKEN_REGEX = /(`[^`]+`)|(\*\*[^*]+\*\*)|(__[^_]+__)|(~~[^~]+~~)|(\*[^*]+\*)|(_[^_]+_)/;

function renderLine(line) {
  const nodes = [];
  let remaining = line;
  let key = 0;
  while (remaining) {
    const match = INLINE_TOKEN_REGEX.exec(remaining);
    if (!match) {
      nodes.push(remaining);
      break;
    }
    const index = match.index;
    if (index > 0) nodes.push(remaining.slice(0, index));
    const token = match[0];
    const nodeKey = key++;
    if (token.startsWith("`")) nodes.push(<code key={nodeKey} className="md-code">{token.slice(1, -1)}</code>);
    else if (token.startsWith("**")) nodes.push(<strong key={nodeKey}>{token.slice(2, -2)}</strong>);
    else if (token.startsWith("__")) nodes.push(<u key={nodeKey}>{token.slice(2, -2)}</u>);
    else if (token.startsWith("~~")) nodes.push(<s key={nodeKey}>{token.slice(2, -2)}</s>);
    else nodes.push(<em key={nodeKey}>{token.slice(1, -1)}</em>);
    remaining = remaining.slice(index + token.length);
  }
  return nodes;
}

function renderTextSegment(text, keyPrefix) {
  const lines = text.split("\n");
  return lines.map((line, lineIndex) => (
    <span key={`${keyPrefix}-${lineIndex}`}>
      {renderLine(line)}
      {lineIndex < lines.length - 1 && <br />}
    </span>
  ));
}

/** Discord markdown-lite for the live preview: **bold**, *italic*, __underline__,
 * ~~strikethrough~~, `inline code`, ```fenced code blocks``` (with optional
 * language tag), and line breaks. Not a full parser -- edge cases like a
 * fenced block with no newline after the language tag may render slightly
 * differently than Discord's own client. */
export function renderDiscordMarkdown(text) {
  if (!text) return null;

  const nodes = [];
  let lastIndex = 0;
  let match;
  let blockKey = 0;
  CODE_BLOCK_REGEX.lastIndex = 0;

  while ((match = CODE_BLOCK_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(renderTextSegment(text.slice(lastIndex, match.index), `t${blockKey}`));
    }
    const [, lang, code] = match;
    nodes.push(
      <pre key={`c${blockKey}`} className="md-codeblock">
        {lang && <div className="md-codeblock-lang">{lang}</div>}
        <code>{code.replace(/\n$/, "")}</code>
      </pre>
    );
    lastIndex = match.index + match[0].length;
    blockKey++;
  }

  if (lastIndex < text.length) {
    nodes.push(renderTextSegment(text.slice(lastIndex), `t${blockKey}`));
  }

  return nodes;
}