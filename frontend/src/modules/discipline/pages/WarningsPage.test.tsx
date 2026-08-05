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
import { WarningsPage } from './WarningsPage'

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
        <WarningsPage />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

async function selectEmployee(user: ReturnType<typeof userEvent.setup>, name: string, option: string) {
  const employeeInput = screen.getByRole('combobox', { name: 'Çalışan' })
  await user.click(employeeInput)
  await user.type(employeeInput, name)
  await user.click(await screen.findByRole('option', { name: option }))
}

describe('WarningsPage', () => {
  it('çalışan seçilip uyarı kaydı oluşturulur', async () => {
    server.use(...createOrganizationHandlers([], [], [makeEmployee()]), ...createDisciplineHandlers([]))
    renderPage()
    const user = userEvent.setup()

    await selectEmployee(user, 'Ahmet', 'Ahmet Yılmaz')
    await screen.findByText('Bu çalışan için henüz bir uyarı kaydı yok.')

    await user.click(screen.getByRole('button', { name: 'Yeni Uyarı' }))
    await user.type(screen.getByLabelText('Tarih'), '2026-03-10')
    await user.type(screen.getByLabelText('Sebep'), 'İşe geç kalma')
    await user.type(screen.getByLabelText('Açıklama'), 'Üç kez peş peşe geç kalındı.')
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    expect(await screen.findByText('Uyarı kaydı oluşturuldu')).toBeInTheDocument()
    const table = await screen.findByRole('table')
    await within(table).findByText('İşe geç kalma')
  })

  it('boş sebeple submit edilince validasyon hatasını gösterir', async () => {
    server.use(...createOrganizationHandlers([], [], [makeEmployee()]), ...createDisciplineHandlers([]))
    renderPage()
    const user = userEvent.setup()

    await selectEmployee(user, 'Ahmet', 'Ahmet Yılmaz')
    await user.click(screen.getByRole('button', { name: 'Yeni Uyarı' }))
    await user.type(screen.getByLabelText('Tarih'), '2026-03-10')
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    expect(await screen.findByText('Sebep boş olamaz.')).toBeInTheDocument()
  })
})
