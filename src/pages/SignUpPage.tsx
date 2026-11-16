import { MailCheck } from 'lucide-react'
import { Fragment, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { buttonStyles } from '../components/ui/button-styles'
import FormAlert from '../components/ui/FormAlert'
import PasswordField from '../components/ui/PasswordField'
import TextField from '../components/ui/TextField'
import AuthLayout from '../features/auth/AuthLayout'
import { getAuthErrorMessage } from '../features/auth/auth-errors'
import { MIN_PASSWORD_LENGTH, validateEmail, validateNewPassword } from '../features/auth/validation'
import { useT } from '../features/preferences/preferences-context'
import { LEGAL_VERSION } from '../features/legal/legal-config'
import { supabase } from '../lib/supabase'

export default function SignUpPage() {
  const t = useT()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; agreed?: string }>({})
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmationSentTo, setConfirmationSentTo] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const errors = {
      email: validateEmail(email),
      password: validateNewPassword(password),
      agreed: agreed ? undefined : t('auth.signup.agreeRequired'),
    }
    setFieldErrors(errors)
    if (errors.email || errors.password || errors.agreed) return

    setIsSubmitting(true)
    setError(null)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      // The confirmation email links back here; <GuestOnly> then forwards to the dashboard.
      // Which version of the Terms/Privacy Policy the user accepted, and when (proof of consent).
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: { terms_version: LEGAL_VERSION, terms_accepted_at: new Date().toISOString() },
      },
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
        <div>
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink-muted">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
              aria-invalid={Boolean(fieldErrors.agreed)}
              className="mt-0.5 size-4 shrink-0 accent-brand-600"
            />
            <span>
              {/* "{terms}" and "{privacy}" in the sentence become links (word order differs per language). */}
              {t('auth.signup.agree')
                .split(/(\{terms\}|\{privacy\})/)
                .map((part, index) =>
                  part === '{terms}' || part === '{privacy}' ? (
                    <Link
                      key={index}
                      to={part === '{terms}' ? '/terms' : '/privacy'}
                      target="_blank"
                      className="font-medium text-brand-600 underline"
                    >
                      {t(part === '{terms}' ? 'legal.terms' : 'legal.privacy')}
                    </Link>
                  ) : (
                    <Fragment key={index}>{part}</Fragment>
                  ),
                )}
            </span>
          </label>
          {fieldErrors.agreed && (
            <p className="mt-1.5 text-sm text-red-600" role="alert">
              {fieldErrors.agreed}
            </p>
          )}
        </div>
        <button type="submit" disabled={isSubmitting} className={buttonStyles('primary', 'md', 'w-full')}>
          {t(isSubmitting ? 'auth.signup.submitting' : 'auth.signup.submit')}
        </button>
      </form>
    </AuthLayout>
  )
}
