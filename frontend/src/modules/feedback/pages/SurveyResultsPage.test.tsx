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
import type { Survey } from '../types'
import { SurveyAnswerPage } from './SurveyAnswerPage'
import { SurveyResultsPage } from './SurveyResultsPage'

const survey: Survey = {
  id: 1,
  question: 'Yemekhane memnuniyeti?',
  anonymous: true,
  options: [
    { id: 1, text: 'Evet' },
    { id: 2, text: 'Hayır' },
  ],
}

function renderRouter(initialEntry: string) {
  setToken('test-token')
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(
    [
      { path: '/surveys', element: <div>Anket Listesi</div> },
      { path: '/surveys/:id/answer', element: <SurveyAnswerPage /> },
      { path: '/surveys/:id/results', element: <SurveyResultsPage /> },
    ],
    { initialEntries: [initialEntry] },
  )
  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>,
  )
  return router
}

describe('SurveyResultsPage', () => {
  it('hiç yanıt yokken tüm seçenekler %0 gösterir', async () => {
    server.use(...createOrganizationHandlers([], [], []), ...createFeedbackHandlers([survey]))
    renderRouter('/surveys/1/results')

    await screen.findByText('Yemekhane memnuniyeti?')
    expect(screen.getByText('Toplam yanıt: 0')).toBeInTheDocument()
    expect(screen.getAllByText('%0 (0)')).toHaveLength(2)
  })

  it('yanıt verildikten sonra seçenek bazlı yüzdeyi gösterir', async () => {
    server.use(...createOrganizationHandlers([], [], []), ...createFeedbackHandlers([survey]))
    const router = renderRouter('/surveys/1/answer')
    const user = userEvent.setup()

    await screen.findByText('Yemekhane memnuniyeti?')
    await user.click(screen.getByRole('radio', { name: 'Evet' }))
    await user.click(screen.getByRole('button', { name: 'Yanıtı Gönder' }))
    await screen.findByText('Anket Listesi')

    await router.navigate('/surveys/1/results')

    expect(await screen.findByText('Toplam yanıt: 1')).toBeInTheDocument()
    expect(screen.getByText('%100 (1)')).toBeInTheDocument()
    expect(screen.getByText('%0 (0)')).toBeInTheDocument()
  })
})
