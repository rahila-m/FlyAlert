// Basic client-side checks for faster feedback.
// Supabase validates again on the server; these never replace server checks.

export const MIN_PASSWORD_LENGTH = 8

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return 'Enter your email address.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Enter a valid email address.'
  return undefined
}

export function validateNewPassword(password: string): string | undefined {
  if (!password) return 'Enter a password.'
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  return undefined
}
