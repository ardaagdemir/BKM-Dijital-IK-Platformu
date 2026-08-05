import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createDisciplineHandlers } from '../../../../test/msw/handlers/discipline'
import { server } from '../../../../test/msw/server'
import { setToken } from '../../../shared/api/apiClient'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import { DisciplinaryCaseDetailPage } from './DisciplinaryCaseDetailPage'

function renderPage() {
  setToken('test-token')
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter([{ path: '/discipline/cases/:id', element: <DisciplinaryCaseDetailPage /> }], {
    initialEntries: ['/discipline/cases/1'],
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

// US-08C.1.2/US-08C.1.3 Testler: "savunma alanı ZORUNLU (savunma boşken
// 'Kapat' butonu DISABLED)" + revizyon geçmişi.
describe('DisciplinaryCaseDetailPage', () => {
  it('savunma boşken Kapat DISABLED, savunma kaydedilince ENABLED olur ve süreç kapatılabilir', async () => {
    server.use(
      ...createDisciplineHandlers([], [
        {
          rootId: 1,
          employeeId: 1,
          revisions: [{ id: 1, reason: 'İş güvenliği ihlali', defense: null, status: 'OPEN', createdAt: '2026-03-10T09:00:00Z' }],
        },
      ]),
    )
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('İş güvenliği ihlali')
    expect(screen.getByRole('button', { name: 'Kapat' })).toBeDisabled()

    await user.type(screen.getByLabelText('Savunma'), 'Olayı reddediyorum.')
    await user.click(screen.getByRole('button', { name: 'Savunmayı Kaydet' }))
    expect(await screen.findByText('Savunma kaydedildi')).toBeInTheDocument()

    const closeButton = await screen.findByRole('button', { name: 'Kapat' })
    expect(closeButton).toBeEnabled()
    await user.click(closeButton)

    expect(await screen.findByText('Ceza süreci kapatıldı')).toBeInTheDocument()
    expect(await screen.findByLabelText('Savunma')).toBeDisabled()
  })

  it('revizyon geçmişini gösterir', async () => {
    server.use(
      ...createDisciplineHandlers([], [
        {
          rootId: 1,
          employeeId: 1,
          revisions: [
            { id: 1, reason: 'Devamsızlık', defense: null, status: 'OPEN', createdAt: '2026-03-10T09:00:00Z' },
            { id: 2, reason: 'Devamsızlık', defense: 'Savunmam budur.', status: 'OPEN', createdAt: '2026-03-11T09:00:00Z' },
            { id: 3, reason: 'Devamsızlık', defense: 'Savunmam budur.', status: 'CLOSED', createdAt: '2026-03-12T09:00:00Z' },
          ],
        },
      ]),
    )
    renderPage()

    const table = await screen.findByRole('table')
    expect(within(table).getAllByRole('row')).toHaveLength(4) // başlık + 3 revizyon
  })
})
