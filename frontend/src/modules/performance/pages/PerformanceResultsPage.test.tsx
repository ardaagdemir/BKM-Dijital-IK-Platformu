import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createPerformanceHandlers } from '../../../../test/msw/handlers/performance'
import { server } from '../../../../test/msw/server'
import { setToken } from '../../../shared/api/apiClient'
import type { Competency, Goal, ManagerAssessment, RatingScale } from '../types'
import { PerformanceResultsPage } from './PerformanceResultsPage'

const goals: Goal[] = [{ id: 1, name: 'Satış Artışı', weight: 100 }]
const competencies: Competency[] = [{ id: 1, name: 'Takım Çalışması', weight: 100 }]
const scale: RatingScale = { id: 1, minValue: 1, maxValue: 5 }

function renderPage(employeeId = 1) {
  setToken('test-token')
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(
    [{ path: '/performance/results/:employeeId', element: <PerformanceResultsPage /> }],
    { initialEntries: [`/performance/results/${employeeId}`] },
  )
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('PerformanceResultsPage', () => {
  it('dönem bazlı geçmiş sonuçları listeler ve nihai not ayrıntısını gösterir', async () => {
    const assessment: ManagerAssessment = {
      id: 1,
      employeeId: 1,
      period: '2026-Q1',
      scores: [{ id: 1, itemType: 'GOAL', itemId: 1, score: 4 }],
    }
    server.use(
      ...createPerformanceHandlers(goals, competencies, scale, { id: 1, goalWeight: 60, competencyWeight: 40 }, [
        assessment,
      ]),
    )
    renderPage()
    const user = userEvent.setup()

    const table = await screen.findByRole('table')
    await within(table).findByText('2026-Q1')
    await within(table).findByText('4.0')

    await user.click(within(table).getByRole('button', { name: 'Detay' }))

    expect(await screen.findByText('2026-Q1 Dönemi Nihai Not Ayrıntısı')).toBeInTheDocument()
    expect(screen.getByText('Hedef Puanı (ağırlık %60)')).toBeInTheDocument()
    expect(screen.getAllByText('4.0').length).toBeGreaterThan(0)
  })

  it('hiç değerlendirme yoksa boş durum gösterir', async () => {
    server.use(...createPerformanceHandlers(goals, competencies, scale))
    renderPage()

    expect(await screen.findByText('Henüz bir değerlendirme sonucu yok.')).toBeInTheDocument()
  })
})
