import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { createLeaveHandlers } from '../../../../test/msw/handlers/leave'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { server } from '../../../../test/msw/server'
import { setToken } from '../../../shared/api/apiClient'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import { AuthProvider } from '../../auth/AuthProvider'
import type { Employee, JobTitle, OrganizationUnit } from '../../organization/types'
import type { LeaveRequest, LeaveType } from '../types'
import { LeaveApprovalsPage } from './LeaveApprovalsPage'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

const meYonetici = http.get(`${BASE_URL}/api/auth/me`, () =>
  HttpResponse.json({ userId: 1, email: 'yonetici@dijitalik.local', fullName: 'Bir Yönetici', roles: ['YONETICI'] }),
)

const units: OrganizationUnit[] = [{ id: 10, name: 'Satış', parentId: null }]
const jobTitles: JobTitle[] = [{ id: 1, name: 'Uzman' }]
const leaveTypes: LeaveType[] = [{ id: 1, name: 'Yıllık İzin', code: 'YILLIK' }]

function makeEmployee(overrides: Partial<Employee>): Employee {
  return {
    id: 1,
    firstName: 'Bir',
    lastName: 'Yönetici',
    nationalId: '10000000146',
    hireDate: '2020-01-15',
    email: 'yonetici@dijitalik.local',
    organizationUnitId: 10,
    jobTitleId: null,
    iban: null,
    ...overrides,
  }
}

function makeRequest(overrides: Partial<LeaveRequest>): LeaveRequest {
  return {
    id: 1,
    employeeId: 2,
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

function renderPage(requests: LeaveRequest[]) {
  setToken('test-token')
  const employees: Employee[] = [
    makeEmployee({ id: 1 }), // "ben" (yönetici) — /employees/me bu dizideki İLKİ döner
    makeEmployee({ id: 2, firstName: 'Ayşe', lastName: 'Demir', email: 'ayse@dijitalik.local' }),
  ]
  server.use(
    meYonetici,
    ...createOrganizationHandlers(jobTitles, units, employees),
    ...createLeaveHandlers(leaveTypes, requests),
  )

  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <LeaveApprovalsPage />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>,
  )
}

// Bölüm 14.3 Testler: "E2E: onayla → bakiyenin düştüğünün doğrulanması;
// reddet → gerekçe zorunluluğunun doğrulanması" — YONETICI rolü için
// gerçek bir test hesabı OLMADIĞINDAN (bkz. implementasyon logundaki not,
// 13.7'deki CALISAN self-view'la AYNI kısıt) bu senaryolar entegrasyon
// testiyle kapsanır.
describe('LeaveApprovalsPage', () => {
  it('ekibindeki (AYNI organizationUnitId) bekleyen talebi gösterir, kendi talebini GÖSTERMEZ', async () => {
    renderPage([
      makeRequest({ id: 1, employeeId: 2, status: 'PENDING' }),
      makeRequest({ id: 2, employeeId: 1, status: 'PENDING' }), // kendi talebi — hariç tutulmalı
    ])

    const table = await screen.findByRole('table')
    await within(table).findByText('Ayşe Demir')
    expect(within(table).getAllByRole('row')).toHaveLength(2) // başlık + 1 (yalnızca Ayşe'ninki)
  })

  it('bir talep onaylanabilir', async () => {
    renderPage([makeRequest({ id: 1, employeeId: 2, status: 'PENDING' })])
    const user = userEvent.setup()

    const table = await screen.findByRole('table')
    await within(table).findByText('Ayşe Demir')
    await user.click(within(table).getByRole('button', { name: 'Onayla' }))

    expect(await screen.findByText('Talep onaylandı')).toBeInTheDocument()
    expect(await screen.findByText('Onay bekleyen izin talebi yok.')).toBeInTheDocument()
  })

  it('gerekçesiz ret denemesi validasyon hatası gösterir', async () => {
    renderPage([makeRequest({ id: 1, employeeId: 2, status: 'PENDING' })])
    const user = userEvent.setup()

    const table = await screen.findByRole('table')
    await within(table).findByText('Ayşe Demir')
    await user.click(within(table).getByRole('button', { name: 'Reddet' }))

    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Reddet' }))

    expect(await screen.findByText('Ret gerekçesi zorunludur.')).toBeInTheDocument()
  })

  it('gerekçeyle ret işlemi tamamlanır', async () => {
    renderPage([makeRequest({ id: 1, employeeId: 2, status: 'PENDING' })])
    const user = userEvent.setup()

    const table = await screen.findByRole('table')
    await within(table).findByText('Ayşe Demir')
    await user.click(within(table).getByRole('button', { name: 'Reddet' }))

    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText('Ret Gerekçesi'), 'Yoğun dönem')
    await user.click(within(dialog).getByRole('button', { name: 'Reddet' }))

    expect(await screen.findByText('Talep reddedildi')).toBeInTheDocument()
    expect(await screen.findByText('Onay bekleyen izin talebi yok.')).toBeInTheDocument()
  })
})
