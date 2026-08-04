import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { Link, Outlet, useLocation } from 'react-router-dom'

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
