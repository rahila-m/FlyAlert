import { isAuthError } from '@supabase/supabase-js'

// Turns Supabase error codes into clear messages for users.
// Technical details are never shown in the UI.
const MESSAGES: Record<string, string> = {
  invalid_credentials: 'Incorrect email or password.',
  email_not_confirmed:
    'Please confirm your email address first. Check your inbox for the confirmation link.',
  user_already_exists: 'An account with this email already exists. Try logging in instead.',
  email_exists: 'An account with this email already exists. Try logging in instead.',
  weak_password: 'This password is too weak. Please choose a longer, less common password.',
  same_password: 'Your new password must be different from your current password.',
  over_email_send_rate_limit:
    'Too many emails have been sent recently. Please wait a while and try again.',
  over_request_rate_limit: 'Too many attempts. Please wait a moment and try again.',
  email_address_invalid: 'Please enter a valid email address.',
  email_address_not_authorized:
    "We can't send emails to this address yet. During development, only project team members can receive emails.",
  signup_disabled: 'New sign ups are currently disabled.',
  otp_expired: 'This link is invalid or has expired. Please request a new one.',
  session_not_found: 'Your session has expired. Please log in again.',
}

export function getAuthErrorMessage(error: unknown): string {
  if (isAuthError(error) && error.code && MESSAGES[error.code]) {
    return MESSAGES[error.code]
  }
  if (error instanceof Error && /fetch|network/i.test(error.message)) {
    return 'Could not reach the server. Check your internet connection and try again.'
  }
  return 'Something went wrong. Please try again.'
}

// Errors from email links arrive in the URL hash, e.g.
// #error=access_denied&error_code=otp_expired&error_description=...
export function getLinkErrorFromUrl(): string | null {
  const params = new URLSearchParams(window.location.hash.slice(1))
  const code = params.get('error_code')
  if (!code && !params.get('error')) return null
  return (code && MESSAGES[code]) ?? 'This link is invalid or has expired. Please request a new one.'
}
