import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createRecruitmentHandlers } from '../../../../test/msw/handlers/recruitment'
import { server } from '../../../../test/msw/server'
import { setToken } from '../../../shared/api/apiClient'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import type { Candidate } from '../types'
import { CandidateDetailPage } from './CandidateDetailPage'

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

function renderPage(candidate: Candidate) {
  setToken('test-token')
  server.use(...createRecruitmentHandlers([], [candidate]))
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(
    [
      { path: '/recruitment/candidates/:id', element: <CandidateDetailPage /> },
      { path: '/organization/employees/new', element: <div>Yeni Çalışan Sayfası</div> },
    ],
    { initialEntries: [`/recruitment/candidates/${candidate.id}`] },
  )
  return render(
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </LocalizationProvider>
    </QueryClientProvider>,
  )
}

// Bölüm 14.4 Testler: "Entegrasyon: aşama StatusChip geçişleri."
describe('CandidateDetailPage', () => {
  it('temel bilgileri ve aşamayı gösterir', async () => {
    renderPage(makeCandidate())

    await screen.findByRole('heading', { name: 'Zeynep Kaya' })
    expect(screen.getByText('zeynep@ornek.com')).toBeInTheDocument()
    expect(screen.getByText('Backend Geliştirici')).toBeInTheDocument()
    // "Başvuru" hem StatusChip'te HEM DE aşama seçicisinin (currentStage
    // varsayılanı candidate.stage) gösterdiği değerde görünür — iki eşleşme.
    expect(screen.getAllByText('Başvuru')).toHaveLength(2)
  })

  it('aşama değiştirilip kaydedilebilir', async () => {
    renderPage(makeCandidate())
    const user = userEvent.setup()

    await screen.findByRole('heading', { name: 'Zeynep Kaya' })
    await user.click(screen.getByLabelText('Aşamayı Değiştir'))
    await user.click(await screen.findByRole('option', { name: 'Mülakat' }))
    await user.click(screen.getByRole('button', { name: 'Aşamayı Kaydet' }))

    expect(await screen.findByText('Aşama güncellendi')).toBeInTheDocument()
  })

  it('not eklenir ve listede görünür', async () => {
    renderPage(makeCandidate())
    const user = userEvent.setup()

    await screen.findByRole('heading', { name: 'Zeynep Kaya' })
    await user.click(screen.getByRole('button', { name: 'Yeni Not' }))
    await user.type(screen.getByLabelText('Not'), 'Deneyimi iyi görünüyor.')
    await user.click(screen.getByRole('button', { name: 'Ekle' }))

    expect(await screen.findByText('Not eklendi')).toBeInTheDocument()
    // `ResponsiveTable` masaüstü tablo + mobil kartı AYNI ANDA render eder
    // (bkz. leave/organization'daki AYNI desen) — tabloya scope edilir.
    const table = await screen.findByRole('table')
    await within(table).findByText('Deneyimi iyi görünüyor.')
  })

  it('boş notla submit edilince validasyon hatasını gösterir', async () => {
    renderPage(makeCandidate())
    const user = userEvent.setup()

    await screen.findByRole('heading', { name: 'Zeynep Kaya' })
    await user.click(screen.getByRole('button', { name: 'Yeni Not' }))
    await user.click(screen.getByRole('button', { name: 'Ekle' }))

    expect(await screen.findByText('Not metni boş olamaz.')).toBeInTheDocument()
  })

  it('mülakat kaydı eklenir ve listede görünür', async () => {
    renderPage(makeCandidate())
    const user = userEvent.setup()

    await screen.findByRole('heading', { name: 'Zeynep Kaya' })
    await user.click(screen.getByRole('button', { name: 'Yeni Mülakat' }))

    const group = screen.getByRole('group', { name: 'Mülakat Tarihi' })
    await user.click(within(group).getByRole('spinbutton', { name: 'Day' }))
    await user.keyboard('10')
    await user.click(within(group).getByRole('spinbutton', { name: 'Month' }))
    await user.keyboard('03')
    await user.click(within(group).getByRole('spinbutton', { name: 'Year' }))
    await user.keyboard('2026')
    await user.type(screen.getByLabelText('Katılımcılar'), 'Ahmet Yılmaz')
    await user.type(screen.getByLabelText('Sonuç'), 'Olumlu')
    await user.click(screen.getByRole('button', { name: 'Ekle' }))

    expect(await screen.findByText('Mülakat kaydı eklendi')).toBeInTheDocument()
    const table = await screen.findByRole('table')
    await within(table).findByText('Ahmet Yılmaz')
  })

  it('çalışana dönüştürülür ve yeni çalışan sayfasına taslak bilgiyle yönlendirir', async () => {
    renderPage(makeCandidate())
    const user = userEvent.setup()

    await screen.findByRole('heading', { name: 'Zeynep Kaya' })
    await user.click(screen.getByRole('button', { name: 'Çalışana Dönüştür' }))

    expect(await screen.findByText('Aday çalışan taslağına dönüştürüldü')).toBeInTheDocument()
    expect(await screen.findByText('Yeni Çalışan Sayfası')).toBeInTheDocument()
  })

  it('zaten dönüştürülmüş aday için buton devre dışıdır', async () => {
    renderPage(makeCandidate({ converted: true, stage: 'HIRED' }))

    await screen.findByRole('heading', { name: 'Zeynep Kaya' })
    expect(screen.getByRole('button', { name: 'Çalışana Dönüştürüldü' })).toBeDisabled()
  })
})
