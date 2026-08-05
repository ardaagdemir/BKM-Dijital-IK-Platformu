import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createFeedbackHandlers } from '../../../../test/msw/handlers/feedback'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { server } from '../../../../test/msw/server'
import { setToken } from '../../../shared/api/apiClient'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import type { Employee } from '../../organization/types'
import type { Survey } from '../types'
import { SurveyAnswerPage } from './SurveyAnswerPage'

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
  const router = createMemoryRouter(
    [
      { path: '/surveys/:id/answer', element: <SurveyAnswerPage /> },
      { path: '/surveys', element: <div>Anket Listesi</div> },
    ],
    { initialEntries: ['/surveys/1/answer'] },
  )
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

const anonymousSurvey: Survey = {
  id: 1,
  question: 'Yemekhane memnuniyeti?',
  anonymous: true,
  options: [
    { id: 1, text: 'Evet' },
    { id: 2, text: 'Hayır' },
  ],
}

const namedSurvey: Survey = { ...anonymousSurvey, anonymous: false }

describe('SurveyAnswerPage', () => {
  it('anonim ankette çalışan kaydı olmasa bile yanıt verilebilir', async () => {
    server.use(...createOrganizationHandlers([], [], []), ...createFeedbackHandlers([anonymousSurvey]))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Yemekhane memnuniyeti?')
    await user.click(screen.getByRole('radio', { name: 'Evet' }))
    await user.click(screen.getByRole('button', { name: 'Yanıtı Gönder' }))

    expect(await screen.findByText('Yanıtınız kaydedildi')).toBeInTheDocument()
    await screen.findByText('Anket Listesi')
  })

  it('anonim OLMAYAN ankette çalışan kaydı yoksa yanıtlama engellenir', async () => {
    server.use(...createOrganizationHandlers([], [], []), ...createFeedbackHandlers([namedSurvey]))
    renderPage()

    await screen.findByText(
      'Sisteme bağlı bir çalışan kaydınız bulunamadığından anonim OLMAYAN bu anketi yanıtlayamazsınız.',
    )
  })

  it('anonim OLMAYAN ankette çalışan kaydı varsa yanıt verilebilir', async () => {
    server.use(...createOrganizationHandlers([], [], [makeEmployee()]), ...createFeedbackHandlers([namedSurvey]))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Yemekhane memnuniyeti?')
    await user.click(screen.getByRole('radio', { name: 'Hayır' }))
    await user.click(screen.getByRole('button', { name: 'Yanıtı Gönder' }))

    expect(await screen.findByText('Yanıtınız kaydedildi')).toBeInTheDocument()
  })

  it('seçenek seçilmeden submit edilince validasyon hatasını gösterir', async () => {
    server.use(...createOrganizationHandlers([], [], []), ...createFeedbackHandlers([anonymousSurvey]))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Yemekhane memnuniyeti?')
    await user.click(screen.getByRole('button', { name: 'Yanıtı Gönder' }))

    expect(await screen.findByText('Bir seçenek seçilmelidir.')).toBeInTheDocument()
  })
})
