import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { createRecruitmentHandlers } from '../../../../test/msw/handlers/recruitment'
import { server } from '../../../../test/msw/server'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import type { JobTitle, OrganizationUnit } from '../../organization/types'
import { StaffingNormsPage } from './StaffingNormsPage'

const units: OrganizationUnit[] = [{ id: 1, name: 'Yazılım', parentId: null }]
const jobTitles: JobTitle[] = [{ id: 1, name: 'Backend Geliştirici' }]

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <StaffingNormsPage />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

// Bölüm 14.4 Testler: "Entegrasyon" (US-05.1.1) — `PUT` upsert semantiği
// nedeniyle `leave.LeaveTypesPage.test.tsx`'ten FARKLI: delete senaryosu
// yok, "düzenle" akışı AYNI PUT'u tekrar çağırır (birim/unvan çifti kilitli).
describe('StaffingNormsPage', () => {
  it('oluşturur ve düzenler', async () => {
    server.use(...createOrganizationHandlers(jobTitles, units, []), ...createRecruitmentHandlers([]))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir norm kadro tanımlanmadı.')
    await user.click(screen.getByRole('button', { name: 'Yeni Norm Kadro' }))
    await user.click(screen.getByLabelText('Organizasyon Birimi'))
    await user.click(await screen.findByRole('option', { name: 'Yazılım' }))
    await user.click(screen.getByLabelText('Unvan'))
    await user.click(await screen.findByRole('option', { name: 'Backend Geliştirici' }))
    await user.type(screen.getByLabelText('Norm Kadro Sayısı'), '5')
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    const table = await screen.findByRole('table')
    await within(table).findByText('Yazılım')
    await within(table).findByText('5')
    expect(await screen.findByText('Norm kadro oluşturuldu')).toBeInTheDocument()

    await user.click(await within(table).findByRole('button', { name: 'Yazılım / Backend Geliştirici norm kadrosunu düzenle' }))
    const normCountField = screen.getByLabelText('Norm Kadro Sayısı')
    await user.clear(normCountField)
    await user.type(normCountField, '8')
    await user.click(screen.getByRole('button', { name: 'Kaydet' }))

    await within(table).findByText('8')
    expect(await screen.findByText('Norm kadro güncellendi')).toBeInTheDocument()
  })

  it('boş alanlarla submit edilince validasyon hatasını gösterir', async () => {
    server.use(...createOrganizationHandlers(jobTitles, units, []), ...createRecruitmentHandlers([]))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir norm kadro tanımlanmadı.')
    await user.click(screen.getByRole('button', { name: 'Yeni Norm Kadro' }))
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    expect(await screen.findByText('Organizasyon birimi boş olamaz.')).toBeInTheDocument()
    expect(screen.getByText('Unvan boş olamaz.')).toBeInTheDocument()
  })
})
