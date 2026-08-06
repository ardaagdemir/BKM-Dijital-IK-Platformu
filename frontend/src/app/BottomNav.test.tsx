import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { BottomNav } from './BottomNav'
import type { NavItem } from './navigation'

const icon = <span />

function renderBottomNav(items: NavItem[], currentPath = '/', onMoreClick = vi.fn()) {
  return render(
    <MemoryRouter>
      <BottomNav items={items} currentPath={currentPath} onMoreClick={onMoreClick} />
    </MemoryRouter>,
  )
}

// Görev: "Mobil BottomNavigation'da tüm menü öğelerini gösterme. En fazla 5
// öğe göster ... 'Diğer' öğesi tam menüyü içeren Drawer'ı açsın."
describe('BottomNav', () => {
  it('en fazla 4 gerçek öğe + "Diğer" gösterir (toplam 5)', () => {
    const items: NavItem[] = [
      { label: 'Ana Sayfa', path: '/', icon, group: 'Genel' },
      { label: 'Çalışanlar', path: '/organization/employees', icon, group: 'Organizasyon' },
      { label: 'İzinler', path: '/leave/requests', icon, group: 'Çalışan İşlemleri' },
      { label: 'Onaylar', path: '/leave/approvals', icon, group: 'İK Süreçleri' },
    ]
    renderBottomNav(items)

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(5)
    ;['Ana Sayfa', 'Çalışanlar', 'İzinler', 'Onaylar', 'Diğer'].forEach((label) => {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    })
  })

  it('rol filtresinden geçmeyen (items içinde bulunmayan) hedefler için buton oluşturulmaz', () => {
    // Yalnızca "Ana Sayfa" ve "İzinler" — ör. bir CALISAN için "Çalışanlar"
    // ve "Onaylar" `filterNavItemsByRoles`/`getBottomNavItems` tarafından
    // ZATEN elenmiş senaryosu.
    const items: NavItem[] = [
      { label: 'Ana Sayfa', path: '/', icon, group: 'Genel' },
      { label: 'İzinler', path: '/leave/requests', icon, group: 'Çalışan İşlemleri' },
    ]
    renderBottomNav(items)

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)
    expect(screen.queryByRole('button', { name: 'Çalışanlar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Onaylar' })).not.toBeInTheDocument()
  })

  it('beşten fazla öğe verilse bile 4 ile sınırlar (+"Diğer")', () => {
    const items: NavItem[] = [
      { label: 'A', path: '/a', icon, group: 'Genel' },
      { label: 'B', path: '/b', icon, group: 'Genel' },
      { label: 'C', path: '/c', icon, group: 'Genel' },
      { label: 'D', path: '/d', icon, group: 'Genel' },
      { label: 'E (taşan)', path: '/e', icon, group: 'Genel' },
    ]
    renderBottomNav(items)

    expect(screen.getAllByRole('button')).toHaveLength(5)
    expect(screen.queryByRole('button', { name: 'E (taşan)' })).not.toBeInTheDocument()
  })

  it('aktif path aria-current="page" taşır', () => {
    const items: NavItem[] = [
      { label: 'Ana Sayfa', path: '/', icon, group: 'Genel' },
      { label: 'İzinler', path: '/leave/requests', icon, group: 'Çalışan İşlemleri' },
    ]
    renderBottomNav(items, '/leave/requests')

    expect(screen.getByRole('button', { name: 'İzinler' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Ana Sayfa' })).not.toHaveAttribute('aria-current')
  })

  it('"Diğer" tıklanınca onMoreClick çağrılır (tam menü Drawer\'ını açar)', async () => {
    const onMoreClick = vi.fn()
    const items: NavItem[] = [{ label: 'Ana Sayfa', path: '/', icon, group: 'Genel' }]
    renderBottomNav(items, '/', onMoreClick)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Diğer' }))

    expect(onMoreClick).toHaveBeenCalledTimes(1)
  })
})
