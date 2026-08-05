import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { Link, Outlet, useLocation } from 'react-router-dom'

const TABS = [
  { label: 'Hedefler', path: '/performance/goals' },
  { label: 'Yetkinlikler', path: '/performance/competencies' },
  { label: 'Puanlama ve Ağırlıklandırma', path: '/performance/rating-scale' },
]

// `organization.OrganizationLayout`'daki AYNI desen (bkz. o dosyadaki
// gerekçe) — Hedefler/Yetkinlikler/Puanlama ayarları TEK bir "Performans
// Ayarları" bölümü altında, ÜÇ sekme/route. Bu route'ların TAMAMI ADMIN/IK
// (bkz. navigation.tsx), bu yüzden `organization.OrganizationLayout`'un
// AKSİNE (bazı alt route'lar self-servis) sekme çubuğunu gizleme kontrolü
// GEREKMEZ.
export function PerformanceSettingsLayout() {
  const location = useLocation()
  const activeTab = TABS.find((tab) => location.pathname.startsWith(tab.path))?.path ?? TABS[0].path

  return (
    <Box>
      <Tabs value={activeTab} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        {TABS.map((tab) => (
          <Tab key={tab.path} label={tab.label} value={tab.path} component={Link} to={tab.path} />
        ))}
      </Tabs>
      <Outlet />
    </Box>
  )
}
