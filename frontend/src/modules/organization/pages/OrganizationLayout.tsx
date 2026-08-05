import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'

const TABS = [
  { label: 'Birimler', path: '/organization/units' },
  { label: 'Unvanlar', path: '/organization/job-titles' },
  { label: 'Çalışanlar', path: '/organization/employees' },
]

// Bölüm 13.4 Kapsam notu: Birimler + Unvanlar "TEK bir Organizasyon bölümü
// altında, İKİ sekme/route" — bu yüzden menüde TEK bir "Organizasyon" girişi
// var (bkz. navigation.tsx), ayrım burada sekme olarak yapılıyor.
export function OrganizationLayout() {
  const location = useLocation()
  const { user } = useAuth()
  const activeTab = TABS.find((tab) => location.pathname.startsWith(tab.path))?.path ?? TABS[0].path
  // Bölüm 13.7: bu üç sekme ADMIN/IK-ONLY route'lara gider (bkz.
  // navigation.tsx) — self-servis olarak `employees/:id`'ye ulaşan bir
  // CALISAN için gösterilirse tıklandığında /403'e düşer; bu yüzden sekme
  // çubuğu TAMAMEN gizlenir, yalnızca içerik (Outlet) render edilir.
  const canManageOrganization = !!user?.roles.some((role) => role === 'ADMIN' || role === 'IK')

  return (
    <Box>
      {canManageOrganization && (
        <Tabs value={activeTab} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          {TABS.map((tab) => (
            <Tab key={tab.path} label={tab.label} value={tab.path} component={Link} to={tab.path} />
          ))}
        </Tabs>
      )}
      <Outlet />
    </Box>
  )
}
