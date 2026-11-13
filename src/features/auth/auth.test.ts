import { AuthApiError } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'
import { getAuthErrorMessage } from './auth-errors'
import { DEFAULT_AFTER_LOGIN, getSafeRedirect } from './redirect'
import { validateEmail, validateNewPassword } from './validation'

describe('getSafeRedirect', () => {
  it('allows paths on our own site', () => {
    expect(getSafeRedirect('/dashboard')).toBe('/dashboard')
    expect(getSafeRedirect('/search?from=IST')).toBe('/search?from=IST')
  })

  it('blocks redirects to other websites (open redirect)', () => {
    expect(getSafeRedirect('https://evil.example')).toBe(DEFAULT_AFTER_LOGIN)
    expect(getSafeRedirect('//evil.example')).toBe(DEFAULT_AFTER_LOGIN)
    expect(getSafeRedirect('/\\evil.example')).toBe(DEFAULT_AFTER_LOGIN)
    expect(getSafeRedirect('javascript:alert(1)')).toBe(DEFAULT_AFTER_LOGIN)
  })

  it('falls back to the dashboard when empty', () => {
    expect(getSafeRedirect(null)).toBe(DEFAULT_AFTER_LOGIN)
    expect(getSafeRedirect('')).toBe(DEFAULT_AFTER_LOGIN)
  })
})

describe('validation', () => {
  it('checks email format', () => {
    expect(validateEmail('')).toBeDefined()
    expect(validateEmail('not-an-email')).toBeDefined()
    expect(validateEmail(' user@example.com ')).toBeUndefined()
  })

  it('requires passwords of at least 8 characters', () => {
    expect(validateNewPassword('')).toBeDefined()
    expect(validateNewPassword('1234567')).toBeDefined()
    expect(validateNewPassword('12345678')).toBeUndefined()
  })
})

describe('getAuthErrorMessage', () => {
  it('translates known Supabase error codes', () => {
    const error = new AuthApiError('Invalid login credentials', 400, 'invalid_credentials')
    expect(getAuthErrorMessage(error)).toBe('Incorrect email or password.')
  })

  it('never shows raw technical messages for unknown errors', () => {
    const error = new AuthApiError('pq: internal db failure xyz', 500, 'unexpected_failure')
    expect(getAuthErrorMessage(error)).toBe('Something went wrong. Please try again.')
  })
})
