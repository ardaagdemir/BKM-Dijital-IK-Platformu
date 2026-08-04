import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { authHandlers } from '../../test/msw/handlers/auth'
import { server } from '../../test/msw/server'
import { AuthProvider } from '../modules/auth/AuthProvider'
import { setToken } from '../shared/api/apiClient'
import { AppShell } from './AppShell'
import type { NavItem } from './navigation'

const testItems: NavItem[] = [
  { label: 'Ana Sayfa', path: '/', icon: <span /> },
  { label: 'Ayarlar', path: '/ayarlar', icon: <span /> },
]

function renderAppShell() {
  setToken('test-token')
  server.use(authHandlers.meAdmin)
  const router = createMemoryRouter(
    [
      {
        element: <AppShell items={testItems} />,
        children: [
          { path: '/', element: <div>Ana İçerik</div>, handle: { title: 'Ana Sayfa' } },
          { path: '/ayarlar', element: <div>Ayarlar İçeriği</div>, handle: { title: 'Ayarlar' } },
        ],
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

// Bölüm 13.3 Testler: "Menü öğesine tıklayınca doğru route'a gidildiği,
// aktif öğenin vurgulandığı."
describe('AppShell — menü tıklaması route değiştirir ve aktif öğeyi günceller (13.3)', () => {
  it('menü öğesine tıklayınca doğru route render edilir ve aria-current aktif öğeye taşınır', async () => {
    renderAppShell()
    const user = userEvent.setup()

    await screen.findByText('Ana İçerik')
    expect(screen.getByRole('link', { name: 'Ana Sayfa' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Ayarlar' })).not.toHaveAttribute('aria-current')

    await user.click(screen.getByRole('link', { name: 'Ayarlar' }))

    expect(await screen.findByText('Ayarlar İçeriği')).toBeInTheDocument()
    expect(screen.queryByText('Ana İçerik')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ayarlar' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Ana Sayfa' })).not.toHaveAttribute('aria-current')
  })
})
