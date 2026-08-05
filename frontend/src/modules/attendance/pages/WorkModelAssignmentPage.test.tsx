import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createAttendanceHandlers } from '../../../../test/msw/handlers/attendance'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { server } from '../../../../test/msw/server'
import { setToken } from '../../../shared/api/apiClient'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import type { Employee } from '../../organization/types'
import type { WorkModel, WorkModelAssignment } from '../types'
import { WorkModelAssignmentPage } from './WorkModelAssignmentPage'

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

const workModels: WorkModel[] = [
  { id: 1, name: 'Tam Zamanlı', plannedStartTime: '09:00:00', plannedEndTime: '18:00:00' },
  { id: 2, name: 'Vardiyalı', plannedStartTime: '14:00:00', plannedEndTime: '22:00:00' },
]

function renderPage() {
  setToken('test-token')
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(
    [{ path: '/attendance/employees/:id/work-model', element: <WorkModelAssignmentPage /> }],
    { initialEntries: ['/attendance/employees/1/work-model'] },
  )
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

describe('WorkModelAssignmentPage', () => {
  it('atama yokken boş formla ilk kez atanabilir', async () => {
    server.use(...createOrganizationHandlers([], [], [makeEmployee()]), ...createAttendanceHandlers(workModels))
    renderPage()
    const user = userEvent.setup()

    await screen.findByRole('heading', { name: 'Ahmet Yılmaz — Çalışma Modeli' })
    await user.click(screen.getByLabelText('Çalışma Modeli'))
    await user.click(await screen.findByRole('option', { name: 'Tam Zamanlı (09:00–18:00)' }))
    await user.click(screen.getByRole('button', { name: 'Ata' }))

    expect(await screen.findByText('Çalışma modeli atandı')).toBeInTheDocument()
  })

  it('mevcut atama önceden dolu gelir', async () => {
    const assignments: WorkModelAssignment[] = [{ employeeId: 1, workModelId: 2 }]
    server.use(
      ...createOrganizationHandlers([], [], [makeEmployee()]),
      ...createAttendanceHandlers(workModels, assignments),
    )
    renderPage()

    expect(await screen.findByLabelText('Çalışma Modeli')).toHaveTextContent('Vardiyalı (14:00–22:00)')
  })
})
