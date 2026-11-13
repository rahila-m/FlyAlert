import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { buttonStyles } from '../components/ui/button-styles'
import FormAlert from '../components/ui/FormAlert'
import TextField from '../components/ui/TextField'
import AuthLayout from '../features/auth/AuthLayout'
import { getAuthErrorMessage } from '../features/auth/auth-errors'
import { validateEmail } from '../features/auth/validation'
import { supabase } from '../lib/supabase'

export default function ForgotPasswordPage() {
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
      title="Reset your password"
      subtitle="Enter your email and we'll send you a link to choose a new password."
      footer={
        <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Back to log in
        </Link>
      }
    >
      {isSent ? (
        // Same message whether or not an account exists, so this page can't be
        // used to find out which emails are registered.
        <FormAlert variant="success">
          If an account exists for <strong>{email.trim()}</strong>, you&apos;ll receive a password
          reset link shortly. Check your spam folder if you don&apos;t see it.
        </FormAlert>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {error && <FormAlert variant="error">{error}</FormAlert>}
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={emailError}
          />
          <button type="submit" disabled={isSubmitting} className={buttonStyles('primary', 'md', 'w-full')}>
            {isSubmitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthLayout>
  )
}
