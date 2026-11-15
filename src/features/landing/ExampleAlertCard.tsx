import { BellRing, Info, TrendingDown } from 'lucide-react'

// Illustration of what a price alert looks like.
// All numbers here are made up and clearly labelled as an example.
const EXAMPLE_PRICES = [468, 455, 472, 449, 438, 444, 421, 415, 398, 404, 386, 379]

function Sparkline({ values }: { values: number[] }) {
  const width = 280
  const height = 72
  const min = Math.min(...values)
  const max = Math.max(...values)
  const points = values.map((value, i) => {
    const x = (i / (values.length - 1)) * width
    const y = height - ((value - min) / (max - min)) * (height - 8) - 4
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const line = points.join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-18 w-full" aria-hidden="true">
      <defs>
        <linearGradient id="spark-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${line} ${width},${height}`} fill="url(#spark-fill)" />
      <polyline
        points={line}
        fill="none"
        stroke="var(--color-brand-600)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function ExampleAlertCard() {
  const current = EXAMPLE_PRICES[EXAMPLE_PRICES.length - 1]
  const first = EXAMPLE_PRICES[0]
  const target = 380
  const change = Math.round(((current - first) / first) * 100)

  return (
    <figure className="relative mx-auto w-full max-w-sm">
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-linear-to-br from-brand-200/60 via-sky-100/40 to-emerald-100/50 blur-2xl" />

      <div className="rounded-2xl border border-line bg-surface p-5 shadow-xl shadow-slate-900/5 transition duration-300 hover:-translate-y-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-ink-subtle">Price alert</p>
            <p className="mt-1 text-lg font-semibold text-ink">IST → JFK</p>
            <p className="text-sm text-ink-muted">Round-trip · 1 adult · Economy</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        </div>

        <div className="mt-4">
          <Sparkline values={EXAMPLE_PRICES} />
        </div>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-xs text-ink-subtle">Current price</p>
            <p className="text-2xl font-bold text-ink">${current}</p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
            <TrendingDown className="size-4" aria-hidden="true" />
            {change}%
          </span>
          <div className="text-right">
            <p className="text-xs text-ink-subtle">Your target</p>
            <p className="text-2xl font-bold text-brand-600">${target}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2.5 text-sm text-brand-700">
          <BellRing className="size-4 shrink-0" aria-hidden="true" />
          Price dropped below your target. We notified you.
        </div>
      </div>

      <figcaption className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-subtle">
        <Info className="size-3.5" aria-hidden="true" />
        Illustrative example — not real flight data
      </figcaption>
    </figure>
  )
}
