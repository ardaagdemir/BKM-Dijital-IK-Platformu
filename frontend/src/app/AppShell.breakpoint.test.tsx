import useMediaQuery from '@mui/material/useMediaQuery'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { authHandlers } from '../../test/msw/handlers/auth'
import { server } from '../../test/msw/server'
import { AuthProvider } from '../modules/auth/AuthProvider'
import { setToken } from '../shared/api/apiClient'
import { AppShell } from './AppShell'

// Bölüm 13.3 Testler: "xs/md/lg breakpoint'lerinde doğru navigasyon
// bileşeninin seçildiği (mock useMediaQuery)" — AppShell, `lg` üstü ile `md`
// arasındaki ayrımı TEK BİR useMediaQuery(theme.breakpoints.up('lg'))
// çağrısıyla yapar; burada bu çağrı doğrudan mock'lanarak HER İKİ dal da
// (kalıcı daraltma vs. geçici rail genişletme) izole biçimde doğrulanır.
vi.mock('@mui/material/useMediaQuery')
const mockedUseMediaQuery = vi.mocked(useMediaQuery)

function renderAppShell() {
  setToken('test-token')
  server.use(authHandlers.meAdmin)
  const router = createMemoryRouter(
    [
      {
        element: <AppShell />,
        children: [{ path: '/', element: <div>İçerik</div>, handle: { title: 'Ana Sayfa' } }],
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

describe('AppShell — breakpoint bazlı sidebar davranışı (13.3)', () => {
  afterEach(() => {
    mockedUseMediaQuery.mockReset()
  })

  it('lg/xl (useMediaQuery=true): sidebar KALICI daraltma kontrolü sunar', async () => {
    mockedUseMediaQuery.mockReturnValue(true)
    renderAppShell()

    expect(await screen.findByRole('button', { name: 'Menüyü daralt' })).toBeInTheDocument()
  })

  it("md (useMediaQuery=false): sidebar rail'de kalır, buton GEÇİCİ bir overlay açar (KALICI daraltma DEĞİL)", async () => {
    mockedUseMediaQuery.mockReturnValue(false)
    const { container } = renderAppShell()

    const toggle = await screen.findByRole('button', { name: 'Menüyü genişlet' })
    // TabletExpandOverlay `ModalProps={{ keepMounted: true }}` kullandığından
    // Backdrop KAPALIYKEN BİLE DOM'dadır (yalnızca `visibility: hidden`) —
    // bu yüzden "yok" yerine "görünür DEĞİL" doğrulanır.
    const getBackdrop = () => container.ownerDocument.querySelector<HTMLElement>('.MuiBackdrop-root')
    expect(getBackdrop()).not.toBeVisible()

    const user = userEvent.setup()
    await user.click(toggle)

    // TabletExpandOverlay (variant="temporary") bir Modal — açılınca Backdrop
    // GÖRÜNÜR olur; bu, kalıcı Sidebar'ın KENDİ collapsed durumunu DEĞİL,
    // ayrı/geçici bir katmanın açıldığının kanıtıdır (bkz. TabletExpandOverlay.tsx).
    await expect.poll(getBackdrop).toBeVisible()

    // Kalıcı sidebar'ın KENDİ butonu HÂLÂ "Menüyü genişlet" — kalıcı
    // "Menüyü daralt" durumuna hiç GEÇMEDİ (bkz. lg/xl testiyle karşıtlık).
    expect(screen.queryByRole('button', { name: 'Menüyü daralt' })).not.toBeInTheDocument()
  })
})
