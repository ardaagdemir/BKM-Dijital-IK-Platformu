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
import type { AppointmentSlot, ServiceOffering } from '../types'
import { AppointmentBookingPage } from './AppointmentBookingPage'

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
        <AppointmentBookingPage />
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

describe('AppointmentBookingPage', () => {
  it('hizmet+slot seçip randevu alır ve listede görür', async () => {
    server.use(...createOrganizationHandlers([], [], [makeEmployee()]), ...createAppointmentHandlers([service], [slot]))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir randevunuz yok.')
    await user.click(screen.getByLabelText('Hizmet'))
    await user.click(await screen.findByRole('option', { name: 'Diş Hekimi' }))

    await user.click(screen.getByLabelText('Slot'))
    await user.click(await screen.findByRole('option', { name: /09:00/ }))
    await user.click(screen.getByRole('button', { name: 'Randevu Al' }))

    expect(await screen.findByText('Randevu oluşturuldu')).toBeInTheDocument()
    const table = await screen.findByRole('table')
    await within(table).findByText('Diş Hekimi')
  })

  it('aynı slota ikinci kez randevu alınamaz', async () => {
    server.use(
      ...createOrganizationHandlers([], [], [makeEmployee()]),
      ...createAppointmentHandlers([service], [slot], [{ id: 1, slotId: 1, employeeId: 99 }]),
    )
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir randevunuz yok.')

    await user.click(screen.getByLabelText('Hizmet'))
    await user.click(await screen.findByRole('option', { name: 'Diş Hekimi' }))
    await user.click(screen.getByLabelText('Slot'))
    await user.click(await screen.findByRole('option', { name: /09:00/ }))
    await user.click(screen.getByRole('button', { name: 'Randevu Al' }))

    expect(await screen.findByText('Bu slot zaten dolu.')).toBeInTheDocument()
  })
})
