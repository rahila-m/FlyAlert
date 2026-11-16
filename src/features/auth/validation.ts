// Basic client-side checks for faster feedback.
// Supabase validates again on the server; these never replace server checks.

import { getActiveLanguage } from '../../i18n/locale'
import { translate, type MessageKey, type TranslateVars } from '../../i18n/translate'

export const MIN_PASSWORD_LENGTH = 8

const t = (key: MessageKey, vars?: TranslateVars) => translate(getActiveLanguage(), key, vars)

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return t('auth.error.emailEmpty')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return t('auth.error.emailInvalid')
  return undefined
}

export function validateNewPassword(password: string): string | undefined {
  if (!password) return t('auth.error.passwordEmpty')
  if (password.length < MIN_PASSWORD_LENGTH) {
    return t('auth.error.passwordShort', { min: MIN_PASSWORD_LENGTH })
  }
  return undefined
}
