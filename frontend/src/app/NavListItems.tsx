import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Tooltip from '@mui/material/Tooltip'
import { Link, useLocation } from 'react-router-dom'
import type { NavItem } from './navigation'

type NavListItemsProps = {
  items: NavItem[]
  showLabels: boolean
  onNavigate?: () => void
}

// `NavList.tsx`/`GroupedNavList.tsx`'in İKİSİNİN de kullandığı, TEK bir
// `<li>` render fonksiyonu — Link/aria-current/Tooltip mantığı İKİ yerde
// TEKRAR EDİLMEZ (bkz. görev tanımı 5. madde).
export function NavListItems({ items, showLabels, onNavigate }: NavListItemsProps) {
  const location = useLocation()

  return (
    <>
      {items.map((item) => {
        const selected = location.pathname === item.path
        const button = (
          <ListItemButton
            component={Link}
            to={item.path}
            selected={selected}
            aria-current={selected ? 'page' : undefined}
            onClick={onNavigate}
            sx={{ justifyContent: showLabels ? 'flex-start' : 'center', minHeight: 44 }}
          >
            <ListItemIcon sx={{ minWidth: showLabels ? 40 : 0, justifyContent: 'center' }}>{item.icon}</ListItemIcon>
            {showLabels && <ListItemText primary={item.label} />}
          </ListItemButton>
        )

        // <ul> (List) yalnızca <li> (ListItem) DOĞRUDAN çocuk kabul eder —
        // ListItemButton'ı (component={Link} ile <a> render eder) doğrudan
        // List'e koymak axe'in "list" kuralını İHLAL EDER (bkz. Bölüm 10).
        return (
          <ListItem key={item.path} disablePadding>
            {showLabels ? (
              button
            ) : (
              <Tooltip title={item.label} placement="right">
                {button}
              </Tooltip>
            )}
          </ListItem>
        )
      })}
    </>
  )
}
