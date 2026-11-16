// A clean, top-down airliner silhouette drawn for FlyAlert (nose points up).
// Used by the logo and by the page-transition plane, so the brand stays consistent.
// `detailed` adds soft shading and engines — nice when the plane is drawn big.
type AirlinerShapeProps = {
  className?: string
  detailed?: boolean
}

export default function AirlinerShape({ className, detailed = false }: AirlinerShapeProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      {detailed && (
        <defs>
          {/* Light comes from the left: right side of each part is slightly darker */}
          <linearGradient id="airliner-body" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.55" stopColor="#f8fafc" />
            <stop offset="1" stopColor="#dbe1ea" />
          </linearGradient>
          <linearGradient id="airliner-wing" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#e5e9f0" />
          </linearGradient>
        </defs>
      )}

      <g fill={detailed ? 'url(#airliner-wing)' : 'currentColor'}>
        {/* Swept-back main wings */}
        <path d="M46 38 L4 60 Q2.5 61 3.5 64 L46 54 Z" />
        <path d="M54 38 L96 60 Q97.5 61 96.5 64 L54 54 Z" />
        {/* Tail wings */}
        <path d="M46.5 82 L31 93 Q30 94.5 31.5 96 L47 91 Z" />
        <path d="M53.5 82 L69 93 Q70 94.5 68.5 96 L53 91 Z" />
      </g>

      {detailed && (
        <g fill="#cfd6e1">
          {/* Engines hanging under the wings */}
          <rect x="26" y="45" width="6" height="12" rx="3" />
          <rect x="68" y="45" width="6" height="12" rx="3" />
        </g>
      )}

      {/* Fuselage */}
      <path
        fill={detailed ? 'url(#airliner-body)' : 'currentColor'}
        d="M50 2 C54 2 55.5 9 55.5 16 L55.5 84 C55.5 92 52.5 98 50 98 C47.5 98 44.5 92 44.5 84 L44.5 16 C44.5 9 46 2 50 2 Z"
      />

      {detailed && (
        // Cockpit windows
        <path fill="#94a3b8" d="M47.6 10.5 Q50 8.6 52.4 10.5 L52 12.6 Q50 11.6 48 12.6 Z" />
      )}
    </svg>
  )
}
