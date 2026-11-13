import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import Container from '../components/ui/Container'
import ChangePasswordForm from '../features/account/ChangePasswordForm'
import PreferencesForm from '../features/account/PreferencesForm'
import SettingsCard from '../features/account/SettingsCard'
import { useAuth } from '../features/auth/auth-context'

export default function AccountPage() {
  const { user } = useAuth()

  return (
    <div className="flex-1 bg-surface-muted">
      <Container className="max-w-3xl py-10">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to dashboard
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Account settings
        </h1>

        <div className="mt-8 space-y-6">
          <SettingsCard title="Profile">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-ink-subtle">Email</dt>
                <dd className="mt-1 font-medium break-all text-ink">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-ink-subtle">Member since</dt>
                <dd className="mt-1 font-medium text-ink">
                  {user?.created_at
                    ? new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(user.created_at))
                    : '—'}
                </dd>
              </div>
            </dl>
          </SettingsCard>

          <SettingsCard title="Preferences" description="Choose how prices and the app are shown to you.">
            <PreferencesForm />
          </SettingsCard>

          <SettingsCard title="Password" description="Change the password you use to log in.">
            <ChangePasswordForm />
          </SettingsCard>
        </div>
      </Container>
    </div>
  )
}
