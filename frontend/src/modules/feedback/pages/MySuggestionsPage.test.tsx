import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createFeedbackHandlers } from '../../../../test/msw/handlers/feedback'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { server } from '../../../../test/msw/server'
import { setToken } from '../../../shared/api/apiClient'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import type { Employee } from '../../organization/types'
import type { SuggestionCategory } from '../types'
import { MySuggestionsPage } from './MySuggestionsPage'

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

const category: SuggestionCategory = { id: 1, name: 'Ofis' }

function renderPage() {
  setToken('test-token')
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MySuggestionsPage />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

describe('MySuggestionsPage', () => {
  it('kategori seçip talep gönderir ve kendi listesinde görür', async () => {
    server.use(
      ...createOrganizationHandlers([], [], [makeEmployee()]),
      ...createFeedbackHandlers([], [category]),
    )
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir talebiniz yok.')
    await user.click(screen.getByLabelText('Kategori'))
    await user.click(await screen.findByRole('option', { name: 'Ofis' }))
    await user.type(screen.getByLabelText('Açıklama'), 'Ofiste iklimlendirme yetersiz.')
    await user.click(screen.getByRole('button', { name: 'Gönder' }))

    expect(await screen.findByText('Talep gönderildi')).toBeInTheDocument()
    const table = await screen.findByRole('table')
    await within(table).findByText('Ofiste iklimlendirme yetersiz.')
    await within(table).findByText('Değerlendirmede')
  })

  it('kategori tanımlı değilse bilgilendirme gösterir ve formu devre dışı bırakır', async () => {
    server.use(...createOrganizationHandlers([], [], [makeEmployee()]), ...createFeedbackHandlers([], []))
    renderPage()

    await screen.findByText('Henüz bir kategori tanımlanmadı, İK ile iletişime geçin.')
  })
})
