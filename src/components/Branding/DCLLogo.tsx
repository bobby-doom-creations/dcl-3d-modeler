export function DCLLogo({ size = "medium" }: { size?: "small" | "medium" | "large" }) {
  const sizes = {
    small: { width: 28, height: 28 },
    medium: { width: 48, height: 48 },
    large: { width: 96, height: 96 },
  };
  const s = sizes[size];

  return (
    <div
      style={{
        width: s.width,
        height: s.height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {/*
        DCL Logo SVG placeholder
        Replace with actual logo from assets/logo/dcl-logo.svg

        The logo is a hexagon with:
        - Dark background (#0d0d1a)
        - Blue-to-green gradient (#0088ff → #00cc66) for the "DCL" text
        - 3D cube icon at the top
        - "DOOM CREATIONS LAB" subtitle
      */}
      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        {/* Hexagon background */}
        <defs>
          <linearGradient id="dclGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0088ff" />
            <stop offset="100%" stopColor="#00cc66" />
          </linearGradient>
          <filter id="dclGlow">
            <feGaussianBlur stdDeviation="2" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <polygon
          points="100,10 180,55 180,145 100,190 20,145 20,55"
          fill="#1a1a2e"
          stroke="url(#dclGrad)"
          strokeWidth="4"
        />

        {/* 3D cube icon */}
        <g transform="translate(100, 45)">
          <polygon
            points="0,-12 15,0 0,12 -15,0"
            fill="none"
            stroke="url(#dclGrad)"
            strokeWidth="2"
          />
          <line x1="0" y1="-12" x2="0" y2="12" stroke="url(#dclGrad)" strokeWidth="1.5" />
          <line x1="-15" y1="0" x2="0" y2="0" stroke="url(#dclGrad)" strokeWidth="1.5" />
          <line x1="15" y1="0" x2="0" y2="0" stroke="url(#dclGrad)" strokeWidth="1.5" />
        </g>

        {/* DCL text */}
        <text
          x="100"
          y="115"
          textAnchor="middle"
          fontFamily="Arial Black, Impact, sans-serif"
          fontSize="48"
          fontWeight="900"
          fill="url(#dclGrad)"
          filter="url(#dclGlow)"
          letterSpacing="2"
        >
          DCL
        </text>

        {/* Subtitle */}
        <text
          x="100"
          y="145"
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          fontSize="12"
          fill="#8888aa"
          letterSpacing="3"
        >
          DOOM CREATIONS LAB
        </text>

        {/* Corner bolts */}
        <circle cx="25" cy="60" r="3" fill="#333355" />
        <circle cx="175" cy="60" r="3" fill="#333355" />
      </svg>
    </div>
  );
}
