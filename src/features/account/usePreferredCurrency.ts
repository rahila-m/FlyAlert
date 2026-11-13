import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/auth-context'

const DEFAULT_CURRENCY = 'USD'

// The logged-in user's preferred currency (from their profile), or USD for visitors.
// Returns null while it is still loading, so callers can wait before searching.
export function usePreferredCurrency(): string | null {
  const { user, isLoading } = useAuth()
  const [loaded, setLoaded] = useState<{ userId: string; currency: string } | null>(null)

  useEffect(() => {
    if (!user) return
    let isCancelled = false
    supabase
      .from('profiles')
      .select('preferred_currency')
      .single()
      .then(({ data }) => {
        if (!isCancelled) {
          setLoaded({ userId: user.id, currency: data?.preferred_currency ?? DEFAULT_CURRENCY })
        }
      })
    return () => {
      isCancelled = true
    }
  }, [user])

  if (isLoading) return null
  if (!user) return DEFAULT_CURRENCY
  return loaded?.userId === user.id ? loaded.currency : null
}
