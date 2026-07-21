const TOKEN_REGEX = /(`[^`]+`)|(\*\*[^*]+\*\*)|(__[^_]+__)|(~~[^~]+~~)|(\*[^*]+\*)|(_[^_]+_)/;

function renderLine(line) {
  const nodes = [];
  let remaining = line;
  let key = 0;
  while (remaining) {
    const match = TOKEN_REGEX.exec(remaining);
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

export function renderDiscordMarkdown(text) {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, lineIndex) => (
    <span key={lineIndex}>
      {renderLine(line)}
      {lineIndex < lines.length - 1 && <br />}
    </span>
  ));
}