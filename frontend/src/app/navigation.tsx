import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import type { ReactElement } from 'react'
import { Navigate, type RouteObject } from 'react-router-dom'
import { ProtectedRoute } from '../modules/auth/ProtectedRoute'
import { EmployeeCreatePage } from '../modules/organization/pages/EmployeeCreatePage'
import { EmployeeDetailPage } from '../modules/organization/pages/EmployeeDetailPage'
import { EmployeesListPage } from '../modules/organization/pages/EmployeesListPage'
import { JobTitlesPage } from '../modules/organization/pages/JobTitlesPage'
import { OrganizationLayout } from '../modules/organization/pages/OrganizationLayout'
import { UnitsPage } from '../modules/organization/pages/UnitsPage'
import { Forbidden } from './Forbidden'
import { HomePlaceholder } from './HomePlaceholder'

export type NavItem = {
  label: string
  path: string
  icon: ReactElement
  // undefined => oturum açmış HER rol görür. Bölüm 4.4: bu yalnızca görsel
  // bir filtredir, gerçek yetkilendirme her zaman backend'de uygulanır.
  roles?: string[]
}

export type RouteHandle = {
  // TopBar'daki sayfa başlığı (bkz. TopBar.tsx usePageTitle).
  title: string
  // Menüde GÖRÜNMESİ gereken route'lar bunu taşır; menüde YER ALMAMASI
  // gereken route'lar (ör. detay/düzenleme sayfaları) OMİT eder.
  nav?: Omit<NavItem, 'path'>
}

type AppRoute = RouteObject & {
  path: string
  handle: RouteHandle
}

// Bölüm 13.3: "Menü veri yapısı ... route tanımının kendisinden otomatik
// türetilmesi hedeflenir, elle iki kez yazılmaz." — bu liste hem router.tsx'in
// hem de menünün TEK ortak kaynağıdır; yeni bir modül route'u eklemek otomatik
// olarak menüye de ekler (ayrı bir menuConfig İCAT EDİLMEDİ).
export const appRoutes: AppRoute[] = [
  {
    path: '/',
    element: <HomePlaceholder />,
    handle: { title: 'Ana Sayfa', nav: { label: 'Ana Sayfa', icon: <HomeOutlinedIcon /> } },
  },
  {
    path: '/organization',
    // Bölüm 13.4: görüntüleme/oluşturma yalnızca ADMIN/IK — backend'de bu
    // uçlarda @PreAuthorize YOK (bilinen kısıt, bkz. 0.5 Frontend Blokerleri
    // satır 3); bu GÖRSEL bir sınırdır, gerçek yetkilendirme backend'de değil.
    element: (
      <ProtectedRoute roles={['ADMIN', 'IK']}>
        <OrganizationLayout />
      </ProtectedRoute>
    ),
    handle: {
      title: 'Organizasyon',
      nav: { label: 'Organizasyon', icon: <ApartmentOutlinedIcon />, roles: ['ADMIN', 'IK'] },
    },
    children: [
      { index: true, element: <Navigate to="units" replace /> },
      { path: 'units', element: <UnitsPage />, handle: { title: 'Organizasyon Birimleri' } },
      { path: 'job-titles', element: <JobTitlesPage />, handle: { title: 'Unvanlar' } },
      // Bölüm 13.6: filtrelenebilir/sayfalanmış liste. Tam düzenleme/atama
      // sekmeleri (13.7) SONRAKİ bölüm.
      { path: 'employees', element: <EmployeesListPage />, handle: { title: 'Çalışanlar' } },
      { path: 'employees/new', element: <EmployeeCreatePage />, handle: { title: 'Yeni Çalışan' } },
      { path: 'employees/:id', element: <EmployeeDetailPage />, handle: { title: 'Çalışan Detayı' } },
    ],
  },
  {
    path: '/403',
    element: <Forbidden />,
    handle: { title: 'Yetkisiz Erişim' },
  },
]

export const navigationItems: NavItem[] = appRoutes
  .filter((route): route is AppRoute & { handle: { nav: Omit<NavItem, 'path'> } } => !!route.handle.nav)
  .map((route) => ({ ...route.handle.nav, path: route.path }))

export function filterNavItemsByRoles(items: NavItem[], userRoles: string[]): NavItem[] {
  return items.filter((item) => !item.roles || item.roles.some((role) => userRoles.includes(role)))
}
