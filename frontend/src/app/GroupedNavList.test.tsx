import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { GroupedNavList } from './GroupedNavList'
import type { NavItem } from './navigation'

const icon = <span />

const items: NavItem[] = [
  { label: 'Ana Sayfa', path: '/', icon, group: 'Genel' },
  { label: 'Çalışanlar', path: '/organization/employees', icon, group: 'Organizasyon' },
  { label: 'Kullanıcılar', path: '/admin/users', icon, group: 'Yönetim' },
]

function renderGroupedNavList(initialPath: string, onNavigate?: () => void) {
  const router = createMemoryRouter(
    [{ path: '*', element: <GroupedNavList items={items} onNavigate={onNavigate} /> }],
    { initialEntries: [initialPath] },
  )
  return render(<RouterProvider router={router} />)
}

// Görev: "Menü grupları açılır-kapanır olsun. Aktif route'un bulunduğu grup
// otomatik açık ve aktif öğe belirgin olsun."
describe('GroupedNavList', () => {
  it('aktif route\'un grubunu otomatik AÇIK, diğerlerini KAPALI gösterir', async () => {
    renderGroupedNavList('/')

    expect(screen.getByRole('button', { name: 'Genel' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'Organizasyon' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('button', { name: 'Yönetim' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('farklı bir aktif route farklı bir grubu otomatik açar', async () => {
    renderGroupedNavList('/admin/users')

    expect(screen.getByRole('button', { name: 'Genel' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('button', { name: 'Yönetim' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('kapalı bir grup başlığına tıklanınca açılır, tekrar tıklanınca kapanır', async () => {
    renderGroupedNavList('/')
    const user = userEvent.setup()

    const orgHeader = screen.getByRole('button', { name: 'Organizasyon' })
    expect(orgHeader).toHaveAttribute('aria-expanded', 'false')

    await user.click(orgHeader)
    expect(orgHeader).toHaveAttribute('aria-expanded', 'true')

    await user.click(orgHeader)
    expect(orgHeader).toHaveAttribute('aria-expanded', 'false')
  })

  it('aktif grubun içindeki öğe aria-current="page" taşır', async () => {
    renderGroupedNavList('/')

    expect(screen.getByRole('link', { name: 'Ana Sayfa' })).toHaveAttribute('aria-current', 'page')
  })

  it('bir menü bağlantısına tıklanınca onNavigate çağrılır', async () => {
    const onNavigate = vi.fn()
    renderGroupedNavList('/', onNavigate)
    const user = userEvent.setup()

    await user.click(screen.getByRole('link', { name: 'Ana Sayfa' }))

    expect(onNavigate).toHaveBeenCalledTimes(1)
  })

  it('rol filtresinden geçmiş boş bir grup HİÇ render edilmez', () => {
    renderGroupedNavList('/')

    expect(screen.queryByRole('button', { name: 'Çalışan Deneyimi' })).not.toBeInTheDocument()
  })
})
