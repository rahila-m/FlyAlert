// Where to send a user after login, e.g. /login?redirect=/dashboard
//
// Security: only allow paths inside our own site. Without this check, a link
// like /login?redirect=https://evil.example would send users to another site
// right after they log in (an "open redirect" vulnerability).
export const DEFAULT_AFTER_LOGIN = '/dashboard'

export function getSafeRedirect(value: string | null | undefined): string {
  if (!value) return DEFAULT_AFTER_LOGIN
  const isRelativePath =
    value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\')
  return isRelativePath ? value : DEFAULT_AFTER_LOGIN
}
