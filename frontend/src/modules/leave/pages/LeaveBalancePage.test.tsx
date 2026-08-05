import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createLeaveHandlers } from '../../../../test/msw/handlers/leave'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { server } from '../../../../test/msw/server'
import { setToken } from '../../../shared/api/apiClient'
import type { Employee } from '../../organization/types'
import { LeaveBalancePage } from './LeaveBalancePage'

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
      <LeaveBalancePage />
    </QueryClientProvider>,
  )
}

// Bölüm 14.3 Testler: balance sayfasının doğru render edildiği +
// çalışan kaydı yokken (404) anlaşılır bir boş durum gösterdiği.
describe('LeaveBalancePage', () => {
  it('hak ediş/kullanılan/bekleyen/kalan alanlarını gösterir', async () => {
    server.use(...createOrganizationHandlers([], [], [makeEmployee()]), ...createLeaveHandlers())
    renderPage()

    await screen.findByText('Hak Ediş')
    // Talep yokken Hak Ediş/Kalan AYNI değeri (14 gün), Kullanılan/Bekleyen
    // de AYNI değeri (0 gün) gösterir — her biri için İKİ eşleşme beklenir.
    expect(screen.getAllByText('14 gün')).toHaveLength(2)
    expect(screen.getAllByText('0 gün')).toHaveLength(2)
  })

  it('çalışan kaydı yoksa anlaşılır bir boş durum gösterir', async () => {
    server.use(...createOrganizationHandlers([], [], []), ...createLeaveHandlers())
    renderPage()

    expect(await screen.findByText('Sisteme bağlı bir çalışan kaydınız bulunamadı.')).toBeInTheDocument()
  })
})
