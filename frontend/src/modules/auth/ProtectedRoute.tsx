import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { AppShellSkeleton } from '../../app/AppShellSkeleton'
import { useAuth } from './AuthProvider'

type ProtectedRouteProps = {
  children: ReactNode
  // Bölüm 5.2: "roles prop'u ile route'u sarmalar; giriş yoksa /login'e, rol
  // uyuşmuyorsa /403'e yönlendirir." — yalnızca GÖRSEL bir sınır (bkz.
  // Bölüm 4.4), gerçek yetkilendirme her zaman backend'de.
  roles?: string[]
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, isInitializing, user } = useAuth()

  if (isInitializing) {
    return <AppShellSkeleton />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.some((role) => user?.roles.includes(role))) {
    return <Navigate to="/403" replace />
  }

  return <>{children}</>
}
