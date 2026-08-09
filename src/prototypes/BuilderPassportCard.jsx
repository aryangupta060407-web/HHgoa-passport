import React, { forwardRef, memo } from 'react';

// Deterministic "barcode" bars generated from the builder's ID/number, so the
// same builder always gets the same-looking barcode instead of it changing
// on every re-render.
function generateBarcode(seed, barCount = 26) {
  let s = 0;
  for (let i = 0; i < seed.length; i++) {
    s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const bars = [];
  let x = 0;
  for (let i = 0; i < barCount; i++) {
    s = (s * 1103515245 + 12345) >>> 0;
    const w = 3 + (s % 7); // bar width 3-9
    bars.push({ x, w });
    x += w + 4;
  }
  return { bars, totalWidth: x };
}

// Packs a list of short strings into "A · B · C" lines no wider than
// maxChars, so a variable-length tech stack fits the card without
// overflowing off the right edge or overlapping the perforation line.
function wrapItems(items, maxChars = 46, maxLines = 3) {
  const lines = [];
  let current = '';
  for (const item of items) {
    const candidate = current ? `${current}  ·  ${item}` : item;
    if (candidate.length > maxChars && current) {
      lines.push(current.toUpperCase());
      current = item;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current.toUpperCase());
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1]}…`;
    return kept;
  }
  return lines;
}

const BuilderBoardingPass = forwardRef(function BuilderBoardingPass(
  {
    photo,
    firstName,
    lastName,
    role,
    location,
    archetype,
    techStack,
    builderId,
    builderNumber,
    totalBuilders = 247,
  },
  ref
) {
  const fullName = (firstName || lastName)
    ? `${firstName} ${lastName}`.trim().toUpperCase()
    : 'YOUR NAME';
  const roleLocationLine = [role, location].filter(Boolean).join('  ·  ').toUpperCase();
  const paddedNumber = String(builderNumber ?? 1).padStart(3, '0');
  const barcodeSeed = builderId || `HHG${paddedNumber}`;
  const { bars, totalWidth } = generateBarcode(barcodeSeed);
  const techList = (techStack || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const techLine = techList.join('  ·  ').toUpperCase();

  return (
    <div className="w-full max-w-[540px] mx-auto rounded-[32px] overflow-hidden shadow-[0_20px_45px_-18px_rgba(5,26,15,0.45)]">
      <svg ref={ref} xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080" className="w-full h-auto">
        <defs>
          <style>{`
            .serif { font-family: Georgia, 'Times New Roman', serif; }
            .mono { font-family: 'Courier New', monospace; }
            .dev { font-family: 'Noto Serif Devanagari', 'Noto Sans Devanagari', serif; }
          `}</style>
          <clipPath id="bpCardClip"><rect width="1080" height="1080" rx="32" /></clipPath>
          <clipPath id="bpPhotoClip"><rect x="80" y="248" width="332" height="332" rx="22" /></clipPath>

          {/* Fine diagonal hairlines — a subtle premium-card texture, used in
              place of the old giant rotated wordmark (which read as a blurry
              watermark rather than texture). */}
          <pattern id="bpHairlines" width="26" height="26" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="26" stroke="#F7F2DF" strokeWidth="1.4" />
          </pattern>

          {/* Matte film-grain: turbulence noise mapped to a mid-grey alpha
              mask, then blended with "overlay" below so it both lightens
              and darkens the base color like real grain, instead of just
              darkening (which a flat noise-as-alpha-over-black would do). */}
          <filter id="bpFilmGrain" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="1" seed="11" stitchTiles="stitch" result="noise" />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.85 0"
            />
          </filter>
        </defs>

        <g clipPath="url(#bpCardClip)">
          {/* Base + stub band */}
          <rect width="1080" height="1080" fill="#086B3A" />
          <rect x="0" y="650" width="1080" height="430" fill="#054023" />

          {/* Texture layer replacing the old ghost wordmark */}
          <rect width="1080" height="650" fill="url(#bpHairlines)" opacity="0.035" />

          {/* ===== Header ===== */}
          <g fill="#FFD600">
            <rect x="80" y="40" width="14" height="7" /><rect x="94" y="47" width="14" height="7" />
            <rect x="108" y="40" width="14" height="7" /><rect x="122" y="33" width="14" height="7" />
            <rect x="136" y="40" width="14" height="7" />
          </g>

          <text x="80" y="102" className="serif" fontSize="46" fontWeight="700" letterSpacing="3" fill="#FFD600">HACKER HOUSE</text>
          <text x="80" y="150" className="dev" fontSize="42" fontWeight="700" fill="#FF0080">गोवा</text>
          <text x="80" y="185" className="mono" fontSize="15" letterSpacing="3" fill="#F7F2DF">GOA, INDIA · OCT 28–31 · 2026</text>

          <g transform="translate(975,95) rotate(6)" fill="none" stroke="#FFD600" strokeWidth="4">
            <path d="M0 32 C-34 9,-43 -18,-43 -31 C-18 -22,-3 -6,0 32Z" />
            <path d="M0 32 C34 9,43 -18,43 -31 C18 -22,3 -6,0 32Z" />
            <path d="M0 32 C-18 4,-15 -25,0 -45 C15 -25,18 4,0 32Z" />
            <path d="M-50 32 Q0 54 50 32" />
          </g>

          <line x1="80" y1="208" x2="1000" y2="208" stroke="#FFD600" strokeWidth="2" opacity="0.6" />

          {/* ===== Photo block ===== */}
          <g transform="rotate(-3 246 414)">
            <rect x="72" y="240" width="348" height="348" rx="26" fill="#054023" />
            <rect x="80" y="248" width="332" height="332" rx="22" fill="none" stroke="#FFD600" strokeWidth="10" />
            {photo ? (
              <g clipPath="url(#bpPhotoClip)">
                <image href={photo} x="80" y="248" width="332" height="332" preserveAspectRatio="xMidYMid slice" />
              </g>
            ) : (
              <>
                <rect x="80" y="248" width="332" height="332" rx="22" fill="#0B7742" />
                <text x="246" y="405" textAnchor="middle" className="mono" fontSize="18" fill="#FFD600" letterSpacing="3">YOUR</text>
                <text x="246" y="432" textAnchor="middle" className="mono" fontSize="18" fill="#FFD600" letterSpacing="3">PHOTO</text>
                <text x="246" y="460" textAnchor="middle" className="mono" fontSize="11" fill="#F7F2DF" opacity="0.65">DROP IMAGE HERE</text>
              </>
            )}
            {/* Corner tag chip */}
            <g transform="translate(392,556) rotate(10)">
              <rect x="-30" y="-24" width="60" height="48" rx="12" fill="#FF0080" />
              <text x="0" y="8" textAnchor="middle" className="mono" fontSize="20" fontWeight="700" fill="#F7F2DF">{'</>'}</text>
            </g>
          </g>

          {/* ===== Identity column ===== */}
          <text x="480" y="298" className="mono" fontSize="15" letterSpacing="3" fill="#FF0080" fontWeight="700">BOARDING PASS · BUILDER</text>
          <text x="480" y="362" className="serif" fontSize="50" fontWeight="700" letterSpacing="1" fill="#FFD600">{fullName}</text>
          {roleLocationLine && (
            <text x="480" y="400" className="mono" fontSize="17" letterSpacing="2" fill="#F7F2DF" opacity="0.85">{roleLocationLine}</text>
          )}
          {archetype && (
            <g>
              <rect x="480" y="424" width="440" height="54" rx="27" fill="#FF0080" />
              <text x="700" y="458" textAnchor="middle" className="mono" fontSize="16" fontWeight="700" letterSpacing="2" fill="#F7F2DF">
                CALL SIGN — {archetype.toUpperCase()}
              </text>
            </g>
          )}

          {techList.length > 0 && (
            <g>
              <text x="480" y="506" className="mono" fontSize="12" letterSpacing="2" fill="#FFD600" opacity="0.85">STACK</text>
              {wrapItems(techList, 46).map((line, i) => (
                <text
                  key={i}
                  x="480"
                  y={530 + i * 24}
                  className="mono"
                  fontSize="14"
                  letterSpacing="1"
                  fill="#F7F2DF"
                  opacity="0.9"
                >
                  {line}
                </text>
              ))}
            </g>
          )}

          {/* ===== Perforation tear line ===== */}
          <line x1="60" y1="650" x2="1020" y2="650" stroke="#F7F2DF" strokeWidth="2" strokeDasharray="10 10" opacity="0.5" />
          {Array.from({ length: 39 }).map((_, i) => (
            <circle key={i} cx={60 + i * 25} cy="650" r="4" fill="#F7F2DF" opacity="0.35" />
          ))}

          {/* ===== Stub ===== */}
          <text x="90" y="712" className="mono" fontSize="14" letterSpacing="3" fill="#FF0080" fontWeight="700">BUILDER NO.</text>
          <text x="90" y="778" className="mono" fontSize="54" fontWeight="700" letterSpacing="4" fill="#FFD600">
            {paddedNumber} / {totalBuilders}
          </text>

          <g transform="translate(90,806)" fill="#FFD600" opacity="0.9">
            {bars.map((bar, i) => (
              <rect key={i} x={bar.x} y="0" width={bar.w} height="56" />
            ))}
          </g>
          <text x="90" y={806 + 56 + 22} className="mono" fontSize="11" letterSpacing="3" fill="#F7F2DF" opacity="0.55">
            HHG · {barcodeSeed.toUpperCase()}
          </text>

          {/* Verification stamp — bigger and set further down the stub so
              it clears the perforation line with margin to spare */}
          <g transform="translate(890,790) rotate(-8)">
            <circle r="112" fill="none" stroke="#FF0080" strokeWidth="4" opacity="0.85" />
            <circle r="96" fill="none" stroke="#FFD600" strokeWidth="2.5" opacity="0.6" strokeDasharray="5 7" />
            <text textAnchor="middle" y="-24" className="mono" fontSize="17" fontWeight="700" letterSpacing="2" fill="#FFD600">VERIFIED</text>
            <text textAnchor="middle" y="17" className="serif" fontSize="34" fontWeight="700" fill="#F7F2DF">GOA '26</text>
            <text textAnchor="middle" y="48" className="mono" fontSize="14" letterSpacing="2" fill="#FFD600">BUILDER PASS</text>
          </g>

          {/* Footer */}
          <text x="90" y="1000" className="mono" fontSize="34" fontWeight="700" letterSpacing="1" fill="#FF0080">#FrameInGoa</text>
          <text x="90" y="1032" className="mono" fontSize="14" letterSpacing="2" fill="#F7F2DF">BUILD · SHIP · GOA</text>

          <text x="990" y="988" textAnchor="end" className="serif" fontSize="24" fontWeight="700" letterSpacing="2" fill="#FFD600">BUILD IN PARADISE</text>
          <text x="990" y="1020" textAnchor="end" className="mono" fontSize="13" letterSpacing="3" fill="#F7F2DF">HH GOA · 2026</text>

          <text x="540" y="1062" textAnchor="middle" className="mono" fontSize="10" letterSpacing="4" fill="#F7F2DF" opacity="0.3">
            15°29′N · 73°49′E
          </text>

          {/* Matte film-grain finish over the whole card */}
          <rect
            width="1080"
            height="1080"
            filter="url(#bpFilmGrain)"
            opacity="0.5"
            style={{ mixBlendMode: 'overlay' }}
          />

          {/* Outer frame */}
          <rect x="10" y="10" width="1060" height="1060" rx="26" fill="none" stroke="#FFD600" strokeWidth="2" opacity="0.35" />
        </g>
      </svg>
    </div>
  );
});

export default memo(BuilderBoardingPass);
