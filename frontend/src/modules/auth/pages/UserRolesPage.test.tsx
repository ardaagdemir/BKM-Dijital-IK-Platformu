import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createUserManagementHandlers } from '../../../../test/msw/handlers/auth'
import { server } from '../../../../test/msw/server'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import type { UserSummary } from '../types'
import { UserRolesPage } from './UserRolesPage'

function renderPage(userId: number) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter([{ path: '/admin/users/:id/roles', element: <UserRolesPage /> }], {
    initialEntries: [`/admin/users/${userId}/roles`],
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

// Bölüm 14.1 (US-02.2.2) Testler: "Entegrasyon: rol ekle/kaldır sonrası
// listenin güncellendiği."
describe('UserRolesPage', () => {
  it('kullanıcının mevcut rollerini gösterir ve yeni bir rol eklenebilir', async () => {
    const users: UserSummary[] = [{ id: 1, email: 'yeni@dijitalik.local', fullName: 'Yeni Kullanıcı', roles: ['CALISAN'] }]
    server.use(...createUserManagementHandlers(users))
    renderPage(1)
    const user = userEvent.setup()

    expect(await screen.findByText('CALISAN')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Rol Ekle'))
    await user.click(await screen.findByRole('option', { name: 'IK' }))
    await user.click(screen.getByRole('button', { name: 'Ekle' }))

    expect(await screen.findByText('Rol eklendi')).toBeInTheDocument()
    expect(await screen.findByText('IK')).toBeInTheDocument()
  })

  it('bir rol kaldırılabilir (onay sonrası)', async () => {
    const users: UserSummary[] = [
      { id: 1, email: 'coklurol@dijitalik.local', fullName: 'Çoklu Rol', roles: ['ADMIN', 'IK'] },
    ]
    server.use(...createUserManagementHandlers(users))
    renderPage(1)
    const user = userEvent.setup()

    await screen.findByText('ADMIN')
    await user.click(screen.getByRole('button', { name: 'IK rolünü kaldır' }))

    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Kaldır' }))

    expect(await screen.findByText('Rol kaldırıldı')).toBeInTheDocument()
    expect(screen.queryByText('IK')).not.toBeInTheDocument()
    expect(screen.getByText('ADMIN')).toBeInTheDocument()
  })

  it('var olmayan kullanıcı için "Kullanıcı bulunamadı" gösterir', async () => {
    server.use(...createUserManagementHandlers([]))
    renderPage(999)

    expect(await screen.findByText('Kullanıcı bulunamadı')).toBeInTheDocument()
  })
})
