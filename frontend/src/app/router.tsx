import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from '../modules/auth/pages/LoginPage'
import { ProtectedRoute } from '../modules/auth/ProtectedRoute'
import { CareersApplyPage } from '../modules/recruitment/pages/CareersApplyPage'
import { AppShell } from './AppShell'
import { appRoutes } from './navigation'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  // Bölüm 14.4 (US-05.2.1): `/login`'le AYNI üst-seviye kardeş — AppShell/
  // ProtectedRoute DIŞINDA, kimlik doğrulaması gerektirmez (bkz. sayfanın
  // KENDİ dosyasındaki not).
  { path: '/careers/apply', element: <CareersApplyPage /> },
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
