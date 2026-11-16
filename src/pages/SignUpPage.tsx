import { MailCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { buttonStyles } from '../components/ui/button-styles'
import FormAlert from '../components/ui/FormAlert'
import PasswordField from '../components/ui/PasswordField'
import TextField from '../components/ui/TextField'
import AuthLayout from '../features/auth/AuthLayout'
import { getAuthErrorMessage } from '../features/auth/auth-errors'
import { MIN_PASSWORD_LENGTH, validateEmail, validateNewPassword } from '../features/auth/validation'
import { useT } from '../features/preferences/preferences-context'
import { supabase } from '../lib/supabase'

export default function SignUpPage() {
  const t = useT()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmationSentTo, setConfirmationSentTo] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const errors = { email: validateEmail(email), password: validateNewPassword(password) }
    setFieldErrors(errors)
    if (errors.email || errors.password) return

    setIsSubmitting(true)
    setError(null)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      // The confirmation email links back here; <GuestOnly> then forwards to the dashboard.
      options: { emailRedirectTo: `${window.location.origin}/login` },
    })
    setIsSubmitting(false)

    if (signUpError) {
      setError(getAuthErrorMessage(signUpError))
      return
    }
    // With email confirmation on, there is no session yet.
    // (For privacy, Supabase gives the same answer if the email is already registered.)
    if (!data.session) setConfirmationSentTo(email.trim())
  }

  if (confirmationSentTo) {
    return (
      <AuthLayout title={t('auth.signup.checkInbox')}>
        <div className="text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <MailCheck className="size-6" aria-hidden="true" />
          </span>
          <p className="mt-4 text-sm text-ink-muted">
            {t('auth.signup.sentTo')}{' '}
            <strong className="font-semibold text-ink">{confirmationSentTo}</strong>. {t('auth.signup.sentHint')}
          </p>
          <Link to="/login" className={buttonStyles('secondary', 'md', 'mt-6 w-full')}>
            {t('auth.backToLogin')}
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title={t('auth.signup.title')}
      subtitle={t('auth.signup.subtitle')}
      footer={
        <>
          {t('auth.signup.haveAccount')}{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            {t('auth.login.submit')}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {error && <FormAlert variant="error">{error}</FormAlert>}
        <TextField
          label={t('auth.email')}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldErrors.email}
        />
        <PasswordField
          label={t('auth.password')}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
          hint={t('auth.passwordHint', { min: MIN_PASSWORD_LENGTH })}
        />
        <button type="submit" disabled={isSubmitting} className={buttonStyles('primary', 'md', 'w-full')}>
          {t(isSubmitting ? 'auth.signup.submitting' : 'auth.signup.submit')}
        </button>
      </form>
    </AuthLayout>
  )
}
