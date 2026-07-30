const ICONS = {
  lock: (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
      <path d="M4 7V5a4 4 0 1 1 8 0v2h1a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h1Zm2 0h4V5a2 2 0 1 0-4 0v2Z" />
    </svg>
  ),
  bot: (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
      <path d="M8 1a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v1h.5a1.5 1.5 0 0 1 0 3H13v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2h-.5a1.5 1.5 0 0 1 0-3H3V5a2 2 0 0 1 2-2h2V2a1 1 0 0 1 1-1ZM6 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm4 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <circle cx="8" cy="8" r="6.3" />
      <path d="M8 4.5V8l2.4 1.4" strokeLinecap="round" />
    </svg>
  ),
  server: (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
      <path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3Zm0 7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-3Zm2.5-6a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 7a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z" />
    </svg>
  ),
};

export default function Badge({ tone = "neutral", icon, children }) {
  return (
    <span className={`cmd-badge cmd-badge-${tone}`}>
      {icon && ICONS[icon]}
      {children}
    </span>
  );
}