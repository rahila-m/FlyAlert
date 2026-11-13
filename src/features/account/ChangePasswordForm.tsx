import { useState, type FormEvent } from 'react'
import { buttonStyles } from '../../components/ui/button-styles'
import FormAlert from '../../components/ui/FormAlert'
import PasswordField from '../../components/ui/PasswordField'
import { supabase } from '../../lib/supabase'
import { getAuthErrorMessage } from '../auth/auth-errors'
import { MIN_PASSWORD_LENGTH, validateNewPassword } from '../auth/validation'

export default function ChangePasswordForm() {
  const [password, setPassword] = useState('')
  const [fieldError, setFieldError] = useState<string>()
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationError = validateNewPassword(password)
    setFieldError(validationError)
    setIsSaved(false)
    if (validationError) return

    setIsSubmitting(true)
    setError(null)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setIsSubmitting(false)

    if (updateError) {
      setError(getAuthErrorMessage(updateError))
      return
    }
    setPassword('')
    setIsSaved(true)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {isSaved && <FormAlert variant="success">Your password has been changed.</FormAlert>}
      {error && <FormAlert variant="error">{error}</FormAlert>}
      <PasswordField
        label="New password"
        autoComplete="new-password"
        value={password}
        onChange={(event) => {
          setPassword(event.target.value)
          setIsSaved(false)
        }}
        error={fieldError}
        hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        className="sm:max-w-sm"
      />
      <button type="submit" disabled={isSubmitting} className={buttonStyles('secondary', 'md')}>
        {isSubmitting ? 'Updating…' : 'Update password'}
      </button>
    </form>
  )
}
