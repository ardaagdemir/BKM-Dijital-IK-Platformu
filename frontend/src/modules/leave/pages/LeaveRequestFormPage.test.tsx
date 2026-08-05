import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createLeaveHandlers } from '../../../../test/msw/handlers/leave'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { server } from '../../../../test/msw/server'
import { setToken } from '../../../shared/api/apiClient'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import type { Employee } from '../../organization/types'
import type { LeaveRequest, LeaveType } from '../types'
import { LeaveRequestFormPage } from './LeaveRequestFormPage'

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
      { path: '/leave/requests/new', element: <LeaveRequestFormPage /> },
      { path: '/leave/requests', element: <div>Taleplerim Sayfası</div> },
    ],
    { initialEntries: ['/leave/requests/new'] },
  )
  return render(
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </LocalizationProvider>
    </QueryClientProvider>,
  )
}

async function fillDate(user: ReturnType<typeof userEvent.setup>, label: string, day: string, month: string, year: string) {
  const group = screen.getByRole('group', { name: label })
  await user.click(within(group).getByRole('spinbutton', { name: 'Day' }))
  await user.keyboard(day)
  await user.click(within(group).getByRole('spinbutton', { name: 'Month' }))
  await user.keyboard(month)
  await user.click(within(group).getByRole('spinbutton', { name: 'Year' }))
  await user.keyboard(year)
}

const leaveTypes: LeaveType[] = [{ id: 1, name: 'Yıllık İzin', code: 'YILLIK' }]

// Bölüm 14.3 Testler: "E2E: talep oluşturma, bakiye yetersizse uyarı
// banner'ı (ENGELLEMEDEN submit edilebildiği)" — entegrasyon karşılığı.
describe('LeaveRequestFormPage', () => {
  it('geçerli bilgilerle talep oluşturur ve Taleplerim sayfasına yönlendirir', async () => {
    server.use(
      ...createOrganizationHandlers([], [], [makeEmployee()]),
      ...createLeaveHandlers(leaveTypes, []),
    )
    renderPage()
    const user = userEvent.setup()

    await user.click(await screen.findByLabelText('İzin Türü'))
    await user.click(await screen.findByRole('option', { name: 'Yıllık İzin' }))
    await fillDate(user, 'Başlangıç', '10', '03', '2026')
    await fillDate(user, 'Bitiş', '12', '03', '2026')
    await user.click(screen.getByRole('button', { name: 'Talep Oluştur' }))

    expect(await screen.findByText('İzin talebi oluşturuldu')).toBeInTheDocument()
    expect(await screen.findByText('Taleplerim Sayfası')).toBeInTheDocument()
  })

  it('bakiye yetersizse uyarı gösterir ama talebi ENGELLEMEZ (sayfada kalır)', async () => {
    const existingRequests: LeaveRequest[] = [
      {
        id: 1,
        employeeId: 1,
        leaveTypeId: 1,
        startDate: '2026-01-01',
        endDate: '2026-01-14',
        status: 'APPROVED',
        requestedDays: 14,
        balanceWarning: null,
        rejectionReason: null,
        employeeEmail: null,
      },
    ]
    server.use(
      ...createOrganizationHandlers([], [], [makeEmployee()]),
      ...createLeaveHandlers(leaveTypes, existingRequests),
    )
    renderPage()
    const user = userEvent.setup()

    await user.click(await screen.findByLabelText('İzin Türü'))
    await user.click(await screen.findByRole('option', { name: 'Yıllık İzin' }))
    await fillDate(user, 'Başlangıç', '10', '03', '2026')
    await fillDate(user, 'Bitiş', '12', '03', '2026')
    await user.click(screen.getByRole('button', { name: 'Talep Oluştur' }))

    expect(await screen.findByText(/Bakiye yetersiz/)).toBeInTheDocument()
    // Sayfa DEĞİŞMEDİ (yönlendirme YOK) — kullanıcı uyarıyı okuyabilir.
    expect(screen.getByRole('button', { name: 'Talep Oluştur' })).toBeInTheDocument()
  })
})
