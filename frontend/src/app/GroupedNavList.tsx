import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { useEffect, useId, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { NavListItems } from './NavListItems'
import { groupNavItems, type NavGroup, type NavItem } from './navigation'

type GroupedNavListProps = {
  items: NavItem[]
  onNavigate?: () => void
}

// Menü yeniden düzenlemesi (13.2 revizyonu): masaüstü (genişletilmiş sidebar)
// ve tablet/mobil TAM menüde (Drawer/TabletExpandOverlay) kullanılan
// AÇILIR-KAPANIR grup görünümü. Grup başlığı (ListItemButton) BİLİNÇLİ
// OLARAK bir `<List>` (ul) İÇİNE KONULMAZ — `NavList.tsx`'teki AYNI axe
// "list" kuralı gerekçesiyle (yalnızca <li> doğrudan çocuk olabilir); her
// grup KENDİ bağımsız <ul>'unu taşır, başlık bu <ul>'un DIŞINDA bir
// düğmedir (bkz. `NavListItems.tsx`'in ayrı bir <List> render etmesi).
export function GroupedNavList({ items, onNavigate }: GroupedNavListProps) {
  const location = useLocation()
  const groups = groupNavItems(items)
  const activeGroup = groups.find((entry) => entry.items.some((item) => item.path === location.pathname))?.group
  const idPrefix = useId()

  const [expandedGroups, setExpandedGroups] = useState<Set<NavGroup>>(() => new Set(activeGroup ? [activeGroup] : []))

  // Aktif route DEĞİŞTİĞİNDE (ör. adres çubuğundan/başka bir öğeye
  // tıklanarak), o route'un grubu OTOMATİK açılır — kullanıcının ELLE
  // açtığı diğer gruplar KAPATILMAZ (bkz. görev tanımı: yalnızca "aktif
  // grup otomatik açık", başka bir davranış istenmedi).
  useEffect(() => {
    if (activeGroup) {
      setExpandedGroups((previous) => (previous.has(activeGroup) ? previous : new Set(previous).add(activeGroup)))
    }
  }, [activeGroup])

  function toggleGroup(group: NavGroup) {
    setExpandedGroups((previous) => {
      const next = new Set(previous)
      if (next.has(group)) {
        next.delete(group)
      } else {
        next.add(group)
      }
      return next
    })
  }

  return (
    <Box component="nav" aria-label="Ana gezinme">
      {groups.map(({ group, items: groupItems }) => {
        const isOpen = expandedGroups.has(group)
        const panelId = `${idPrefix}-${group}`
        return (
          <Box key={group}>
            <ListItemButton
              onClick={() => toggleGroup(group)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              sx={{ minHeight: 40 }}
            >
              <ListItemText
                primary={group}
                slotProps={{ primary: { variant: 'overline', sx: { fontWeight: 700, letterSpacing: 0.5 } } }}
              />
              {isOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </ListItemButton>
            <Collapse in={isOpen} timeout="auto">
              <List id={panelId} sx={{ px: 1 }} aria-label={`${group} menüsü`}>
                <NavListItems items={groupItems} showLabels onNavigate={onNavigate} />
              </List>
            </Collapse>
          </Box>
        )
      })}
    </Box>
  )
}
