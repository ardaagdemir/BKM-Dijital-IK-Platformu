import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import { authHandlers } from '../../../../test/msw/handlers/auth'
import { createAttendanceHandlers } from '../../../../test/msw/handlers/attendance'
import { createLeaveHandlers } from '../../../../test/msw/handlers/leave'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { server } from '../../../../test/msw/server'
import { setToken } from '../../../shared/api/apiClient'
import { AuthProvider } from '../../auth/AuthProvider'
import type { Employee } from '../../organization/types'
import type { WorkModel, WorkModelAssignment } from '../types'
import { TimesheetPage } from './TimesheetPage'

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
      <AuthProvider>
        <TimesheetPage />
      </AuthProvider>
    </QueryClientProvider>,
  )
}

describe('TimesheetPage', () => {
  it('ADMIN çalışan seçip puantajı görüntüleyebilir', async () => {
    const assignments: WorkModelAssignment[] = [{ employeeId: 1, workModelId: 1 }]
    server.use(
      authHandlers.meAdmin,
      ...createOrganizationHandlers([], [], [makeEmployee()]),
      ...createAttendanceHandlers(workModels, assignments, []),
      ...createLeaveHandlers(),
    )
    renderPage()
    const user = userEvent.setup()

    const employeeInput = await screen.findByRole('combobox', { name: 'Çalışan' })
    await user.click(employeeInput)
    await user.type(employeeInput, 'Ahmet')
    await user.click(await screen.findByRole('option', { name: 'Ahmet Yılmaz' }))

    const table = await screen.findByRole('table')
    const currentMonthDays = dayjs().daysInMonth()
    expect(within(table).getAllByRole('row')).toHaveLength(currentMonthDays + 1) // başlık + her gün
  })

  it('CALISAN çalışan seçici GÖRMEZ, doğrudan KENDİ puantajını görür', async () => {
    const assignments: WorkModelAssignment[] = [{ employeeId: 1, workModelId: 1 }]
    server.use(
      authHandlers.meCalisan,
      ...createOrganizationHandlers([], [], [makeEmployee({ email: 'calisan@dijitalik.local' })]),
      ...createAttendanceHandlers(workModels, assignments, []),
      ...createLeaveHandlers(),
    )
    renderPage()

    expect(screen.queryByRole('combobox', { name: 'Çalışan' })).not.toBeInTheDocument()
    await screen.findByRole('table')
  })

  it('çalışma modeli ataması yoksa anlaşılır bir boş durum gösterir', async () => {
    server.use(
      authHandlers.meAdmin,
      ...createOrganizationHandlers([], [], [makeEmployee()]),
      ...createAttendanceHandlers(workModels, []),
      ...createLeaveHandlers(),
    )
    renderPage()
    const user = userEvent.setup()

    const employeeInput = await screen.findByRole('combobox', { name: 'Çalışan' })
    await user.click(employeeInput)
    await user.type(employeeInput, 'Ahmet')
    await user.click(await screen.findByRole('option', { name: 'Ahmet Yılmaz' }))

    expect(await screen.findByText('Bu çalışan için henüz bir çalışma modeli ataması yok.')).toBeInTheDocument()
  })
})
