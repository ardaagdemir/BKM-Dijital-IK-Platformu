import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { authHandlers } from '../../test/msw/handlers/auth'
import { server } from '../../test/msw/server'
import { AuthProvider } from '../modules/auth/AuthProvider'
import { setToken } from '../shared/api/apiClient'
import { AppShell } from './AppShell'
import type { NavItem } from './navigation'

// Gerçek navigationItems bugün yalnızca tek, herkese açık bir öğe içerir
// (bkz. navigation.tsx) — role bazlı filtrelemenin AppShell ↔ Sidebar
// bağlantısında GERÇEKTEN çalıştığını kanıtlamak için burada sentetik,
// role-kısıtlı bir test öğesi kullanılıyor (Bölüm 13.3'ün menuConfig'i İCAT
// EDİLMİYOR, yalnızca mevcut filtreleme mekanizması test ediliyor).
const testItems: NavItem[] = [
  { label: 'Ana Sayfa', path: '/', icon: <span />, group: 'Genel' },
  { label: 'Yönetim Paneli', path: '/yonetim', icon: <span />, group: 'Yönetim', roles: ['ADMIN'] },
]

function renderAppShell() {
  setToken('test-token')
  // TopBar, useMatches() (bkz. usePageTitle) kullanır — bu yalnızca bir
  // "data router" (createMemoryRouter) içinde çalışır, <MemoryRouter> ile
  // ÇALIŞMAZ (bkz. LoginPage.test.tsx'in kullandığı eski desen).
  const router = createMemoryRouter(
    [
      {
        element: <AppShell items={testItems} />,
        children: [{ path: '/', element: <div>Sayfa İçeriği</div>, handle: { title: 'Ana Sayfa' } }],
      },
    ],
    { initialEntries: ['/'] },
  )
  return render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  )
}

describe('AppShell — role bazlı menü (13.2)', () => {
  it('ADMIN rolündeki kullanıcı için role-kısıtlı öğeyi de gösterir', async () => {
    server.use(authHandlers.meAdmin)
    renderAppShell()

    expect(await screen.findAllByText('Yönetim Paneli')).not.toHaveLength(0)
    expect(await screen.findByText('Sayfa İçeriği')).toBeInTheDocument()
  })

  it('CALISAN rolündeki kullanıcı için role-kısıtlı öğeyi HİÇBİR yerde göstermez', async () => {
    server.use(authHandlers.meCalisan)
    renderAppShell()

    await screen.findByText('Sayfa İçeriği')
    expect(screen.queryAllByText('Yönetim Paneli')).toHaveLength(0)
    expect((await screen.findAllByText('Ana Sayfa')).length).toBeGreaterThan(0)
  })

  it('kullanıcı bilgisini (ad + rol) kullanıcı menüsünde gösterir', async () => {
    server.use(authHandlers.meAdmin)
    renderAppShell()

    const avatarButton = await screen.findByRole('button', { name: 'Kullanıcı menüsü' })
    avatarButton.click()

    expect(await screen.findByText('Sistem Yöneticisi')).toBeInTheDocument()
    expect(screen.getByText('admin@dijitalik.local')).toBeInTheDocument()
    expect(screen.getByText('ADMIN')).toBeInTheDocument()
  })
})
