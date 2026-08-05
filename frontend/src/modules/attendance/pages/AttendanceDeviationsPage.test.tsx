import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createAttendanceHandlers } from '../../../../test/msw/handlers/attendance'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { server } from '../../../../test/msw/server'
import { setToken } from '../../../shared/api/apiClient'
import type { Employee } from '../../organization/types'
import type { AttendanceRecord, WorkModel, WorkModelAssignment } from '../types'
import { AttendanceDeviationsPage } from './AttendanceDeviationsPage'

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

const workModels: WorkModel[] = [{ id: 1, name: 'Tam Zamanlı', plannedStartTime: '09:00:00', plannedEndTime: '18:00:00' }]

function renderPage() {
  setToken('test-token')
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <AttendanceDeviationsPage />
    </QueryClientProvider>,
  )
}

async function selectEmployee(user: ReturnType<typeof userEvent.setup>, name: string, option: string) {
  const employeeInput = screen.getByRole('combobox', { name: 'Çalışan' })
  await user.click(employeeInput)
  await user.type(employeeInput, name)
  await user.click(await screen.findByRole('option', { name: option }))
}

describe('AttendanceDeviationsPage', () => {
  it('geç kalma/erken çıkış sapmalarını listeler', async () => {
    const assignments: WorkModelAssignment[] = [{ employeeId: 1, workModelId: 1 }]
    const records: AttendanceRecord[] = [
      { id: 1, employeeId: 1, checkInAt: '2026-03-10T09:20:00+03:00', checkOutAt: '2026-03-10T17:45:00+03:00' },
    ]
    server.use(
      ...createOrganizationHandlers([], [], [makeEmployee()]),
      ...createAttendanceHandlers(workModels, assignments, records),
    )
    renderPage()
    const user = userEvent.setup()

    await selectEmployee(user, 'Ahmet', 'Ahmet Yılmaz')

    const table = await screen.findByRole('table')
    await within(table).findByText('15 dk') // geç kalma (mock hesabı)
    expect(within(table).getByText('10 dk')).toBeInTheDocument() // erken çıkış
  })

  it('çalışma modeli ataması yoksa anlaşılır bir boş durum gösterir', async () => {
    server.use(...createOrganizationHandlers([], [], [makeEmployee()]), ...createAttendanceHandlers(workModels, []))
    renderPage()
    const user = userEvent.setup()

    await selectEmployee(user, 'Ahmet', 'Ahmet Yılmaz')

    expect(await screen.findByText('Bu çalışan için henüz bir çalışma modeli ataması yok.')).toBeInTheDocument()
  })
})
