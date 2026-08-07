import { VIBES } from "../../constants/vibes";

/**
 * VibePattern
 * -----------
 * The product's signature visual: a single tileable motif system, restyled
 * per Builder Vibe. Every vibe shares the same 120x120 tile grid and stroke
 * weight so switching vibes never feels like switching products — only the
 * accent color and the motif drawn inside the tile change.
 *
 * Motifs:
 *  - azulejo  : interlocking Portuguese tile quarter-circles (Heritage)
 *  - sunburst : radiating arcs over a horizon line (Sunset)
 *  - wave     : stacked ripple crescents (Ocean)
 *  - palm     : abstracted frond silhouettes (Tropical)
 *
 * Usage:
 *   <VibePattern vibe="sunset" className="absolute inset-0 -z-10" opacity={0.08} />
 */

const TILE = 120;

function AzulejoTile({ id, color }) {
  return (
    <pattern id={id} width={TILE} height={TILE} patternUnits="userSpaceOnUse">
      <g fill="none" stroke={color} strokeWidth="1.5">
        <path d={`M0,${TILE / 2} A${TILE / 2},${TILE / 2} 0 0 1 ${TILE / 2},0`} />
        <path d={`M${TILE / 2},${TILE} A${TILE / 2},${TILE / 2} 0 0 1 ${TILE},${TILE / 2}`} />
        <circle cx={TILE / 2} cy={TILE / 2} r={TILE / 6} />
      </g>
    </pattern>
  );
}

function SunburstTile({ id, color }) {
  const cx = TILE / 2;
  const cy = TILE;
  const rays = 7;
  const lines = Array.from({ length: rays }, (_, i) => {
    const angle = (Math.PI / (rays - 1)) * i;
    const x2 = cx + Math.cos(Math.PI - angle) * TILE * 0.65;
    const y2 = cy - Math.sin(angle) * TILE * 0.65;
    return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} />;
  });
  return (
    <pattern id={id} width={TILE} height={TILE} patternUnits="userSpaceOnUse">
      <g stroke={color} strokeWidth="1.5" strokeLinecap="round">
        {lines}
      </g>
      <line x1="0" y1={TILE - 2} x2={TILE} y2={TILE - 2} stroke={color} strokeWidth="1.5" />
    </pattern>
  );
}

function WaveTile({ id, color }) {
  return (
    <pattern id={id} width={TILE} height={TILE / 2} patternUnits="userSpaceOnUse">
      <path
        d={`M0,${TILE / 4} Q${TILE / 4},0 ${TILE / 2},${TILE / 4} T${TILE},${TILE / 4}`}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />
    </pattern>
  );
}

function PalmTile({ id, color }) {
  const fronds = [-50, -25, 0, 25, 50];
  return (
    <pattern id={id} width={TILE} height={TILE} patternUnits="userSpaceOnUse">
      <g stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none">
        <line x1={TILE / 2} y1={TILE} x2={TILE / 2} y2={TILE * 0.35} />
        {fronds.map((deg) => (
          <path
            key={deg}
            d={`M${TILE / 2},${TILE * 0.35} q ${deg * 0.6},-18 ${deg},-30`}
          />
        ))}
      </g>
    </pattern>
  );
}

const MOTIFS = {
  azulejo: AzulejoTile,
  sunburst: SunburstTile,
  wave: WaveTile,
  palm: PalmTile,
};

export default function VibePattern({
  vibe = "sunset",
  className = "",
  opacity = 0.08,
  color,
}) {
  const config = VIBES[vibe] ?? VIBES.sunset;
  const Motif = MOTIFS[config.pattern] ?? MOTIFS.sunburst;
  const patternId = `vibe-pattern-${config.id}`;
  const strokeColor = color ?? config.accent;

  return (
    <svg
      className={className}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      style={{ opacity }}
    >
      <defs>
        <Motif id={patternId} color={strokeColor} />
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
