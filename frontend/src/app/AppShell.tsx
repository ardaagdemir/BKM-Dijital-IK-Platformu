import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../modules/auth/AuthProvider'
import { BottomNav } from './BottomNav'
import { FullHeightBox } from './FullHeightBox'
import {
  BOTTOM_NAV_HEIGHT,
  CONTENT_MAX_WIDTH,
  SIDEBAR_WIDTH_EXPANDED,
  SIDEBAR_WIDTH_RAIL,
  TOPBAR_HEIGHT,
} from './layout.constants'
import { NavDrawer } from './NavDrawer'
import { filterNavItemsByRoles, navigationItems, type NavItem } from './navigation'
import { Sidebar } from './Sidebar'
import { TabletExpandOverlay } from './TabletExpandOverlay'
import { TopBar } from './TopBar'
import { useSidebarCollapse } from './useSidebarCollapse'

type AppShellProps = {
  // Testability seam — üretimde her zaman gerçek navigationItems kullanılır;
  // test dışında bu prop VERİLMEZ (bkz. AppShell.test.tsx).
  items?: NavItem[]
}

// Bölüm 13.2: TÜM korumalı route'ların ortak çerçevesi (bkz. router.tsx —
// bu bileşen bir layout route olarak <Outlet/> sarar, sayfa geçişlerinde
// KENDİSİ yeniden mount edilmez).
export function AppShell({ items: itemsOverride }: AppShellProps = {}) {
  const theme = useTheme()
  const isLargeUp = useMediaQuery(theme.breakpoints.up('lg'))
  const { user } = useAuth()
  const location = useLocation()
  const { collapsed: desktopCollapsed, toggle: toggleDesktopCollapsed } = useSidebarCollapse()
  const [tabletOverlayOpen, setTabletOverlayOpen] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  const items = filterNavItemsByRoles(itemsOverride ?? navigationItems, user?.roles ?? [])
  // md'de sidebar HER ZAMAN rail (bkz. Bölüm 4.2); yalnızca lg/xl'de
  // kullanıcının manuel daraltma tercihi (bkz. useSidebarCollapse) geçerli.
  const sidebarCollapsed = isLargeUp ? desktopCollapsed : true
  const sidebarWidth = sidebarCollapsed ? SIDEBAR_WIDTH_RAIL : SIDEBAR_WIDTH_EXPANDED

  return (
    <FullHeightBox style={{ display: 'flex' }}>
      <TopBar onMenuClick={() => setMobileDrawerOpen(true)} />

      <Sidebar
        items={items}
        collapsed={sidebarCollapsed}
        onToggleClick={isLargeUp ? toggleDesktopCollapsed : () => setTabletOverlayOpen(true)}
        toggleLabel={
          isLargeUp ? (desktopCollapsed ? 'Menüyü genişlet' : 'Menüyü daralt') : 'Menüyü genişlet'
        }
      />
      <TabletExpandOverlay items={items} open={tabletOverlayOpen} onClose={() => setTabletOverlayOpen(false)} />
      <NavDrawer items={items} open={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)} />
      <BottomNav items={items} currentPath={location.pathname} onMoreClick={() => setMobileDrawerOpen(true)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginLeft: { xs: 0, md: `${sidebarWidth}px` },
          paddingTop: `calc(${TOPBAR_HEIGHT}px + env(safe-area-inset-top, 0px))`,
          // Bölüm 3: sabit BottomNavigation'ın ARKASINDA kalan içerik boşluğu
          // TEK bu yerde uygulanır (her sayfa kendi padding'ini hesaplamaz).
          paddingBottom: {
            xs: `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom, 0px))`,
            md: 0,
          },
          transition: theme.transitions.create('margin-left'),
        }}
      >
        <Box sx={{ maxWidth: CONTENT_MAX_WIDTH, mx: 'auto', p: { xs: 2, sm: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </FullHeightBox>
  )
}
