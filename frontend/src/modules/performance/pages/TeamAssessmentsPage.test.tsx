import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { createPerformanceHandlers } from '../../../../test/msw/handlers/performance'
import { server } from '../../../../test/msw/server'
import { setToken } from '../../../shared/api/apiClient'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import type { Employee } from '../../organization/types'
import type { Competency, Goal, RatingScale } from '../types'
import { TeamAssessmentsPage } from './TeamAssessmentsPage'

function makeEmployee(overrides: Partial<Employee> = {}): Employee {
  return {
    id: 1,
    firstName: 'Bir',
    lastName: 'Yönetici',
    nationalId: '10000000146',
    hireDate: '2020-01-15',
    email: 'yonetici@dijitalik.local',
    organizationUnitId: 10,
    jobTitleId: null,
    iban: null,
    ...overrides,
  }
}

const goals: Goal[] = [{ id: 1, name: 'Satış Artışı', weight: 60 }]
const competencies: Competency[] = [{ id: 1, name: 'Takım Çalışması', weight: 40 }]
const scale: RatingScale = { id: 1, minValue: 1, maxValue: 5 }

function renderPage() {
  setToken('test-token')
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(
    [
      { path: '/performance/team-assessments', element: <TeamAssessmentsPage /> },
      { path: '/performance/results/:employeeId', element: <div>Sonuçlar Sayfası</div> },
    ],
    { initialEntries: ['/performance/team-assessments'] },
  )
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

describe('TeamAssessmentsPage', () => {
  it('ekip üyesi seçilip değerlendirme gönderilir ve sonuçlar sayfasına yönlendirir', async () => {
    const employees: Employee[] = [
      makeEmployee({ id: 1 }), // "ben" (yönetici) — /employees/me bu dizideki İLKİ döner
      makeEmployee({ id: 2, firstName: 'Ayşe', lastName: 'Demir' }),
    ]
    server.use(
      ...createOrganizationHandlers([], [], employees),
      ...createPerformanceHandlers(goals, competencies, scale),
    )
    renderPage()
    const user = userEvent.setup()

    await user.click(await screen.findByLabelText('Çalışan'))
    await user.click(await screen.findByRole('option', { name: 'Ayşe Demir' }))
    await user.type(screen.getByLabelText('Dönem'), '2026-Q1')
    await user.type(screen.getByLabelText('Satış Artışı'), '4')
    await user.click(screen.getByRole('button', { name: 'Gönder' }))

    expect(await screen.findByText('Değerlendirme gönderildi')).toBeInTheDocument()
    expect(await screen.findByText('Sonuçlar Sayfası')).toBeInTheDocument()
  })

  it('biriminde başka çalışan yoksa boş durum gösterir', async () => {
    server.use(
      ...createOrganizationHandlers([], [], [makeEmployee({ id: 1 })]),
      ...createPerformanceHandlers(goals, competencies, scale),
    )
    renderPage()

    expect(await screen.findByText('Biriminizde başka bir çalışan yok.')).toBeInTheDocument()
  })

  it('çalışan seçilmeden gönderilince hata gösterir', async () => {
    const employees: Employee[] = [makeEmployee({ id: 1 }), makeEmployee({ id: 2, firstName: 'Ayşe', lastName: 'Demir' })]
    server.use(
      ...createOrganizationHandlers([], [], employees),
      ...createPerformanceHandlers(goals, competencies, scale),
    )
    renderPage()
    const user = userEvent.setup()

    await screen.findByLabelText('Çalışan')
    await user.type(screen.getByLabelText('Dönem'), '2026-Q1')
    await user.click(screen.getByRole('button', { name: 'Gönder' }))

    expect(await screen.findByText('Çalışan seçilmelidir.')).toBeInTheDocument()
  })
})
