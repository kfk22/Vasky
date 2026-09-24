// Shared SVG shoe illustrations — lightweight, no image downloads.
export default function ShoeArt({ art, name }) {
  const c1 = (art && art.c1) || "#e8e8f2";
  const c2 = (art && art.c2) || "#2E2D88";
  const style = (art && art.style) || "runner";
  return (
    <svg viewBox="0 0 300 190" role="img" aria-label={name} style={{ width: "100%", height: "100%", display: "block" }}>
      <ellipse cx="150" cy="158" rx="105" ry="12" fill="rgba(46,45,136,0.10)" />
      {style === "hightop" && (
        <g>
          <path d="M70 150 L88 70 Q90 60 100 62 L150 72 Q170 90 200 96 L236 104 Q244 118 238 132 L226 150 Z" fill={c1} stroke={c2} strokeWidth="4" />
          <path d="M60 150 L240 150 L232 166 L68 166 Z" fill={c2} />
          <circle cx="120" cy="95" r="5" fill={c2} /><circle cx="132" cy="100" r="5" fill={c2} /><circle cx="144" cy="105" r="5" fill={c2} />
        </g>
      )}
      {style === "boot" && (
        <g>
          <path d="M95 150 L100 60 L170 60 L168 100 L235 118 Q242 132 232 142 L220 150 Z" fill={c1} stroke={c2} strokeWidth="4" />
          <path d="M88 150 L244 150 L236 166 L96 166 Z" fill={c2} />
          <line x1="118" y1="80" x2="118" y2="130" stroke={c2} strokeWidth="3" />
        </g>
      )}
      {style === "skate" && (
        <g>
          <path d="M60 148 Q110 142 150 118 L190 104 Q230 104 238 126 L242 148 Z" fill={c1} stroke={c2} strokeWidth="4" />
          <path d="M52 148 L250 148 L244 164 L60 164 Z" fill={c2} />
          <line x1="130" y1="128" x2="200" y2="112" stroke={c2} strokeWidth="5" strokeLinecap="round" />
        </g>
      )}
      {style === "court" && (
        <g>
          <path d="M62 146 Q120 140 160 112 L196 100 Q232 100 240 124 L244 146 Z" fill={c1} stroke={c2} strokeWidth="4" />
          <path d="M54 146 L252 146 L246 162 L62 162 Z" fill={c2} />
          <path d="M120 132 L170 118 M118 140 L168 126" stroke={c2} strokeWidth="4" strokeLinecap="round" />
        </g>
      )}
      {style === "trail" && (
        <g>
          <path d="M60 144 Q110 138 150 110 L195 98 Q232 100 240 122 L244 144 Z" fill={c1} stroke={c2} strokeWidth="4" />
          <path d="M52 144 L252 144 L246 166 L60 166 Z" fill={c2} />
          <path d="M80 156 L90 166 M110 156 L120 166 M140 156 L150 166 M170 156 L180 166 M200 156 L210 166" stroke="#fff" strokeWidth="3" />
        </g>
      )}
      {style === "slipon" && (
        <g>
          <path d="M62 146 Q130 140 175 108 L205 100 Q235 104 240 126 L242 146 Z" fill={c1} stroke={c2} strokeWidth="4" />
          <path d="M54 146 L250 146 L244 160 L62 160 Z" fill={c2} />
        </g>
      )}
      {style === "kids" && (
        <g>
          <path d="M70 144 Q120 138 155 114 L185 106 Q220 106 228 126 L232 144 Z" fill={c1} stroke={c2} strokeWidth="4" />
          <path d="M62 144 L240 144 L234 158 L70 158 Z" fill={c2} />
          <rect x="140" y="112" width="26" height="10" rx="5" fill={c2} />
          <circle cx="252" cy="60" r="8" fill={c2} opacity="0.35" /><circle cx="40" cy="50" r="5" fill={c2} opacity="0.3" />
        </g>
      )}
      {style === "flat" && (
        <g>
          <path d="M60 146 Q140 140 200 116 L235 112 Q244 126 240 144 Z" fill={c1} stroke={c2} strokeWidth="4" />
          <path d="M56 146 L248 146 L244 156 L62 156 Z" fill={c2} />
        </g>
      )}
      {style === "slide" && (
        <g>
          <path d="M56 148 L248 148 L242 162 L64 162 Z" fill={c2} />
          <path d="M110 148 Q130 96 190 96 Q210 96 214 148 Q170 136 110 148" fill={c1} stroke={c2} strokeWidth="4" />
        </g>
      )}
      {style === "formal" && (
        <g>
          <path d="M58 144 Q130 136 175 108 L215 102 Q240 108 242 128 L244 144 Z" fill={c1} stroke={c2} strokeWidth="4" />
          <path d="M50 144 L252 144 L246 160 L58 160 Z" fill={c2} />
          <path d="M150 118 L185 110 M145 128 L180 120" stroke={c2} strokeWidth="3" />
        </g>
      )}
      {style !== "hightop" && style !== "boot" && style !== "skate" && style !== "court" && style !== "trail" && style !== "slipon" && style !== "kids" && style !== "flat" && style !== "slide" && style !== "formal" && (
        <g>
          <path d="M60 146 Q120 140 160 112 L200 100 Q234 102 240 124 L242 146 Z" fill={c1} stroke={c2} strokeWidth="4" />
          <path d="M52 146 L250 146 L244 162 L60 162 Z" fill={c2} />
          <path d="M120 132 L170 118" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
        </g>
      )}
      {(style === "runner" || style === undefined) && (
        <g>
          <path d="M120 132 L172 116" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
          <circle cx="205" cy="124" r="7" fill="#fff" opacity="0.85" />
        </g>
      )}
    </svg>
  );
}
