function Plus({ x, y, size = 7, opacity = 0.55 }) {
  return (
    <g opacity={opacity} stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round">
      <line x1={x - size} y1={y} x2={x + size} y2={y} />
      <line x1={x} y1={y - size} x2={x} y2={y + size} />
    </g>
  );
}

const DOT_GRID_ORIGIN = { x: 90, y: 100 };
const DOT_GRID_COLS = 7;
const DOT_GRID_ROWS = 6;
const DOT_GRID_SPACING = 24;

const PLUS_POSITIONS = [
  { x: 385, y: 155 }, { x: 103, y: 412 }, { x: 1432, y: 210 },
  { x: 1210, y: 362 }, { x: 1463, y: 435 }, { x: 503, y: 798 },
  { x: 1353, y: 563 }, { x: 305, y: 948 }, { x: 1141, y: 912 },
];

export default function HeroPattern() {
  const dots = [];
  for (let row = 0; row < DOT_GRID_ROWS; row++) {
    for (let col = 0; col < DOT_GRID_COLS; col++) {
      dots.push({ x: DOT_GRID_ORIGIN.x + col * DOT_GRID_SPACING, y: DOT_GRID_ORIGIN.y + row * DOT_GRID_SPACING });
    }
  }

  return (
    <svg className="hero-pattern" viewBox="0 0 1536 1024" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g opacity="0.45" fill="var(--wine-light)">
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r="2.4" />
        ))}
      </g>

      <g fill="none" stroke="var(--accent)" strokeWidth="1.2" opacity="0.3">
        <circle cx="90" cy="650" r="290" />
        <circle cx="330" cy="580" r="220" />
        <circle cx="1080" cy="60" r="180" />
        <circle cx="1230" cy="140" r="230" />
        <circle cx="1420" cy="1130" r="220" />
      </g>

      <g stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" opacity="0.4">
        <line x1="0" y1="430" x2="150" y2="340" />
        <line x1="1180" y1="190" x2="1330" y2="60" />
        <line x1="1350" y1="190" x2="1536" y2="40" />
        <line x1="1300" y1="635" x2="1536" y2="540" />
      </g>

      {PLUS_POSITIONS.map((p, i) => (
        <Plus key={i} x={p.x} y={p.y} />
      ))}
    </svg>
  );
}