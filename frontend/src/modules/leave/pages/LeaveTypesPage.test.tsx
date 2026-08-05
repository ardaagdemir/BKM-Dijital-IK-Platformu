import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createLeaveHandlers } from '../../../../test/msw/handlers/leave'
import { server } from '../../../../test/msw/server'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import { LeaveTypesPage } from './LeaveTypesPage'

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <LeaveTypesPage />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

// Bölüm 14.3 Testler: "Entegrasyon: CRUD" (US-04.1.1) —
// `organization.JobTitlesPage.test.tsx`'teki AYNI desen (ResponsiveTable'ın
// masaüstü tablo + mobil kartı AYNI ANDA render etmesi nedeniyle sorgular
// tabloya scope edilir).
describe('LeaveTypesPage', () => {
  it('oluşturur, düzenler ve siler', async () => {
    server.use(...createLeaveHandlers([]))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir izin türü tanımlanmadı.')
    await user.click(screen.getByRole('button', { name: 'Yeni İzin Türü' }))
    await user.type(screen.getByLabelText('İzin Türü Adı'), 'Yıllık İzin')
    await user.type(screen.getByLabelText('Kod'), 'YILLIK')
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    const table = await screen.findByRole('table')
    await within(table).findByText('Yıllık İzin')
    expect(await screen.findByText('İzin türü oluşturuldu')).toBeInTheDocument()

    await user.click(await within(table).findByRole('button', { name: 'Yıllık İzin izin türünü düzenle' }))
    await user.clear(screen.getByLabelText('İzin Türü Adı'))
    await user.type(screen.getByLabelText('İzin Türü Adı'), 'Ücretli İzin')
    await user.click(screen.getByRole('button', { name: 'Kaydet' }))

    await within(table).findByText('Ücretli İzin')
    expect(await screen.findByText('İzin türü güncellendi')).toBeInTheDocument()

    await user.click(await within(table).findByRole('button', { name: 'Ücretli İzin izin türünü sil' }))
    await user.click(await screen.findByRole('button', { name: 'Sil' }))

    await screen.findByText('Henüz bir izin türü tanımlanmadı.')
    expect(await screen.findByText('İzin türü silindi')).toBeInTheDocument()
  })

  it('boş isimle submit edilince validasyon hatasını gösterir', async () => {
    server.use(...createLeaveHandlers([]))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir izin türü tanımlanmadı.')
    await user.click(screen.getByRole('button', { name: 'Yeni İzin Türü' }))
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    expect(await screen.findByText('İzin türü adı boş olamaz.')).toBeInTheDocument()
    expect(screen.getByText('İzin türü kodu boş olamaz.')).toBeInTheDocument()
  })
})
