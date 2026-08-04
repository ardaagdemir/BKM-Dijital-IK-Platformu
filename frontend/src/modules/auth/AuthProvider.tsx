import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { clearToken, getToken, setToken as persistToken } from '../../shared/api/apiClient'
import * as authApi from './api/authApi'

type AuthUser = {
  userId: number
  email: string
  fullName: string
  roles: string[]
}

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  isInitializing: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function validateExistingSession() {
      if (!getToken()) {
        setIsInitializing(false)
        return
      }
      try {
        // Tek çağrı: token geçerliliğini doğrular VE TopBar/menü için gereken
        // fullName+roles'ü getirir (bkz. 13.2 REST API).
        const profile = await authApi.getProfile()
        if (!cancelled) {
          setUser(profile)
        }
      } catch {
        // apiClient'ın 401 interceptor'ı token'ı zaten temizledi ve /login'e yönlendirdi.
      } finally {
        if (!cancelled) {
          setIsInitializing(false)
        }
      }
    }

    void validateExistingSession()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login(email, password)
    persistToken(response.token)
    // LoginResponse fullName/roles taşımaz (bkz. types.ts) — TopBar'ın
    // ihtiyaç duyduğu profil bilgisi için ayrıca /me çağrılır.
    const profile = await authApi.getProfile()
    setUser(profile)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      clearToken()
      setUser(null)
    }
  }, [])

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    isInitializing,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth, AuthProvider içinde kullanılmalıdır.')
  }
  return context
}
