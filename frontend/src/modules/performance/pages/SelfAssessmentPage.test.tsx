import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { createPerformanceHandlers } from '../../../../test/msw/handlers/performance'
import { server } from '../../../../test/msw/server'
import { setToken } from '../../../shared/api/apiClient'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import type { Employee } from '../../organization/types'
import type { Competency, Goal, RatingScale } from '../types'
import { SelfAssessmentPage } from './SelfAssessmentPage'

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

const goals: Goal[] = [{ id: 1, name: 'Satış Artışı', weight: 60 }]
const competencies: Competency[] = [{ id: 1, name: 'Takım Çalışması', weight: 40 }]
const scale: RatingScale = { id: 1, minValue: 1, maxValue: 5 }

function renderPage() {
  setToken('test-token')
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <SelfAssessmentPage />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

describe('SelfAssessmentPage', () => {
  it('hedef/yetkinlik setini gösterir ve en az bir puanla gönderilebilir', async () => {
    server.use(
      ...createOrganizationHandlers([], [], [makeEmployee()]),
      ...createPerformanceHandlers(goals, competencies, scale),
    )
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Puan aralığı: 1–5')
    await user.type(screen.getByLabelText('Satış Artışı'), '4')
    await user.click(screen.getByRole('button', { name: 'Gönder' }))

    expect(await screen.findByText('Öz değerlendirme gönderildi')).toBeInTheDocument()
    expect(await screen.findByText('Öz değerlendirmeniz gönderildi. Teşekkür ederiz.')).toBeInTheDocument()
  })

  it('hiç puan girilmeden gönderilince hata gösterir', async () => {
    server.use(
      ...createOrganizationHandlers([], [], [makeEmployee()]),
      ...createPerformanceHandlers(goals, competencies, scale),
    )
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Puan aralığı: 1–5')
    await user.click(screen.getByRole('button', { name: 'Gönder' }))

    expect(await screen.findByText('En az bir puan girilmelidir.')).toBeInTheDocument()
  })

  it('skala dışı puanla gönderilince backend hatasını gösterir', async () => {
    server.use(
      ...createOrganizationHandlers([], [], [makeEmployee()]),
      ...createPerformanceHandlers(goals, competencies, scale),
    )
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Puan aralığı: 1–5')
    await user.type(screen.getByLabelText('Satış Artışı'), '9')
    await user.click(screen.getByRole('button', { name: 'Gönder' }))

    expect(await screen.findByText('Puan 1 ile 5 arasında olmalıdır.')).toBeInTheDocument()
  })

  it('puanlama skalası tanımlı değilse anlaşılır bir boş durum gösterir', async () => {
    server.use(...createOrganizationHandlers([], [], [makeEmployee()]), ...createPerformanceHandlers())
    renderPage()

    expect(
      await screen.findByText('Puanlama skalası henüz tanımlanmadığından değerlendirme formu kullanılamıyor.'),
    ).toBeInTheDocument()
  })
})
