import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createAttendanceHandlers } from '../../../../test/msw/handlers/attendance'
import { server } from '../../../../test/msw/server'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import { WorkModelsPage } from './WorkModelsPage'

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <WorkModelsPage />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

// Bölüm 14.6 Testler: US-07.1.1 CRUD (backend'de zaten test edildi, burada
// entegrasyon).
describe('WorkModelsPage', () => {
  it('oluşturur, düzenler ve siler', async () => {
    server.use(...createAttendanceHandlers([]))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir çalışma modeli tanımlanmadı.')
    await user.click(screen.getByRole('button', { name: 'Yeni Çalışma Modeli' }))
    await user.type(screen.getByLabelText('Çalışma Modeli Adı'), 'Tam Zamanlı')
    await user.type(screen.getByLabelText('Planlanan Başlangıç Saati'), '09:00')
    await user.type(screen.getByLabelText('Planlanan Bitiş Saati'), '18:00')
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    const table = await screen.findByRole('table')
    await within(table).findByText('Tam Zamanlı')
    expect(await screen.findByText('Çalışma modeli oluşturuldu')).toBeInTheDocument()

    await user.click(await within(table).findByRole('button', { name: 'Tam Zamanlı çalışma modelini düzenle' }))
    await user.clear(screen.getByLabelText('Çalışma Modeli Adı'))
    await user.type(screen.getByLabelText('Çalışma Modeli Adı'), 'Vardiyalı')
    await user.click(screen.getByRole('button', { name: 'Kaydet' }))

    await within(table).findByText('Vardiyalı')
    expect(await screen.findByText('Çalışma modeli güncellendi')).toBeInTheDocument()

    await user.click(await within(table).findByRole('button', { name: 'Vardiyalı çalışma modelini sil' }))
    await user.click(await screen.findByRole('button', { name: 'Sil' }))

    await screen.findByText('Henüz bir çalışma modeli tanımlanmadı.')
    expect(await screen.findByText('Çalışma modeli silindi')).toBeInTheDocument()
  })

  it('bitiş saati başlangıçtan önceyse validasyon hatasını gösterir', async () => {
    server.use(...createAttendanceHandlers([]))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir çalışma modeli tanımlanmadı.')
    await user.click(screen.getByRole('button', { name: 'Yeni Çalışma Modeli' }))
    await user.type(screen.getByLabelText('Çalışma Modeli Adı'), 'Tam Zamanlı')
    await user.type(screen.getByLabelText('Planlanan Başlangıç Saati'), '18:00')
    await user.type(screen.getByLabelText('Planlanan Bitiş Saati'), '09:00')
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    expect(
      await screen.findByText('Planlanan bitiş saati, başlangıç saatinden sonra olmalıdır.'),
    ).toBeInTheDocument()
  })
})
