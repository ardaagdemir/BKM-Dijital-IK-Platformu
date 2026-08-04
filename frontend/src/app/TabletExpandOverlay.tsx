import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import { BrandHeader } from './BrandHeader'
import { SIDEBAR_WIDTH_EXPANDED } from './layout.constants'
import { NavList } from './NavList'
import type { NavItem } from './navigation'

type TabletExpandOverlayProps = {
  items: NavItem[]
  open: boolean
  onClose: () => void
}

// Bölüm 4.2: tablette rail'e tıklanınca GEÇİCİ genişleyen, içerik alanını
// İTMEYEN bir bindirme (variant="temporary" zaten Modal tabanlı olduğundan
// document akışını etkilemez) — dışarı tıklanınca/Escape ile kapanır.
export function TabletExpandOverlay({ items, open, onClose }: TabletExpandOverlayProps) {
  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: 'none', md: 'block', lg: 'none' },
        '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH_EXPANDED, boxSizing: 'border-box' },
      }}
    >
      <BrandHeader />
      <Divider />
      <NavList items={items} showLabels onNavigate={onClose} />
    </Drawer>
  )
}
