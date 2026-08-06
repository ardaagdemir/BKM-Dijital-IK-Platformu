import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import { BrandHeader } from './BrandHeader'
import { GroupedNavList } from './GroupedNavList'
import type { NavItem } from './navigation'

type NavDrawerProps = {
  items: NavItem[]
  open: boolean
  onClose: () => void
}

// Bölüm 4.3: hamburger/BottomNav "Diğer" → TAM menüyü içeren Drawer
// (xs/sm). MUI Drawer, Modal üzerine kurulu olduğundan odak hapsi + arka
// plan scroll kilidi (bkz. Bölüm 3) VARSAYILAN olarak sağlanır, ayrıca elle
// uygulanmaz. Menü yeniden düzenlemesi (13.2 revizyonu): TAM menü artık
// gruplu/açılır-kapanır (`GroupedNavList`) — masaüstü sidebar'ın
// genişletilmiş görünümüyle AYNI bileşen.
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
      <GroupedNavList items={items} onNavigate={onClose} />
    </Drawer>
  )
}
