import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Paper from '@mui/material/Paper'
import { useNavigate } from 'react-router-dom'
import { BOTTOM_NAV_HEIGHT } from './layout.constants'
import type { NavItem } from './navigation'

const MORE_VALUE = '__more__'

type BottomNavProps = {
  items: NavItem[]
  currentPath: string
  onMoreClick: () => void
}

// Bölüm 4.3: "En sık kullanılan 4 hedef" — bugün gerçekten var olan tek
// route'un ötesinde SAHTE hedefler EKLENMEZ (bkz. Bölüm 0.3); geri kalan
// modüller eklendikçe `items` listesi büyür, bu bileşen DEĞİŞMEZ.
export function BottomNav({ items, currentPath, onMoreClick }: BottomNavProps) {
  const navigate = useNavigate()
  const value = items.some((item) => item.path === currentPath) ? currentPath : MORE_VALUE

  return (
    <Paper
      elevation={0}
      sx={{
        display: { xs: 'block', md: 'none' },
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <BottomNavigation
        showLabels
        value={value}
        sx={{ height: BOTTOM_NAV_HEIGHT }}
        onChange={(_event, newValue: string) => {
          if (newValue === MORE_VALUE) {
            onMoreClick()
          } else {
            navigate(newValue)
          }
        }}
      >
        {items.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            value={item.path}
            icon={item.icon}
            aria-current={item.path === currentPath ? 'page' : undefined}
          />
        ))}
        <BottomNavigationAction label="Diğer" value={MORE_VALUE} icon={<MoreHorizIcon />} />
      </BottomNavigation>
    </Paper>
  )
}
