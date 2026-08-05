import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { authHandlers } from '../../../../test/msw/handlers/auth'
import { server } from '../../../../test/msw/server'
import { setToken } from '../../../shared/api/apiClient'
import { AuthProvider } from '../AuthProvider'
import { ProfilePage } from './ProfilePage'

function renderPage() {
  setToken('test-token')
  const router = createMemoryRouter([{ path: '/profile', element: <ProfilePage /> }], {
    initialEntries: ['/profile'],
  })
  return render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  )
}

// Bölüm 14.1 (US-02.2.4) Testler: "E2E: giriş sonrası profil bilgisinin
// doğru göründüğü" — bu entegrasyon testi, giriş yapmış kullanıcının kendi
// bilgilerinin (ad, e-posta, roller) doğru göründüğünü doğrular.
describe('ProfilePage', () => {
  it('giriş yapan kullanıcının ad/e-posta/rol bilgilerini gösterir', async () => {
    server.use(authHandlers.meAdmin)
    renderPage()

    expect(await screen.findByText('Sistem Yöneticisi')).toBeInTheDocument()
    expect(screen.getByText('admin@dijitalik.local')).toBeInTheDocument()
    expect(screen.getByText('ADMIN')).toBeInTheDocument()
  })

  it('CALISAN rolündeki kullanıcı için kendi bilgilerini gösterir', async () => {
    server.use(authHandlers.meCalisan)
    renderPage()

    expect(await screen.findByText('Ayşe Yılmaz')).toBeInTheDocument()
    expect(screen.getByText('calisan@dijitalik.local')).toBeInTheDocument()
    expect(screen.getByText('CALISAN')).toBeInTheDocument()
  })
})
