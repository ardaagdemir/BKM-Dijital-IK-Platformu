import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { authHandlers } from '../../../test/msw/handlers/auth'
import { server } from '../../../test/msw/server'
import { setToken } from '../../shared/api/apiClient'
import { AuthProvider } from './AuthProvider'
import { ProtectedRoute } from './ProtectedRoute'

function renderWithRoles(roles: string[]) {
  setToken('test-token')
  const router = createMemoryRouter(
    [
      {
        path: '/organization',
        element: (
          <ProtectedRoute roles={roles}>
            <div>Organizasyon İçeriği</div>
          </ProtectedRoute>
        ),
      },
      { path: '/403', element: <div>Yetkisiz Erişim</div> },
    ],
    { initialEntries: ['/organization'] },
  )
  return render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  )
}

// Bölüm 5.2: "roles prop'u ile route'u sarmalar ... rol uyuşmuyorsa /403'e
// yönlendirir." — 13.4, bu davranışı GERÇEKTEN kullanan ilk route.
describe('ProtectedRoute — roles', () => {
  it('rolü eşleşen kullanıcı için içeriği render eder', async () => {
    server.use(authHandlers.meAdmin)
    renderWithRoles(['ADMIN', 'IK'])

    expect(await screen.findByText('Organizasyon İçeriği')).toBeInTheDocument()
  })

  it('rolü eşleşmeyen kullanıcıyı /403e yönlendirir', async () => {
    server.use(authHandlers.meCalisan)
    renderWithRoles(['ADMIN', 'IK'])

    expect(await screen.findByText('Yetkisiz Erişim')).toBeInTheDocument()
    expect(screen.queryByText('Organizasyon İçeriği')).not.toBeInTheDocument()
  })
})
