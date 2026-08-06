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

// Bölüm 4.3 revizyonu: `items`, `navigation.getBottomNavItems`'ten gelir —
// TÜM menü DEĞİL, sabit bir öncelik listesi (Ana Sayfa/Çalışanlar/İzinler/
// Onaylar), rol filtresinden geçmeyenler zaten ORADA elenmiş olur. Burada
// yalnızca "en fazla 4" kuralı EK bir güvenlik payı olarak `.slice(0, 4)`
// ile korunur — `items` her zaman ≤4 gelse de bu bileşen KENDİ başına
// 5 öğe (4+"Diğer") sınırını asla AŞMAZ.
export function BottomNav({ items, currentPath, onMoreClick }: BottomNavProps) {
  const navigate = useNavigate()
  const visibleItems = items.slice(0, 4)
  const value = visibleItems.some((item) => item.path === currentPath) ? currentPath : MORE_VALUE

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
        sx={{ height: BOTTOM_NAV_HEIGHT, overflow: 'hidden' }}
        onChange={(_event, newValue: string) => {
          if (newValue === MORE_VALUE) {
            onMoreClick()
          } else {
            navigate(newValue)
          }
        }}
      >
        {/* `BottomNavigationAction`'ın VARSAYILAN `minWidth: 80`'i, en
            fazla 5 öğeyle (5×80=400px) dar ekranlarda (ör. 360px genişlikte
            bir cihaz) YATAY TAŞMAYA yol açar — `minWidth: 0` + `flex: 1`
            ile her öğe konteynerin GENİŞLİĞİNE eşit paylaşılır, asla taşmaz. */}
        {visibleItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            value={item.path}
            icon={item.icon}
            aria-current={item.path === currentPath ? 'page' : undefined}
            sx={{ minWidth: 0, maxWidth: 'none', flex: 1, px: 0.5 }}
          />
        ))}
        <BottomNavigationAction
          label="Diğer"
          value={MORE_VALUE}
          icon={<MoreHorizIcon />}
          sx={{ minWidth: 0, maxWidth: 'none', flex: 1, px: 0.5 }}
        />
      </BottomNavigation>
    </Paper>
  )
}
