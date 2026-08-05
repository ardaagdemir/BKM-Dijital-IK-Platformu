import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createDisciplineHandlers } from '../../../../test/msw/handlers/discipline'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { server } from '../../../../test/msw/server'
import { setToken } from '../../../shared/api/apiClient'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import type { Employee } from '../../organization/types'
import { AwardsPage } from './AwardsPage'

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
        <AwardsPage />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

describe('AwardsPage', () => {
  it('çalışan seçilip ödül kaydı oluşturulur', async () => {
    server.use(...createOrganizationHandlers([], [], [makeEmployee()]), ...createDisciplineHandlers())
    renderPage()
    const user = userEvent.setup()

    const employeeInput = screen.getByRole('combobox', { name: 'Çalışan' })
    await user.click(employeeInput)
    await user.type(employeeInput, 'Ahmet')
    await user.click(await screen.findByRole('option', { name: 'Ahmet Yılmaz' }))

    await screen.findByText('Bu çalışan için henüz bir ödül kaydı yok.')
    await user.click(screen.getByRole('button', { name: 'Yeni Ödül' }))
    await user.type(screen.getByLabelText('Ödül Türü'), 'Yılın Çalışanı')
    await user.type(screen.getByLabelText('Açıklama'), 'Üstün performans')
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    expect(await screen.findByText('Ödül kaydı oluşturuldu')).toBeInTheDocument()
    const table = await screen.findByRole('table')
    await within(table).findByText('Yılın Çalışanı')
  })
})
