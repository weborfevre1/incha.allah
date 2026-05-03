import { createContext, useContext, type ReactNode } from 'react'
import { useSupabaseAuth } from '../hooks/useSupabase'
import type { SupabaseUser } from '../types'

interface AuthContextValue {
  user: SupabaseUser | null
  loading: boolean
  error: string | null
  signUp: (email: string, password: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<any>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useSupabaseAuth()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
