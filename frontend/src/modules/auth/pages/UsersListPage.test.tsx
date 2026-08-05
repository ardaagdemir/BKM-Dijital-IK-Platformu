import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createUserManagementHandlers } from '../../../../test/msw/handlers/auth'
import { server } from '../../../../test/msw/server'
import type { UserSummary } from '../types'
import { UsersListPage } from './UsersListPage'

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(
    [
      { path: '/admin/users', element: <UsersListPage /> },
      { path: '/admin/users/:id/roles', element: <div>Rol Yönetimi Sayfası</div> },
    ],
    { initialEntries: ['/admin/users'] },
  )
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('UsersListPage', () => {
  it('hiç kullanıcı yokken "Henüz kullanıcı yok" gösterir', async () => {
    server.use(...createUserManagementHandlers([]))
    renderPage()

    expect(await screen.findByText('Henüz kullanıcı yok.')).toBeInTheDocument()
  })

  it('kullanıcıları ad/e-posta/rollerle listeler', async () => {
    const users: UserSummary[] = [{ id: 1, email: 'ik@dijitalik.local', fullName: 'İK Uzmanı', roles: ['IK'] }]
    server.use(...createUserManagementHandlers(users))
    renderPage()

    const table = await screen.findByRole('table')
    expect(within(table).getByText('İK Uzmanı')).toBeInTheDocument()
    expect(within(table).getByText('ik@dijitalik.local')).toBeInTheDocument()
    expect(within(table).getByText('IK')).toBeInTheDocument()
  })

  it('bir kullanıcıya tıklayınca rol yönetimi sayfasına gider', async () => {
    const users: UserSummary[] = [{ id: 7, email: 'yonetici@dijitalik.local', fullName: 'Bir Yönetici', roles: [] }]
    server.use(...createUserManagementHandlers(users))
    renderPage()
    const user = userEvent.setup()

    const table = await screen.findByRole('table')
    await user.click(within(table).getByRole('link', { name: 'Bir Yönetici' }))

    expect(await screen.findByText('Rol Yönetimi Sayfası')).toBeInTheDocument()
  })
})
