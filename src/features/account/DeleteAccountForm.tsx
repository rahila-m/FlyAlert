import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { buttonStyles } from '../../components/ui/button-styles'
import FormAlert from '../../components/ui/FormAlert'
import TextField from '../../components/ui/TextField'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/auth-context'
import { useT } from '../preferences/preferences-context'
import { disablePush } from '../push/push'

// Permanently deletes the user's account and all their data (required by
// KVKK/GDPR and by the App Store / Google Play). To avoid accidents the user
// types their email address to confirm.
export default function DeleteAccountForm() {
  const t = useT()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isConfirming, setIsConfirming] = useState(false)
  const [typedEmail, setTypedEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const email = user?.email ?? ''
  const matches = typedEmail.trim().toLowerCase() === email.toLowerCase() && email !== ''

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!matches) return
    setIsDeleting(true)
    setError(null)
    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (!token) throw new Error('no session')

      // Stop phone notifications on this device too (the server row is deleted with the account).
      await disablePush().catch(() => {})

      const response = await fetch('/api/account/delete', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      if (!response.ok) throw new Error(`status ${response.status}`)

      await supabase.auth.signOut({ scope: 'local' })
      navigate('/?account=deleted', { replace: true })
    } catch {
      setError(t('account.deleteError'))
      setIsDeleting(false)
    }
  }

  if (!isConfirming) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-ink-muted">{t('account.deleteText')}</p>
        <button type="button" onClick={() => setIsConfirming(true)} className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50">
          {t('account.deleteButton')}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <FormAlert variant="error">{t('account.deleteWarning')}</FormAlert>
      {error && <FormAlert variant="error">{error}</FormAlert>}
      <TextField
        label={t('account.deleteConfirmLabel', { email })}
        type="email"
        autoComplete="off"
        value={typedEmail}
        onChange={(event) => setTypedEmail(event.target.value)}
        className="sm:max-w-sm"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={!matches || isDeleting}
          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-40"
        >
          {t(isDeleting ? 'account.deleting' : 'account.deleteForever')}
        </button>
        <button type="button" onClick={() => setIsConfirming(false)} disabled={isDeleting} className={buttonStyles('ghost', 'sm')}>
          {t('common.cancel')}
        </button>
      </div>
    </form>
  )
}
