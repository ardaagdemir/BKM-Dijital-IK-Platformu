import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import { BrandHeader } from './BrandHeader'
import { GroupedNavList } from './GroupedNavList'
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
// Menü yeniden düzenlemesi (13.2 revizyonu): ürün kimliği (`BrandHeader`)
// artık sidebar'ın KENDİSİNİN de üstünde (önceden yalnızca TopBar'da ve
// mobil/tablet Drawer'larında vardı) — daraltılmışken `compact` (yalnızca
// ikon), genişletilmişken tam başlık+alt başlık. Genişletilmiş görünüm
// `GroupedNavList` (açılır-kapanır gruplar), daraltılmış rail HÂLÂ düz
// `NavList` (grup başlıkları için yer yok).
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
          // Marka alanı burada, ana TopBar marka bloğuyla HİZALI (bkz.
          // TopBar.tsx) — sabit TopBar'ın ALTINDAN başlar, aksi halde daha
          // yüksek z-index'li TopBar bu alanı ÖRTER (position:fixed ile
          // aynı y=0'da başladıklarından).
          top: TOPBAR_HEIGHT,
          height: `calc(100% - ${TOPBAR_HEIGHT}px)`,
        },
      }}
    >
      <BrandHeader compact={collapsed} />
      <Divider />
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1 }}>
        {collapsed ? <NavList items={items} showLabels={false} /> : <GroupedNavList items={items} />}
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
