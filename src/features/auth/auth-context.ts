import type { Session, User } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'

export interface AuthState {
  session: Session | null
  user: User | null
  // True until Supabase has told us whether someone is logged in.
  isLoading: boolean
}

export const AuthContext = createContext<AuthState | null>(null)

// Gives any component access to the logged-in user.
export function useAuth(): AuthState {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
