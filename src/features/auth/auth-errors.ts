import { isAuthError } from '@supabase/supabase-js'
import { getActiveLanguage } from '../../i18n/locale'
import { translate, type MessageKey } from '../../i18n/translate'

// Turns Supabase error codes into clear messages for users.
// Technical details are never shown in the UI.
// Messages are text keys, shown in the user's current language.
const MESSAGES: Record<string, MessageKey> = {
  invalid_credentials: 'auth.error.invalidCredentials',
  email_not_confirmed: 'auth.error.notConfirmed',
  user_already_exists: 'auth.error.exists',
  email_exists: 'auth.error.exists',
  weak_password: 'auth.error.weakPassword',
  same_password: 'auth.error.samePassword',
  over_email_send_rate_limit: 'auth.error.emailRateLimit',
  over_request_rate_limit: 'auth.error.rateLimit',
  email_address_invalid: 'auth.error.emailInvalid',
  email_address_not_authorized: 'auth.error.emailNotAuthorized',
  signup_disabled: 'auth.error.signupDisabled',
  otp_expired: 'auth.error.linkExpired',
  session_not_found: 'auth.error.sessionExpired',
  reauthentication_needed: 'auth.error.reauth',
}

const t = (key: MessageKey) => translate(getActiveLanguage(), key)

export function getAuthErrorMessage(error: unknown): string {
  if (isAuthError(error) && error.code && MESSAGES[error.code]) {
    return t(MESSAGES[error.code])
  }
  if (error instanceof Error && /fetch|network/i.test(error.message)) {
    return t('auth.error.network')
  }
  return t('common.genericError')
}

// Errors from email links arrive in the URL hash, e.g.
// #error=access_denied&error_code=otp_expired&error_description=...
export function getLinkErrorFromUrl(): string | null {
  const params = new URLSearchParams(window.location.hash.slice(1))
  const code = params.get('error_code')
  if (!code && !params.get('error')) return null
  return t((code && MESSAGES[code]) || 'auth.error.linkExpired')
}
