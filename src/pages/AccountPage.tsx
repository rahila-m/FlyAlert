import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import Container from '../components/ui/Container'
import ChangePasswordForm from '../features/account/ChangePasswordForm'
import PreferencesForm from '../features/account/PreferencesForm'
import SettingsCard from '../features/account/SettingsCard'
import { useAuth } from '../features/auth/auth-context'
import { getLocaleTag } from '../i18n/locale'
import { useT } from '../features/preferences/preferences-context'

export default function AccountPage() {
  const t = useT()
  const { user } = useAuth()

  return (
    <div className="flex-1 bg-surface-muted">
      <Container className="max-w-3xl py-10">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t('account.back')}
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {t('dashboard.settings')}
        </h1>

        <div className="mt-8 space-y-6">
          <SettingsCard title={t('account.profile')}>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-ink-subtle">{t('auth.email')}</dt>
                <dd className="mt-1 font-medium break-all text-ink">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-ink-subtle">{t('account.memberSince')}</dt>
                <dd className="mt-1 font-medium text-ink">
                  {user?.created_at
                    ? new Intl.DateTimeFormat(getLocaleTag(), { dateStyle: 'long' }).format(new Date(user.created_at))
                    : '—'}
                </dd>
              </div>
            </dl>
          </SettingsCard>

          <SettingsCard title={t('account.preferences')} description={t('account.preferencesText')}>
            <PreferencesForm />
          </SettingsCard>

          <SettingsCard title={t('auth.password')} description={t('account.passwordText')}>
            <ChangePasswordForm />
          </SettingsCard>
        </div>
      </Container>
    </div>
  )
}
