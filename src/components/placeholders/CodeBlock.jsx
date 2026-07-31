export default function CodeBlock({ label, output, children }) {
  return (
    <div className="ph-codeblock-wrap">
      {label && <div className="ph-codeblock-label">{label}</div>}
      <pre className="md-codeblock"><code>{children}</code></pre>
      {output && (
        <div className="ph-codeblock-output">
          <span className="ph-codeblock-arrow">&rarr;</span>
          <code>{output}</code>
        </div>
      )}
    </div>
  );
}