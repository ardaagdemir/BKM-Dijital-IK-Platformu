import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createAppointmentHandlers } from '../../../../test/msw/handlers/amenities'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { server } from '../../../../test/msw/server'
import { setToken } from '../../../shared/api/apiClient'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import type { Employee } from '../../organization/types'
import type { Appointment, AppointmentSlot, ServiceOffering } from '../types'
import { AppointmentNotesPage } from './AppointmentNotesPage'

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
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AppointmentNotesPage />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

const service: ServiceOffering = { id: 1, name: 'Diş Hekimi' }
const slot: AppointmentSlot = {
  id: 1,
  serviceOfferingId: 1,
  startTime: '2026-03-10T09:00:00+03:00',
  endTime: '2026-03-10T09:30:00+03:00',
}
const appointment: Appointment = { id: 1, slotId: 1, employeeId: 1 }

describe('AppointmentNotesPage', () => {
  it('çalışan seçilip randevu notu yazılır ve kaydedilir', async () => {
    server.use(
      ...createOrganizationHandlers([], [], [makeEmployee()]),
      ...createAppointmentHandlers([service], [slot], [appointment]),
    )
    renderPage()
    const user = userEvent.setup()

    const employeeInput = screen.getByRole('combobox', { name: 'Çalışan' })
    await user.click(employeeInput)
    await user.type(employeeInput, 'Ahmet')
    await user.click(await screen.findByRole('option', { name: 'Ahmet Yılmaz' }))

    const table = await screen.findByRole('table')
    await within(table).findByText('Diş Hekimi')
    await user.click(within(table).getByRole('button', { name: 'Randevu notunu düzenle' }))

    await user.type(screen.getByLabelText('Not'), 'Kontrol muayenesi.')
    await user.click(screen.getByRole('button', { name: 'Kaydet' }))

    expect(await screen.findByText('Not kaydedildi')).toBeInTheDocument()
  })
})
