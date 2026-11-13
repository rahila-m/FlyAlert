import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { buttonStyles } from '../components/ui/button-styles'
import FormAlert from '../components/ui/FormAlert'
import PageLoader from '../components/ui/PageLoader'
import PasswordField from '../components/ui/PasswordField'
import { useAuth } from '../features/auth/auth-context'
import AuthLayout from '../features/auth/AuthLayout'
import { getAuthErrorMessage, getLinkErrorFromUrl } from '../features/auth/auth-errors'
import { MIN_PASSWORD_LENGTH, validateNewPassword } from '../features/auth/validation'
import { supabase } from '../lib/supabase'

// Opened from the password reset email. The link logs the user in with a
// short-lived session, which allows setting a new password here.
export default function ResetPasswordPage() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [linkError] = useState(getLinkErrorFromUrl)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string>()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationError = validateNewPassword(password)
    setPasswordError(validationError)
    if (validationError) return

    setIsSubmitting(true)
    setError(null)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setIsSubmitting(false)

    if (updateError) setError(getAuthErrorMessage(updateError))
    else setIsDone(true)
  }

  if (isLoading) return <PageLoader />

  if (linkError || !user) {
    return (
      <AuthLayout title="Link expired">
        <FormAlert variant="error">
          {linkError ?? 'This password reset link is invalid or has expired.'}
        </FormAlert>
        <Link to="/forgot-password" className={buttonStyles('primary', 'md', 'mt-6 w-full')}>
          Request a new link
        </Link>
      </AuthLayout>
    )
  }

  if (isDone) {
    return (
      <AuthLayout title="Password updated">
        <FormAlert variant="success">Your password has been changed successfully.</FormAlert>
        <button
          type="button"
          onClick={() => navigate('/dashboard', { replace: true })}
          className={buttonStyles('primary', 'md', 'mt-6 w-full')}
        >
          Go to dashboard
        </button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Choose a new password" subtitle={`For ${user.email}`}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {error && <FormAlert variant="error">{error}</FormAlert>}
        <PasswordField
          label="New password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={passwordError}
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        />
        <button type="submit" disabled={isSubmitting} className={buttonStyles('primary', 'md', 'w-full')}>
          {isSubmitting ? 'Saving…' : 'Update password'}
        </button>
      </form>
    </AuthLayout>
  )
}
