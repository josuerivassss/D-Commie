import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import csharp from "highlight.js/lib/languages/csharp";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import json from "highlight.js/lib/languages/json";
import yaml from "highlight.js/lib/languages/yaml";
import sql from "highlight.js/lib/languages/sql";
import bash from "highlight.js/lib/languages/bash";
import php from "highlight.js/lib/languages/php";
import ruby from "highlight.js/lib/languages/ruby";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import kotlin from "highlight.js/lib/languages/kotlin";
import swift from "highlight.js/lib/languages/swift";
import lua from "highlight.js/lib/languages/lua";
import ini from "highlight.js/lib/languages/ini";
import dockerfile from "highlight.js/lib/languages/dockerfile";
import markdown from "highlight.js/lib/languages/markdown";
import diff from "highlight.js/lib/languages/diff";
import powershell from "highlight.js/lib/languages/powershell";
import "highlight.js/styles/atom-one-dark.css";

// Same language set Discord's own client supports (highlight.js-backed).
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("java", java);
hljs.registerLanguage("c", c);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("csharp", csharp);
hljs.registerLanguage("css", css);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("json", json);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("php", php);
hljs.registerLanguage("ruby", ruby);
hljs.registerLanguage("go", go);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("kotlin", kotlin);
hljs.registerLanguage("swift", swift);
hljs.registerLanguage("lua", lua);
hljs.registerLanguage("ini", ini);
hljs.registerLanguage("dockerfile", dockerfile);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("diff", diff);
hljs.registerLanguage("powershell", powershell);

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// hljs.highlight() internally HTML-escapes the source before wrapping
// recognized tokens in <span> elements -- the returned string can never
// contain a functional <script> from the input, which is what makes it
// safe to render via dangerouslySetInnerHTML below.
function highlightCode(code, lang) {
  const language = (lang || "").toLowerCase();
  if (!language || !hljs.getLanguage(language)) return escapeHtml(code);
  try {
    return hljs.highlight(code, { language }).value;
  } catch {
    return escapeHtml(code);
  }
}

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
 * ~~strikethrough~~, `inline code`, ```fenced code blocks``` (with highlight.js
 * syntax coloring when a language tag is given), and line breaks. Not a full
 * parser -- edge cases may render slightly differently than Discord's client. */
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
    const cleanCode = code.replace(/\n$/, "");
    nodes.push(
      <pre key={`c${blockKey}`} className="md-codeblock">
        {lang && <div className="md-codeblock-lang">{lang}</div>}
        <code className="hljs" dangerouslySetInnerHTML={{ __html: highlightCode(cleanCode, lang) }} />
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