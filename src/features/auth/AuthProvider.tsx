import type { Session } from '@supabase/supabase-js'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '../../lib/supabase'
import { AuthContext } from './auth-context'

// Keeps track of the current session and shares it with the whole app.
// Supabase stores the session in the browser and refreshes it automatically;
// we only listen for changes (login, logout, token refresh, password recovery).
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fires immediately with the stored session ("INITIAL_SESSION"),
    // then again on every change.
    // Note: don't call other Supabase functions inside this callback (can deadlock).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setIsLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const value = useMemo(
    () => ({ session, user: session?.user ?? null, isLoading }),
    [session, isLoading],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
