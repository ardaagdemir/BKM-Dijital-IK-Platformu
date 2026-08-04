import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from '../modules/auth/pages/LoginPage'
import { ProtectedRoute } from '../modules/auth/ProtectedRoute'
import { AppShell } from './AppShell'
import { appRoutes } from './navigation'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    // Bölüm 13.2: AppShell TÜM korumalı route'ları saran bir layout route —
    // sayfa geçişlerinde KENDİSİ yeniden mount edilmez, yalnızca <Outlet/>
    // içeriği değişir.
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    // Bölüm 13.3: children DOĞRUDAN navigation.tsx'ten gelir — route ve menü
    // AYRI AYRI tanımlanmaz (bkz. appRoutes/navigationItems).
    children: appRoutes,
  },
])
