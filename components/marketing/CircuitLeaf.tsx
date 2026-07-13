export function CircuitLeaf({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 560"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="leafStroke" x1="0" y1="0" x2="520" y2="560" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A6FF3C" />
          <stop offset="100%" stopColor="#17E9B0" />
        </linearGradient>
        <radialGradient id="leafGlow" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#17E9B0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#17E9B0" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="260" cy="270" r="230" fill="url(#leafGlow)" />

      {/* Leaf outline */}
      <path
        d="M260 40C370 90 460 190 460 300C460 410 370 500 260 520C150 500 60 410 60 300C60 190 150 90 260 40Z"
        stroke="url(#leafStroke)"
        strokeWidth="2.5"
        opacity="0.9"
      />

      {/* Central vein */}
      <path
        d="M260 70V500"
        stroke="url(#leafStroke)"
        strokeWidth="2"
        strokeDasharray="460"
        strokeDashoffset="460"
        className="animate-dash"
      />

      {/* Circuit veins branching left */}
      <path
        d="M260 160 L180 160 L180 210 L120 210"
        stroke="url(#leafStroke)"
        strokeWidth="1.5"
        strokeDasharray="220"
        strokeDashoffset="220"
        className="animate-dash"
        style={{ animationDelay: "0.2s" }}
      />
      <path
        d="M260 260 L170 260 L170 320 L100 320"
        stroke="url(#leafStroke)"
        strokeWidth="1.5"
        strokeDasharray="260"
        strokeDashoffset="260"
        className="animate-dash"
        style={{ animationDelay: "0.35s" }}
      />
      <path
        d="M260 360 L190 360 L190 410 L130 410"
        stroke="url(#leafStroke)"
        strokeWidth="1.5"
        strokeDasharray="220"
        strokeDashoffset="220"
        className="animate-dash"
        style={{ animationDelay: "0.5s" }}
      />

      {/* Circuit veins branching right */}
      <path
        d="M260 160 L340 160 L340 210 L400 210"
        stroke="url(#leafStroke)"
        strokeWidth="1.5"
        strokeDasharray="220"
        strokeDashoffset="220"
        className="animate-dash"
        style={{ animationDelay: "0.25s" }}
      />
      <path
        d="M260 260 L350 260 L350 320 L420 320"
        stroke="url(#leafStroke)"
        strokeWidth="1.5"
        strokeDasharray="260"
        strokeDashoffset="260"
        className="animate-dash"
        style={{ animationDelay: "0.4s" }}
      />
      <path
        d="M260 360 L330 360 L330 410 L390 410"
        stroke="url(#leafStroke)"
        strokeWidth="1.5"
        strokeDasharray="220"
        strokeDashoffset="220"
        className="animate-dash"
        style={{ animationDelay: "0.55s" }}
      />

      {/* Nodes */}
      {[
        [120, 210],
        [100, 320],
        [130, 410],
        [400, 210],
        [420, 320],
        [390, 410],
        [260, 70],
        [260, 500],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={5} fill="#A6FF3C" opacity={0.9} />
      ))}
    </svg>
  );
}
