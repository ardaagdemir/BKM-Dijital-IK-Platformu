import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined'
import MenuIcon from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useMatches } from 'react-router-dom'
import { SIDEBAR_WIDTH_RAIL, TOPBAR_HEIGHT } from './layout.constants'
import { UserMenu } from './UserMenu'

type RouteHandle = { title?: string }

function usePageTitle(): string {
  const matches = useMatches()
  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const handle = matches[i]?.handle as RouteHandle | undefined
    if (handle?.title) {
      return handle.title
    }
  }
  return 'Dijital İK Platformu'
}

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const title = usePageTitle()

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <Toolbar disableGutters sx={{ height: TOPBAR_HEIGHT, minHeight: `${TOPBAR_HEIGHT}px !important` }}>
        {/* Marka alanı: Sidebar'ın rail genişliğiyle HİZALI (bkz. Sidebar.tsx)
            — TopBar tam genişlik olduğundan marka kimliği tek burada, Sidebar
            TopBar'ın ALTINDAN başlar (bkz. Sidebar.tsx top offset). */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            width: SIDEBAR_WIDTH_RAIL,
            flexShrink: 0,
          }}
        >
          <BusinessCenterOutlinedIcon color="primary" />
        </Box>
        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, my: 1.5 }} />
        <IconButton
          edge="start"
          size="large"
          aria-label="Menüyü aç"
          onClick={onMenuClick}
          sx={{ mx: 1, display: { xs: 'inline-flex', md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        {/* component="div": gerçek sayfa <h1>'i içerik alanına (Outlet) ait
            olmalı — bu yalnızca chrome'daki DUPLICATE bir etiket, ikinci bir
            h1 YARATMAZ (bkz. Bölüm 10 erişilebilirlik). */}
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontSize: '1.05rem', ml: { xs: 0, md: 2.5 } }}
          noWrap
        >
          {title}
        </Typography>
        <Box sx={{ mr: 2 }}>
          <UserMenu />
        </Box>
      </Toolbar>
    </AppBar>
  )
}
