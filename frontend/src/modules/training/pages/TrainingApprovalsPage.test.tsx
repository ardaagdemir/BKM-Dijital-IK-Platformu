import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { authHandlers } from '../../../../test/msw/handlers/auth'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { createTrainingHandlers } from '../../../../test/msw/handlers/training'
import { server } from '../../../../test/msw/server'
import { setToken } from '../../../shared/api/apiClient'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import { AuthProvider } from '../../auth/AuthProvider'
import type { Employee } from '../../organization/types'
import type { Training, TrainingEnrollment } from '../types'
import { TrainingApprovalsPage } from './TrainingApprovalsPage'

const trainings: Training[] = [{ id: 1, name: 'İletişim Becerileri', type: 'Yumuşak Beceri', durationHours: 8, provider: 'Akademi X' }]

function makeEmployee(overrides: Partial<Employee> = {}): Employee {
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

function makeEnrollment(overrides: Partial<TrainingEnrollment> = {}): TrainingEnrollment {
  return { id: 1, employeeId: 2, trainingId: 1, status: 'PENDING', rejectionReason: null, completedDate: null, ...overrides }
}

function renderPage() {
  setToken('test-token')
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <TrainingApprovalsPage />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>,
  )
}

describe('TrainingApprovalsPage', () => {
  it('ekibinin bekleyen talebini gösterir', async () => {
    const employees: Employee[] = [makeEmployee({ id: 1 }), makeEmployee({ id: 2, firstName: 'Ayşe', lastName: 'Demir' })]
    server.use(
      authHandlers.meYonetici,
      ...createOrganizationHandlers([], [], employees),
      ...createTrainingHandlers(trainings, [makeEnrollment({ id: 1, employeeId: 2 })]),
    )
    renderPage()

    const table = await screen.findByRole('table')
    await within(table).findByText('Ayşe Demir')
    await within(table).findByText('İletişim Becerileri')
  })

  it('bir talep onaylanabilir', async () => {
    const employees: Employee[] = [makeEmployee({ id: 1 }), makeEmployee({ id: 2, firstName: 'Ayşe', lastName: 'Demir' })]
    server.use(
      authHandlers.meYonetici,
      ...createOrganizationHandlers([], [], employees),
      ...createTrainingHandlers(trainings, [makeEnrollment({ id: 1, employeeId: 2 })]),
    )
    renderPage()
    const user = userEvent.setup()

    const table = await screen.findByRole('table')
    await within(table).findByText('Ayşe Demir')
    await user.click(within(table).getByRole('button', { name: 'Onayla' }))

    expect(await screen.findByText('Talep onaylandı')).toBeInTheDocument()
    expect(await screen.findByText('Onay bekleyen eğitim talebi yok.')).toBeInTheDocument()
  })

  it('gerekçesiz ret denemesi validasyon hatası gösterir', async () => {
    const employees: Employee[] = [makeEmployee({ id: 1 }), makeEmployee({ id: 2, firstName: 'Ayşe', lastName: 'Demir' })]
    server.use(
      authHandlers.meYonetici,
      ...createOrganizationHandlers([], [], employees),
      ...createTrainingHandlers(trainings, [makeEnrollment({ id: 1, employeeId: 2 })]),
    )
    renderPage()
    const user = userEvent.setup()

    const table = await screen.findByRole('table')
    await within(table).findByText('Ayşe Demir')
    await user.click(within(table).getByRole('button', { name: 'Reddet' }))

    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Reddet' }))

    expect(await screen.findByText('Ret gerekçesi zorunludur.')).toBeInTheDocument()
  })
})
