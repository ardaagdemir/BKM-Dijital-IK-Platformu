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
import { TrainingCompletedPage } from './TrainingCompletedPage'

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
        <TrainingCompletedPage />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

async function selectEmployee(user: ReturnType<typeof userEvent.setup>, name: string, option: string) {
  const employeeInput = screen.getByRole('combobox', { name: 'Çalışan (tamamlanmayı işaretlemek için)' })
  await user.click(employeeInput)
  await user.type(employeeInput, name)
  await user.click(await screen.findByRole('option', { name: option }))
}

describe('TrainingCompletedPage', () => {
  it('onaylı bir talep tamamlandı olarak işaretlenir ve rapora eklenir', async () => {
    const enrollments: TrainingEnrollment[] = [
      { id: 1, employeeId: 1, trainingId: 1, status: 'APPROVED', rejectionReason: null, completedDate: null },
    ]
    server.use(...createOrganizationHandlers([], [], [makeEmployee()]), ...createTrainingHandlers(trainings, enrollments))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz tamamlanan bir eğitim yok.')

    await selectEmployee(user, 'Ahmet', 'Ahmet Yılmaz')

    // `ResponsiveTable` masaüstü tablo + mobil kartı AYNI ANDA render eder
    // (bkz. leave/organization'daki AYNI desen) — tabloya scope edilir.
    const pendingTable = await screen.findByRole('table')
    await within(pendingTable).findByText('İletişim Becerileri')
    await user.click(within(pendingTable).getByRole('button', { name: 'Tamamlandı Olarak İşaretle' }))
    await user.type(screen.getByLabelText('Tamamlanma Tarihi'), '2026-03-15')
    await user.click(screen.getByRole('button', { name: 'Kaydet' }))

    expect(await screen.findByText('Eğitim tamamlandı olarak işaretlendi')).toBeInTheDocument()
    expect(
      await screen.findByText('Bu çalışan için tamamlanmayı bekleyen onaylı bir eğitim talebi yok.'),
    ).toBeInTheDocument()

    const reportTable = await screen.findByRole('table')
    await within(reportTable).findByText('İletişim Becerileri')
    await within(reportTable).findByText('2026-03-15')
  })

  it('çalışan seçilmeden rapor org geneli gösterilir', async () => {
    const enrollments: TrainingEnrollment[] = [
      { id: 1, employeeId: 1, trainingId: 1, status: 'COMPLETED', rejectionReason: null, completedDate: '2026-01-10' },
    ]
    server.use(...createOrganizationHandlers([], [], [makeEmployee()]), ...createTrainingHandlers(trainings, enrollments))
    renderPage()

    const table = await screen.findByRole('table')
    await within(table).findByText('İletişim Becerileri')
    await within(table).findByText('2026-01-10')
  })
})
