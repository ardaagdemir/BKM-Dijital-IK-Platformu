import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import { BrandHeader } from './BrandHeader'
import { NavList } from './NavList'
import type { NavItem } from './navigation'

type NavDrawerProps = {
  items: NavItem[]
  open: boolean
  onClose: () => void
}

// Bölüm 4.3: hamburger → tam ekran Drawer (xs/sm). MUI Drawer, Modal
// üzerine kurulu olduğundan odak hapsi + arka plan scroll kilidi (bkz.
// Bölüm 3) VARSAYILAN olarak sağlanır, ayrıca elle uygulanmaz.
export function NavDrawer({ items, open, onClose }: NavDrawerProps) {
  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': { width: '85%', maxWidth: 320, boxSizing: 'border-box' },
      }}
    >
      <BrandHeader />
      <Divider />
      <NavList items={items} showLabels onNavigate={onClose} />
    </Drawer>
  )
}
