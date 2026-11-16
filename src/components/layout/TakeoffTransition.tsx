import { useState, type CSSProperties } from 'react'
import { useLocation } from 'react-router'
import AirlinerShape from '../ui/AirlinerShape'

type FlightPath = {
  width: number
  height: number
  size: number // plane size in px
  d: string // SVG path of the flight (used by both the plane and the contrail)
}

// Plans the flight for the current screen (phone or desktop):
//   1. from just outside the bottom-left corner, curve in towards the middle,
//   2. fly one full circle (a loop) in the middle of the screen,
//   3. climb out through the top-right corner.
// Every joint is smooth (same direction on both sides), so the plane never "jumps".
function planFlight(): FlightPath {
  const width = window.innerWidth
  const height = window.innerHeight
  const size = Math.round(Math.min(220, Math.max(110, width * 0.15)))

  // Start and end sit on the screen's diagonal, past each corner, so the plane
  // enters through the bottom-left corner and leaves through the top-right corner.
  const [x0, y0] = [-size * 0.8, height + size * 0.8]
  const [x1, y1] = [width + size * 0.8, -size * 0.8]

  // The loop: a circle in the middle; the plane enters and leaves it at its
  // lowest point, flying to the right (counter-clockwise on screen).
  const r = Math.min(width, height) * 0.22
  const cx = width / 2
  const cy = height / 2
  const [px, py] = [cx, cy + r] // lowest point of the circle
  const k = r * 1.2 // how "long" the straight-ish lead-in and lead-out are

  const d = [
    `M ${x0} ${y0}`,
    `C ${width * 0.12} ${height * 0.95} ${px - k} ${py} ${px} ${py}`, // fly in
    `A ${r} ${r} 0 0 0 ${cx} ${cy - r}`, // first half of the loop (up the right side)
    `A ${r} ${r} 0 0 0 ${px} ${py}`, // second half (down the left side)
    `C ${px + k} ${py} ${width * 0.88} ${height * 0.12} ${x1} ${y1}`, // climb out
  ].join(' ')
  return { width, height, size, d }
}

// When the user moves to another page, a large white airliner flies in from
// the bottom-left corner, draws a full circle in the middle of the screen and
// leaves through the top-right corner, with a fading contrail behind it.
// • It never blocks clicks (pointer-events-none) and lasts about 2.2 seconds.
// • It only plays for real page changes (not for #section links or search filters).
// • Users who prefer reduced motion don't see it (see index.css).
export default function TakeoffTransition() {
  const { pathname } = useLocation()
  const [lastPath, setLastPath] = useState(pathname)
  const [flight, setFlight] = useState<{ id: number; path: FlightPath } | null>(null)

  // "Adjusting state while rendering" — React's recommended way to react to a
  // changed value without an extra effect.
  if (pathname !== lastPath) {
    const path = planFlight()
    setLastPath(pathname)
    setFlight((previous) => ({ id: (previous?.id ?? 0) + 1, path }))
  }

  if (!flight) return null // no plane on the very first page load

  const { width, height, size, d } = flight.path
  // CSS motion path: the plane follows `d` and turns with the curve.
  // `auto 90deg` because the drawing's nose points up, not along +x.
  const planeStyle: CSSProperties = {
    width: size,
    height: size,
    offsetPath: `path('${d}')`,
    offsetRotate: 'auto 90deg',
  }

  return (
    // `key` restarts the animation for every new flight.
    <div
      key={flight.id}
      aria-hidden="true"
      className="motion-flight pointer-events-none fixed inset-0 z-[60] overflow-hidden"
    >
      {/* Contrail: the same path, "drawn" as the plane moves (pathLength=1 → dash 0..1). */}
      <svg className="absolute inset-0 size-full" viewBox={`0 0 ${width} ${height}`}>
        <path
          d={d}
          pathLength={1}
          fill="none"
          strokeDasharray="1 1"
          strokeLinecap="round"
          strokeWidth={Math.max(4, size * 0.045)}
          className="animate-contrail stroke-slate-300/70 blur-[2px]"
        />
      </svg>

      <div className="absolute top-0 left-0 animate-flyby will-change-[offset-distance]" style={planeStyle}>
        <div className="size-full animate-loop-bank">
          <AirlinerShape
            detailed
            className="size-full drop-shadow-[0_0_1px_rgb(15_23_42/0.45)] drop-shadow-[0_22px_22px_rgb(15_23_42/0.3)]"
          />
        </div>
      </div>
    </div>
  )
}
