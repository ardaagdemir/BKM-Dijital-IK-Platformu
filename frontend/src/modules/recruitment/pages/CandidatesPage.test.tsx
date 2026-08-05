import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createRecruitmentHandlers } from '../../../../test/msw/handlers/recruitment'
import { server } from '../../../../test/msw/server'
import type { Candidate } from '../types'
import { CandidatesPage } from './CandidatesPage'

function makeCandidate(overrides: Partial<Candidate> = {}): Candidate {
  return {
    id: 1,
    firstName: 'Zeynep',
    lastName: 'Kaya',
    email: 'zeynep@ornek.com',
    appliedPosition: 'Backend Geliştirici',
    cvFileName: 'cv.pdf',
    stage: 'APPLICATION',
    converted: false,
    ...overrides,
  }
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(
    [
      { path: '/recruitment/candidates', element: <CandidatesPage /> },
      { path: '/recruitment/candidates/:id', element: <div>Aday Detay Sayfası</div> },
    ],
    { initialEntries: ['/recruitment/candidates'] },
  )
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

// Bölüm 14.4 Testler: "Entegrasyon: aşama StatusChip geçişleri" — liste
// tarafı: doğru StatusChip'in gösterildiği + satıra tıklayınca detaya gittiği.
describe('CandidatesPage', () => {
  it('adayları listeler, aşama StatusChip gösterir ve satıra tıklayınca detaya gider', async () => {
    server.use(
      ...createRecruitmentHandlers(
        [],
        [makeCandidate({ id: 1, stage: 'APPLICATION' }), makeCandidate({ id: 2, firstName: 'Ali', stage: 'HIRED' })],
      ),
    )
    renderPage()
    const user = userEvent.setup()

    const table = await screen.findByRole('table')
    await within(table).findByText('Zeynep Kaya')
    expect(within(table).getByText('Başvuru')).toBeInTheDocument()
    expect(within(table).getByText('İşe Alındı')).toBeInTheDocument()

    await user.click(within(table).getByText('Zeynep Kaya'))
    expect(await screen.findByText('Aday Detay Sayfası')).toBeInTheDocument()
  })

  it('isme göre arama ve aşama filtresiyle daraltılır', async () => {
    server.use(
      ...createRecruitmentHandlers(
        [],
        [makeCandidate({ id: 1, stage: 'APPLICATION' }), makeCandidate({ id: 2, firstName: 'Ali', lastName: 'Veli', stage: 'HIRED' })],
      ),
    )
    renderPage()
    const user = userEvent.setup()

    const table = await screen.findByRole('table')
    expect(within(table).getAllByRole('row')).toHaveLength(3) // başlık + 2 aday

    await user.type(screen.getByLabelText('İsim veya pozisyon ara'), 'Zeynep')
    expect(within(table).getAllByRole('row')).toHaveLength(2) // başlık + 1 aday
    await user.clear(screen.getByLabelText('İsim veya pozisyon ara'))

    await user.click(screen.getByLabelText('Aşama'))
    await user.click(await screen.findByRole('option', { name: 'İşe Alındı' }))
    expect(within(table).getAllByRole('row')).toHaveLength(2) // başlık + 1 aday
    expect(within(table).getByText('Ali Veli')).toBeInTheDocument()
  })

  it('hiç başvuru yokken boş durum gösterir', async () => {
    server.use(...createRecruitmentHandlers([], []))
    renderPage()

    expect(await screen.findByText('Henüz bir başvuru yok.')).toBeInTheDocument()
  })
})
