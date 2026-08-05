import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { authHandlers } from '../../../../test/msw/handlers/auth'
import { createLeaveHandlers } from '../../../../test/msw/handlers/leave'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { server } from '../../../../test/msw/server'
import { setToken } from '../../../shared/api/apiClient'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import { AuthProvider } from '../../auth/AuthProvider'
import type { Employee } from '../../organization/types'
import type { LeaveRequest, LeaveType } from '../types'
import { LeaveRequestsPage } from './LeaveRequestsPage'

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

const leaveTypes: LeaveType[] = [{ id: 1, name: 'Yıllık İzin', code: 'YILLIK' }]

function makeRequest(overrides: Partial<LeaveRequest> = {}): LeaveRequest {
  return {
    id: 1,
    employeeId: 1,
    leaveTypeId: 1,
    startDate: '2026-03-10',
    endDate: '2026-03-12',
    status: 'PENDING',
    requestedDays: 3,
    balanceWarning: null,
    rejectionReason: null,
    employeeEmail: null,
    ...overrides,
  }
}

function renderPage() {
  setToken('test-token')
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(
    [
      { path: '/leave/requests', element: <LeaveRequestsPage /> },
      { path: '/leave/requests/new', element: <div>Yeni Talep Sayfası</div> },
    ],
    { initialEntries: ['/leave/requests'] },
  )
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>,
  )
}

// Bölüm 14.3 Testler: "Entegrasyon: durum filtreleme."
describe('LeaveRequestsPage', () => {
  it('taleplerini listeler ve durum filtresiyle daraltılır', async () => {
    server.use(
      ...createOrganizationHandlers([], [], [makeEmployee()]),
      ...createLeaveHandlers(leaveTypes, [
        makeRequest({ id: 1, status: 'PENDING' }),
        makeRequest({ id: 2, status: 'APPROVED', startDate: '2026-02-01', endDate: '2026-02-02' }),
      ]),
      authHandlers.meCalisan,
    )
    renderPage()
    const user = userEvent.setup()

    const table = await screen.findByRole('table')
    expect(within(table).getAllByRole('row')).toHaveLength(3) // başlık + 2 talep

    await user.click(screen.getByLabelText('Durum'))
    await user.click(await screen.findByRole('option', { name: 'Bekliyor' }))

    expect(within(table).getAllByRole('row')).toHaveLength(2) // başlık + 1 talep
    expect(within(table).getByText('Bekliyor')).toBeInTheDocument()
  })

  it('CALISAN için Dışa Aktar butonu GÖSTERİLMEZ', async () => {
    server.use(
      ...createOrganizationHandlers([], [], [makeEmployee()]),
      ...createLeaveHandlers(leaveTypes, [makeRequest()]),
      authHandlers.meCalisan,
    )
    renderPage()

    await screen.findByRole('table')
    expect(screen.queryByRole('button', { name: 'Dışa Aktar' })).not.toBeInTheDocument()
  })

  it('ADMIN için Dışa Aktar butonu gösterilir', async () => {
    server.use(
      ...createOrganizationHandlers([], [], [makeEmployee()]),
      ...createLeaveHandlers(leaveTypes, [makeRequest()]),
      authHandlers.meAdmin,
    )
    renderPage()

    await screen.findByRole('table')
    expect(await screen.findByRole('button', { name: 'Dışa Aktar' })).toBeInTheDocument()
  })

  it('hiç talep yokken "Yeni Talep" ile oluşturma sayfasına gider', async () => {
    server.use(
      ...createOrganizationHandlers([], [], [makeEmployee()]),
      ...createLeaveHandlers(leaveTypes, []),
      authHandlers.meCalisan,
    )
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz izin talebiniz yok.')
    await user.click(screen.getByRole('button', { name: 'Yeni Talep' }))

    expect(await screen.findByText('Yeni Talep Sayfası')).toBeInTheDocument()
  })
})
