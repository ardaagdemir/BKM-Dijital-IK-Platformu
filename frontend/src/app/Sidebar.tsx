import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import { SIDEBAR_WIDTH_EXPANDED, SIDEBAR_WIDTH_RAIL, TOPBAR_HEIGHT } from './layout.constants'
import { NavList } from './NavList'
import type { NavItem } from './navigation'

type SidebarProps = {
  items: NavItem[]
  collapsed: boolean
  onToggleClick: () => void
  toggleLabel: string
}

// Bölüm 4.1/4.2: masaüstünde manuel daraltılabilir kalıcı sidebar, tablette
// her zaman rail — ikinci kullanım (rail'i geçici genişletme overlay'i)
// AppShell'de ayrı bir temporary Drawer olarak bindirilir (bkz. AppShell.tsx).
export function Sidebar({ items, collapsed, onToggleClick, toggleLabel }: SidebarProps) {
  const width = collapsed ? SIDEBAR_WIDTH_RAIL : SIDEBAR_WIDTH_EXPANDED

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width,
        flexShrink: 0,
        display: { xs: 'none', md: 'block' },
        transition: (theme) => theme.transitions.create('width'),
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          transition: (theme) => theme.transitions.create('width'),
          overflowX: 'hidden',
          // Marka kimliği TopBar'da (bkz. TopBar.tsx) — sabit TopBar'ın
          // ALTINDAN başlar, aksi halde daha yüksek z-index'li TopBar bu
          // alanı ÖRTER (position:fixed ile aynı y=0'da başladıklarından).
          top: TOPBAR_HEIGHT,
          height: `calc(100% - ${TOPBAR_HEIGHT}px)`,
        },
      }}
    >
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1 }}>
        <NavList items={items} showLabels={!collapsed} />
      </Box>
      <Divider />
      <Box sx={{ display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end', p: 1 }}>
        <IconButton onClick={onToggleClick} aria-label={toggleLabel} size="small">
          {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
        </IconButton>
      </Box>
    </Drawer>
  )
}
