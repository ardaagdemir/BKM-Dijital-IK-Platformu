import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { createTrainingHandlers } from '../../../../test/msw/handlers/training'
import { server } from '../../../../test/msw/server'
import { setToken } from '../../../shared/api/apiClient'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import type { Employee } from '../../organization/types'
import type { Training, TrainingEnrollment } from '../types'
import { MyTrainingsPage } from './MyTrainingsPage'

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

const trainings: Training[] = [{ id: 1, name: 'İletişim Becerileri', type: 'Yumuşak Beceri', durationHours: 8, provider: 'Akademi X' }]

function renderPage() {
  setToken('test-token')
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MyTrainingsPage />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

describe('MyTrainingsPage', () => {
  it('yeni talep oluşturur ve listede görünür', async () => {
    server.use(...createOrganizationHandlers([], [], [makeEmployee()]), ...createTrainingHandlers(trainings, []))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir eğitim talebiniz yok.')
    await user.click(screen.getByLabelText('Eğitim'))
    await user.click(await screen.findByRole('option', { name: 'İletişim Becerileri (Akademi X)' }))
    await user.click(screen.getByRole('button', { name: 'Talep Et' }))

    expect(await screen.findByText('Eğitim talebi oluşturuldu')).toBeInTheDocument()
    const table = await screen.findByRole('table')
    await within(table).findByText('İletişim Becerileri')
    expect(within(table).getByText('Bekliyor')).toBeInTheDocument()
  })

  it('reddedilen talep için ret gerekçesini gösterir', async () => {
    const enrollments: TrainingEnrollment[] = [
      { id: 1, employeeId: 1, trainingId: 1, status: 'REJECTED', rejectionReason: 'Bütçe yetersiz', completedDate: null },
    ]
    server.use(
      ...createOrganizationHandlers([], [], [makeEmployee()]),
      ...createTrainingHandlers(trainings, enrollments),
    )
    renderPage()

    const table = await screen.findByRole('table')
    await within(table).findByText('Bütçe yetersiz')
  })
})
