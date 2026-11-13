import { BellRing, Coins, Languages, Search } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { buttonStyles } from '../components/ui/button-styles'
import Container from '../components/ui/Container'
import FormAlert from '../components/ui/FormAlert'
import { useAuth } from '../features/auth/auth-context'
import { supabase } from '../lib/supabase'

interface DashboardData {
  preferredCurrency: string
  preferredLanguage: string
  maxActiveAlerts: number
  activeAlerts: number
}

const LANGUAGE_NAMES: Record<string, string> = { en: 'English', tr: 'Türkçe' }

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

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false

    async function load() {
      // Row Level Security makes these queries return only this user's rows.
      const [profileResult, alertsResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('preferred_currency, preferred_language, max_active_alerts')
          .single(),
        supabase
          .from('flight_alerts')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true),
      ])
      if (isCancelled) return

      if (profileResult.error || alertsResult.error) {
        setError('We could not load your account data. Please refresh the page.')
        return
      }
      setData({
        preferredCurrency: profileResult.data.preferred_currency,
        preferredLanguage: profileResult.data.preferred_language,
        maxActiveAlerts: profileResult.data.max_active_alerts,
        activeAlerts: alertsResult.count ?? 0,
      })
    }

    load()
    return () => {
      isCancelled = true // ignore results if the user leaves the page first
    }
  }, [])

  return (
    <div className="flex-1 bg-surface-muted">
      <Container className="py-10">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-muted">Signed in as {user?.email}</p>

        <div className="mt-8">
          {error && <FormAlert variant="error">{error}</FormAlert>}
          {!error && (
            <div className="grid gap-4 sm:grid-cols-3" aria-busy={!data}>
              <StatCard
                icon={<BellRing className="size-4" aria-hidden="true" />}
                label="Active alerts"
                value={data ? `${data.activeAlerts} / ${data.maxActiveAlerts}` : '…'}
              />
              <StatCard
                icon={<Coins className="size-4" aria-hidden="true" />}
                label="Preferred currency"
                value={data?.preferredCurrency ?? '…'}
              />
              <StatCard
                icon={<Languages className="size-4" aria-hidden="true" />}
                label="Language"
                value={data ? (LANGUAGE_NAMES[data.preferredLanguage] ?? data.preferredLanguage) : '…'}
              />
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center">
          <BellRing className="size-8 text-ink-subtle" aria-hidden="true" />
          <h2 className="mt-4 font-semibold text-ink">No price alerts yet</h2>
          <p className="mt-1 max-w-sm text-sm text-ink-muted">
            Search for a flight to start tracking its price. Creating alerts is coming in the next step.
          </p>
          <Link to="/search" className={buttonStyles('primary', 'md', 'mt-6')}>
            <Search className="size-4" aria-hidden="true" />
            Search flights
          </Link>
        </div>
      </Container>
    </div>
  )
}
