import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Tooltip from '@mui/material/Tooltip'
import { Link, useLocation } from 'react-router-dom'
import type { NavItem } from './navigation'

type NavListProps = {
  items: NavItem[]
  showLabels: boolean
  onNavigate?: () => void
}

export function NavList({ items, showLabels, onNavigate }: NavListProps) {
  const location = useLocation()

  return (
    <List sx={{ px: 1 }} aria-label="Ana gezinme">
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
            <ListItemIcon sx={{ minWidth: showLabels ? 40 : 0, justifyContent: 'center' }}>
              {item.icon}
            </ListItemIcon>
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
    </List>
  )
}
