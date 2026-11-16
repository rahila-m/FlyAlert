import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import { buttonStyles } from '../components/ui/button-styles'
import FormAlert from '../components/ui/FormAlert'
import PasswordField from '../components/ui/PasswordField'
import TextField from '../components/ui/TextField'
import AuthLayout from '../features/auth/AuthLayout'
import { getAuthErrorMessage, getLinkErrorFromUrl } from '../features/auth/auth-errors'
import { validateEmail } from '../features/auth/validation'
import { useT } from '../features/preferences/preferences-context'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const t = useT()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  // An expired/invalid confirmation link sends the user here with an error in the URL.
  const [error, setError] = useState<string | null>(getLinkErrorFromUrl)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const errors = {
      email: validateEmail(email),
      password: password ? undefined : t('auth.error.passwordEmpty'),
    }
    setFieldErrors(errors)
    if (errors.email || errors.password) return

    setIsSubmitting(true)
    setError(null)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setIsSubmitting(false)
    if (signInError) setError(getAuthErrorMessage(signInError))
    // On success the session changes and <GuestOnly> redirects automatically.
  }

  const redirect = searchParams.get('redirect')
  const signUpLink = redirect ? `/signup?redirect=${encodeURIComponent(redirect)}` : '/signup'

  return (
    <AuthLayout
      title={t('auth.login.title')}
      subtitle={t('auth.login.subtitle')}
      footer={
        <>
          {t('auth.login.noAccount')}{' '}
          <Link to={signUpLink} className="font-medium text-brand-600 hover:text-brand-700">
            {t('auth.login.signUp')}
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
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
          labelAction={
            <Link to="/forgot-password" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              {t('auth.login.forgot')}
            </Link>
          }
        />
        <button type="submit" disabled={isSubmitting} className={buttonStyles('primary', 'md', 'w-full')}>
          {t(isSubmitting ? 'auth.login.submitting' : 'auth.login.submit')}
        </button>
      </form>
    </AuthLayout>
  )
}
