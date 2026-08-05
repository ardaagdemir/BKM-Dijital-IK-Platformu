import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { createRecruitmentHandlers } from '../../../../test/msw/handlers/recruitment'
import { server } from '../../../../test/msw/server'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import type { JobTitle, OrganizationUnit } from '../../organization/types'
import type { StaffingNorm } from '../types'
import { HiringRequestFormPage } from './HiringRequestFormPage'

const units: OrganizationUnit[] = [{ id: 1, name: 'Yazılım', parentId: null }]
const jobTitles: JobTitle[] = [{ id: 1, name: 'Backend Geliştirici' }]

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(
    [
      { path: '/recruitment/hiring-requests/new', element: <HiringRequestFormPage /> },
      { path: '/recruitment/hiring-requests', element: <div>Talepler Sayfası</div> },
    ],
    { initialEntries: ['/recruitment/hiring-requests/new'] },
  )
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

// Bölüm 14.4 Testler: "E2E: norm YOKSA 404/hata mesajının gösterildiği" —
// entegrasyon karşılığı (bkz. bu oturumdaki "E2E artık yazılmıyor" kararı).
describe('HiringRequestFormPage', () => {
  it('norm kadro tanımlıysa talep oluşturur ve taleplere yönlendirir', async () => {
    const norms: StaffingNorm[] = [{ id: 1, organizationUnitId: 1, jobTitleId: 1, normCount: 3 }]
    server.use(...createOrganizationHandlers(jobTitles, units, []), ...createRecruitmentHandlers(norms))
    renderPage()
    const user = userEvent.setup()

    await user.click(await screen.findByLabelText('Organizasyon Birimi'))
    await user.click(await screen.findByRole('option', { name: 'Yazılım' }))
    await user.click(screen.getByLabelText('Unvan'))
    await user.click(await screen.findByRole('option', { name: 'Backend Geliştirici' }))
    await user.click(screen.getByRole('button', { name: 'Talep Oluştur' }))

    expect(await screen.findByText('İşe alım talebi oluşturuldu')).toBeInTheDocument()
    expect(await screen.findByText('Talepler Sayfası')).toBeInTheDocument()
  })

  it('norm kadro tanımlı değilse hata gösterir ve sayfada kalır', async () => {
    server.use(...createOrganizationHandlers(jobTitles, units, []), ...createRecruitmentHandlers([]))
    renderPage()
    const user = userEvent.setup()

    await user.click(await screen.findByLabelText('Organizasyon Birimi'))
    await user.click(await screen.findByRole('option', { name: 'Yazılım' }))
    await user.click(screen.getByLabelText('Unvan'))
    await user.click(await screen.findByRole('option', { name: 'Backend Geliştirici' }))
    await user.click(screen.getByRole('button', { name: 'Talep Oluştur' }))

    expect(await screen.findByText('Bu birim/unvan için norm kadro tanımlı değil.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Talep Oluştur' })).toBeInTheDocument()
  })

  it('boş alanlarla submit edilince validasyon hatasını gösterir', async () => {
    server.use(...createOrganizationHandlers(jobTitles, units, []), ...createRecruitmentHandlers([]))
    renderPage()
    const user = userEvent.setup()

    await screen.findByLabelText('Organizasyon Birimi')
    await user.click(screen.getByRole('button', { name: 'Talep Oluştur' }))

    expect(await screen.findByText('Organizasyon birimi boş olamaz.')).toBeInTheDocument()
    expect(screen.getByText('Unvan boş olamaz.')).toBeInTheDocument()
  })
})
