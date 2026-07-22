export default function PageTexture() {
  return (
    <svg className="page-texture" aria-hidden="true">
      <defs>
        <pattern id="page-texture-tile" width="420" height="420" patternUnits="userSpaceOnUse">
          <g stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" fill="none">
            <line x1="20" y1="260" x2="130" y2="195" />
            <circle cx="335" cy="95" r="52" />
          </g>
          <g stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round">
            <line x1="45" y1="50" x2="45" y2="66" />
            <line x1="37" y1="58" x2="53" y2="58" />
            <line x1="205" y1="335" x2="205" y2="351" />
            <line x1="197" y1="343" x2="213" y2="343" />
          </g>
          <g fill="var(--wine-light)">
            <circle cx="300" cy="320" r="2.2" />
            <circle cx="318" cy="320" r="2.2" />
            <circle cx="300" cy="338" r="2.2" />
            <circle cx="318" cy="338" r="2.2" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#page-texture-tile)" />
    </svg>
  );
}