import List from '@mui/material/List'
import { NavListItems } from './NavListItems'
import type { NavItem } from './navigation'

type NavListProps = {
  items: NavItem[]
  showLabels: boolean
  onNavigate?: () => void
}

// Gruplanmamış DÜZ liste — yalnızca daraltılmış (rail) sidebar'da kullanılır
// (bkz. Sidebar.tsx); ikon-only rail'de grup başlıkları için yer YOK. Tam
// etiketli görünümler (genişletilmiş sidebar/Drawer/tablet overlay)
// `GroupedNavList`'i kullanır.
export function NavList({ items, showLabels, onNavigate }: NavListProps) {
  return (
    <List sx={{ px: 1 }} aria-label="Ana gezinme">
      <NavListItems items={items} showLabels={showLabels} onNavigate={onNavigate} />
    </List>
  )
}
