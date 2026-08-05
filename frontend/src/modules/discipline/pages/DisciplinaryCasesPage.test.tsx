import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createDisciplineHandlers } from '../../../../test/msw/handlers/discipline'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { server } from '../../../../test/msw/server'
import { setToken } from '../../../shared/api/apiClient'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import type { Employee } from '../../organization/types'
import { DisciplinaryCasesPage } from './DisciplinaryCasesPage'

function makeEmployee(overrides: Partial<Employee> = {}): Employee {
  return {
    id: 1,
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    nationalId: '10000000146',
    hireDate: '2020-01-15',
    email: 'ahmet@dijitalik.local',
    organizationUnitId: null,
    jobTitleId: null,
    iban: null,
    ...overrides,
  }
}

function renderPage() {
  setToken('test-token')
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(
    [
      { path: '/discipline/cases', element: <DisciplinaryCasesPage /> },
      { path: '/discipline/cases/:id', element: <div>Süreç Detay Sayfası</div> },
    ],
    { initialEntries: ['/discipline/cases'] },
  )
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

async function selectEmployee(user: ReturnType<typeof userEvent.setup>, name: string, option: string) {
  const employeeInput = screen.getByRole('combobox', { name: 'Çalışan' })
  await user.click(employeeInput)
  await user.type(employeeInput, name)
  await user.click(await screen.findByRole('option', { name: option }))
}

describe('DisciplinaryCasesPage', () => {
  it('çalışan seçilip yeni süreç açılır ve detay sayfasına yönlendirir', async () => {
    server.use(...createOrganizationHandlers([], [], [makeEmployee()]), ...createDisciplineHandlers())
    renderPage()
    const user = userEvent.setup()

    await selectEmployee(user, 'Ahmet', 'Ahmet Yılmaz')
    await screen.findByText('Bu çalışan için henüz bir ceza süreci yok.')

    await user.click(screen.getByRole('button', { name: 'Yeni Süreç Aç' }))
    await user.type(screen.getByLabelText('Gerekçe'), 'İş güvenliği ihlali')
    await user.click(screen.getByRole('button', { name: 'Aç' }))

    expect(await screen.findByText('Ceza süreci açıldı')).toBeInTheDocument()
    expect(await screen.findByText('Süreç Detay Sayfası')).toBeInTheDocument()
  })

  it('mevcut süreçleri listeler', async () => {
    server.use(
      ...createOrganizationHandlers([], [], [makeEmployee()]),
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

    await selectEmployee(user, 'Ahmet', 'Ahmet Yılmaz')
    const table = await screen.findByRole('table')
    await within(table).findByText('İş güvenliği ihlali')
    expect(within(table).getByText('Açık')).toBeInTheDocument()
  })
})
