import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { buttonStyles } from '../components/ui/button-styles'
import FormAlert from '../components/ui/FormAlert'
import TextField from '../components/ui/TextField'
import AuthLayout from '../features/auth/AuthLayout'
import { getAuthErrorMessage } from '../features/auth/auth-errors'
import { validateEmail } from '../features/auth/validation'
import { useT } from '../features/preferences/preferences-context'
import { supabase } from '../lib/supabase'

export default function ForgotPasswordPage() {
  const t = useT()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string>()
  const [error, setError] = useState<string | null>(null)
  const [isSent, setIsSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationError = validateEmail(email)
    setEmailError(validationError)
    if (validationError) return

    setIsSubmitting(true)
    setError(null)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setIsSubmitting(false)

    if (resetError) setError(getAuthErrorMessage(resetError))
    else setIsSent(true)
  }

  return (
    <AuthLayout
      title={t('auth.forgot.title')}
      subtitle={t('auth.forgot.subtitle')}
      footer={
        <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
          {t('auth.backToLogin')}
        </Link>
      }
    >
      {isSent ? (
        // Same message whether or not an account exists, so this page can't be
        // used to find out which emails are registered.
        <FormAlert variant="success">
          {t('auth.forgot.sent', { email: email.trim() })}
        </FormAlert>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {error && <FormAlert variant="error">{error}</FormAlert>}
          <TextField
            label={t('auth.email')}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={emailError}
          />
          <button type="submit" disabled={isSubmitting} className={buttonStyles('primary', 'md', 'w-full')}>
            {t(isSubmitting ? 'auth.forgot.submitting' : 'auth.forgot.submit')}
          </button>
        </form>
      )}
    </AuthLayout>
  )
}
