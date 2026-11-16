import { useId, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getLocaleTag } from '../../i18n/locale'
import { formatPrice } from '../../lib/format'
import { useT } from '../preferences/preferences-context'
import type { PricePoint } from './price-history'

// Chart colors come from our design tokens, so they follow the theme (and dark mode later).
const SERIES_COLOR = 'var(--color-brand-600)'
const TARGET_COLOR = 'var(--color-ink-subtle)'
const GRID_COLOR = 'var(--color-line)'
const AXIS_TEXT = 'var(--color-ink-subtle)'
const SURFACE = 'var(--color-surface)'

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat(getLocaleTag(), { month: 'short', day: 'numeric' }).format(new Date(iso))
const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat(getLocaleTag(), { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso),
  )

// Compact axis numbers: 7,800 under 10,000; 12K above.
const formatAxis = (value: number) =>
  value >= 10_000
    ? new Intl.NumberFormat(getLocaleTag(), { notation: 'compact', maximumFractionDigits: 1 }).format(value)
    : new Intl.NumberFormat(getLocaleTag(), { maximumFractionDigits: 0 }).format(value)

// Round axis ticks (e.g. 6,500 / 7,000 / 7,500) around the given range.
function niceTicks(min: number, max: number, count = 4): number[] {
  const rawStep = Math.max((max - min) / count, 1)
  const magnitude = 10 ** Math.floor(Math.log10(rawStep))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rawStep) ?? 10 * magnitude
  const start = Math.max(0, Math.floor(min / step) * step)
  const end = Math.ceil(max / step) * step
  const ticks: number[] = []
  for (let value = start; value <= end + step / 2; value += step) ticks.push(Math.round(value))
  return ticks
}

interface TooltipProps {
  active?: boolean
  payload?: { payload: PricePoint }[]
  currency: string
}

function ChartTooltip({ active, payload, currency }: TooltipProps) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-md">
      <p className="text-ink-muted">{formatDateTime(point.checkedAt)}</p>
      <p className="mt-0.5 font-semibold text-ink">{formatPrice(point.price, currency)}</p>
    </div>
  )
}

// Price history for one alert. Only real, recorded prices are drawn: nothing is
// interpolated or invented between checks.
export default function PriceHistoryChart({
  history,
  targetPrice,
  currency,
}: {
  history: PricePoint[]
  targetPrice: number
  currency: string
}) {
  const t = useT()
  const [showTable, setShowTable] = useState(false)
  const tableId = useId()
  const prices = history.map((point) => point.price)
  // Keep the target line visible even when all prices are far above it.
  const min = Math.min(targetPrice, ...prices)
  const max = Math.max(targetPrice, ...prices)
  const padding = Math.max((max - min) * 0.15, max * 0.05)
  const ticks = niceTicks(min - padding, max + padding)

  return (
    <figure className="mt-2">
      <div className="h-48 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={GRID_COLOR} strokeWidth={1} vertical={false} />
            <XAxis
              dataKey="checkedAt"
              tickFormatter={formatDate}
              tick={{ fill: AXIS_TEXT, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: GRID_COLOR }}
              minTickGap={24}
            />
            <YAxis
              domain={[ticks[0], ticks[ticks.length - 1]]}
              ticks={ticks}
              tickFormatter={formatAxis}
              tick={{ fill: AXIS_TEXT, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <ReferenceLine
              y={targetPrice}
              stroke={TARGET_COLOR}
              strokeDasharray="4 4"
              label={{ value: t('alerts.targetLine'), position: 'insideTopRight', fill: AXIS_TEXT, fontSize: 11 }}
            />
            <Tooltip
              content={<ChartTooltip currency={currency} />}
              cursor={{ stroke: GRID_COLOR, strokeWidth: 1 }}
            />
            <Line
              type="linear"
              dataKey="price"
              stroke={SERIES_COLOR}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={{ r: 4, fill: SERIES_COLOR, stroke: SURFACE, strokeWidth: 2 }}
              activeDot={{ r: 5, fill: SERIES_COLOR, stroke: SURFACE, strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <figcaption className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-subtle">
        <span>
          {history.length === 1
            ? t('chart.onePoint')
            : t('chart.points', { count: history.length })}
        </span>
        <button
          type="button"
          aria-expanded={showTable}
          aria-controls={tableId}
          onClick={() => setShowTable((open) => !open)}
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          {t(showTable ? 'chart.hideTable' : 'chart.showTable')}
        </button>
      </figcaption>

      {/* The same data as a table: readable by screen readers and without color. */}
      <table id={tableId} className={showTable ? 'mt-2 w-full text-left text-xs' : 'sr-only'}>
        <caption className="sr-only">{t('chart.caption')}</caption>
        <thead>
          <tr className="border-b border-line text-ink-subtle">
            <th scope="col" className="py-1.5 font-medium">{t('chart.checked')}</th>
            <th scope="col" className="py-1.5 text-right font-medium">{t('chart.price')}</th>
          </tr>
        </thead>
        <tbody>
          {[...history].reverse().map((point) => (
            <tr key={point.checkedAt} className="border-b border-line/60 text-ink">
              <td className="py-1.5">{formatDateTime(point.checkedAt)}</td>
              <td className="py-1.5 text-right font-medium">{formatPrice(point.price, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
