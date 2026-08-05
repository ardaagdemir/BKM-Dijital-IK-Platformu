import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createRecruitmentHandlers } from '../../../../test/msw/handlers/recruitment'
import { server } from '../../../../test/msw/server'
import { CareersApplyPage } from './CareersApplyPage'

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <CareersApplyPage />
    </QueryClientProvider>,
  )
}

function pdfFile(name = 'cv.pdf', content = 'örnek cv içeriği') {
  return new File([content], name, { type: 'application/pdf' })
}

// Bölüm 14.4 Testler: "E2E: dosya yükleme, 422 (enfekte dosya) senaryosu" —
// entegrasyon karşılığı (bkz. bu oturumdaki "E2E artık yazılmıyor" kararı).
describe('CareersApplyPage', () => {
  it('geçerli bilgilerle başvuru gönderir ve teşekkür mesajı gösterir', async () => {
    server.use(...createRecruitmentHandlers())
    renderPage()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Ad'), 'Zeynep')
    await user.type(screen.getByLabelText('Soyad'), 'Kaya')
    await user.type(screen.getByLabelText('E-posta'), 'zeynep@ornek.com')
    await user.type(screen.getByLabelText('Başvurulan Pozisyon'), 'Backend Geliştirici')
    await user.upload(screen.getByLabelText('CV Dosyası'), pdfFile())
    await user.click(screen.getByRole('button', { name: 'Başvuruyu Gönder' }))

    expect(await screen.findByText('Başvurunuz Alındı')).toBeInTheDocument()
  })

  it('CV seçilmeden submit edilince validasyon hatasını gösterir', async () => {
    server.use(...createRecruitmentHandlers())
    renderPage()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Ad'), 'Zeynep')
    await user.type(screen.getByLabelText('Soyad'), 'Kaya')
    await user.type(screen.getByLabelText('E-posta'), 'zeynep@ornek.com')
    await user.type(screen.getByLabelText('Başvurulan Pozisyon'), 'Backend Geliştirici')
    await user.click(screen.getByRole('button', { name: 'Başvuruyu Gönder' }))

    expect(await screen.findByText('CV dosyası boş olamaz.')).toBeInTheDocument()
  })

  it('enfekte CV 422 ile reddedilir ve hata mesajı gösterilir', async () => {
    server.use(...createRecruitmentHandlers())
    renderPage()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Ad'), 'Zeynep')
    await user.type(screen.getByLabelText('Soyad'), 'Kaya')
    await user.type(screen.getByLabelText('E-posta'), 'zeynep@ornek.com')
    await user.type(screen.getByLabelText('Başvurulan Pozisyon'), 'Backend Geliştirici')
    await user.upload(screen.getByLabelText('CV Dosyası'), pdfFile('enfekte.pdf'))
    await user.click(screen.getByRole('button', { name: 'Başvuruyu Gönder' }))

    expect(await screen.findByText('Dosyada virüs/kötü amaçlı içerik tespit edildi.')).toBeInTheDocument()
    expect(screen.queryByText('Başvurunuz Alındı')).not.toBeInTheDocument()
  })
})
