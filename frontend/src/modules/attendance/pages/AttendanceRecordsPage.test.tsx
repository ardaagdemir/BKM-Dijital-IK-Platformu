import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createAttendanceHandlers } from '../../../../test/msw/handlers/attendance'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { server } from '../../../../test/msw/server'
import { setToken } from '../../../shared/api/apiClient'
import type { Employee } from '../../organization/types'
import type { AttendanceRecord } from '../types'
import { AttendanceRecordsPage } from './AttendanceRecordsPage'

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
      <AttendanceRecordsPage />
    </QueryClientProvider>,
  )
}

describe('AttendanceRecordsPage', () => {
  it('çalışan seçilmeden boş durum gösterir, seçilince kayıtları listeler', async () => {
    const records: AttendanceRecord[] = [
      { id: 1, employeeId: 1, checkInAt: '2026-03-10T09:05:00+03:00', checkOutAt: '2026-03-10T18:02:00+03:00' },
    ]
    server.use(...createOrganizationHandlers([], [], [makeEmployee()]), ...createAttendanceHandlers([], [], records))
    renderPage()
    const user = userEvent.setup()

    expect(screen.getByText('Kayıtları görüntülemek için bir çalışan seçin.')).toBeInTheDocument()

    // Autocomplete AÇIKKEN, açılan `listbox` da `aria-labelledby` ile AYNI
    // etikete referans veriyor — `getByLabelText` İKİ eşleşme buluyor
    // (input + listbox); `getByRole('combobox')` yalnızca input'u hedefler.
    const employeeInput = screen.getByRole('combobox', { name: 'Çalışan' })
    await user.click(employeeInput)
    await user.type(employeeInput, 'Ahmet')
    await user.click(await screen.findByRole('option', { name: 'Ahmet Yılmaz' }))

    const table = await screen.findByRole('table')
    expect(within(table).getAllByRole('row')).toHaveLength(2) // başlık + 1 kayıt
  })

  it('kayıt yoksa anlaşılır bir boş durum gösterir', async () => {
    server.use(...createOrganizationHandlers([], [], [makeEmployee()]), ...createAttendanceHandlers([], [], []))
    renderPage()
    const user = userEvent.setup()

    // Autocomplete AÇIKKEN, açılan `listbox` da `aria-labelledby` ile AYNI
    // etikete referans veriyor — `getByLabelText` İKİ eşleşme buluyor
    // (input + listbox); `getByRole('combobox')` yalnızca input'u hedefler.
    const employeeInput = screen.getByRole('combobox', { name: 'Çalışan' })
    await user.click(employeeInput)
    await user.type(employeeInput, 'Ahmet')
    await user.click(await screen.findByRole('option', { name: 'Ahmet Yılmaz' }))

    expect(await screen.findByText('Bu çalışan için henüz bir devam kaydı yok.')).toBeInTheDocument()
  })
})
