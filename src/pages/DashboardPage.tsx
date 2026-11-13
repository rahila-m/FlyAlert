import { BellRing, Coins, Languages, Search, Settings } from 'lucide-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { buttonStyles } from '../components/ui/button-styles'
import Container from '../components/ui/Container'
import FormAlert from '../components/ui/FormAlert'
import AlertCard from '../features/alerts/AlertCard'
import { listAlerts, listPriceChecks, type FlightAlert } from '../features/alerts/alerts-api'
import { groupByAlert, type PriceCheck } from '../features/alerts/price-history'
import { useAuth } from '../features/auth/auth-context'
import { getLanguageName } from '../lib/preferences'
import { supabase } from '../lib/supabase'

interface DashboardData {
  preferredCurrency: string
  preferredLanguage: string
  maxActiveAlerts: number
  alerts: FlightAlert[]
  checksByAlert: Map<string, PriceCheck[]>
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-ink-muted">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
    </div>
  )
}

async function loadDashboard(): Promise<DashboardData> {
  // Row Level Security makes these queries return only this user's rows.
  const [profileResult, alerts] = await Promise.all([
    supabase.from('profiles').select('preferred_currency, preferred_language, max_active_alerts').single(),
    listAlerts(),
  ])
  if (profileResult.error) throw profileResult.error
  const checks = await listPriceChecks(alerts.map((alert) => alert.id))
  return {
    preferredCurrency: profileResult.data.preferred_currency,
    preferredLanguage: profileResult.data.preferred_language,
    maxActiveAlerts: profileResult.data.max_active_alerts,
    alerts,
    checksByAlert: groupByAlert(checks),
  }
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0) // increase to reload after a change
  const reload = useCallback(() => setVersion((v) => v + 1), [])

  useEffect(() => {
    let isCancelled = false
    loadDashboard()
      .then((result) => {
        if (!isCancelled) setData(result)
      })
      .catch(() => {
        if (!isCancelled) setError('We could not load your account data. Please refresh the page.')
      })
    return () => {
      isCancelled = true // ignore results if the user leaves the page first
    }
  }, [version])

  const activeCount = data?.alerts.filter((alert) => alert.is_active).length ?? 0

  return (
    <div className="flex-1 bg-surface-muted">
      <Container className="py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Dashboard</h1>
            <p className="mt-1 text-sm text-ink-muted">Signed in as {user?.email}</p>
          </div>
          <Link to="/account" className={buttonStyles('secondary', 'sm')}>
            <Settings className="size-4" aria-hidden="true" />
            Account settings
          </Link>
        </div>

        {error && (
          <div className="mt-8">
            <FormAlert variant="error">{error}</FormAlert>
          </div>
        )}

        {!error && (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3" aria-busy={!data}>
              <StatCard
                icon={<BellRing className="size-4" aria-hidden="true" />}
                label="Active alerts"
                value={data ? `${activeCount} / ${data.maxActiveAlerts}` : '…'}
              />
              <StatCard
                icon={<Coins className="size-4" aria-hidden="true" />}
                label="Preferred currency"
                value={data?.preferredCurrency ?? '…'}
              />
              <StatCard
                icon={<Languages className="size-4" aria-hidden="true" />}
                label="Language"
                value={data ? getLanguageName(data.preferredLanguage) : '…'}
              />
            </div>

            <section aria-labelledby="alerts-heading" className="mt-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="alerts-heading" className="text-lg font-semibold text-ink">
                  Your price alerts
                </h2>
                {data && data.alerts.length > 0 && (
                  <Link to="/search" className={buttonStyles('secondary', 'sm')}>
                    <Search className="size-4" aria-hidden="true" />
                    Track another trip
                  </Link>
                )}
              </div>

              {data && data.alerts.length > 0 && (
                <ul className="mt-4 grid gap-4 lg:grid-cols-2">
                  {data.alerts.map((alert) => (
                    <li key={alert.id}>
                      <AlertCard
                        alert={alert}
                        checks={data.checksByAlert.get(alert.id) ?? []}
                        onChanged={reload}
                      />
                    </li>
                  ))}
                </ul>
              )}

              {data && data.alerts.length === 0 && (
                <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center">
                  <BellRing className="size-8 text-ink-subtle" aria-hidden="true" />
                  <h3 className="mt-4 font-semibold text-ink">No price alerts yet</h3>
                  <p className="mt-1 max-w-sm text-sm text-ink-muted">
                    Search for a trip and press <strong>Track price</strong> to get notified when the fare drops.
                  </p>
                  <Link to="/search" className={buttonStyles('primary', 'md', 'mt-6')}>
                    <Search className="size-4" aria-hidden="true" />
                    Search flights
                  </Link>
                </div>
              )}
            </section>
          </>
        )}
      </Container>
    </div>
  )
}
