import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createPerformanceHandlers } from '../../../../test/msw/handlers/performance'
import { server } from '../../../../test/msw/server'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import type { Goal } from '../types'
import { GoalsPage } from './GoalsPage'

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <GoalsPage />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

// Bölüm 14.5 Testler: "Ağırlık toplamının 100'ü aşmaması validasyonu" (unit,
// backend'de zaten test edildi) + burada CANLI toplam göstergesinin (form
// içi + liste üstü) doğru hesaplandığının entegrasyon doğrulaması.
describe('GoalsPage', () => {
  it('oluşturur, düzenler ve siler; liste üstü toplam ağırlık doğru hesaplanır', async () => {
    server.use(...createPerformanceHandlers([]))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir hedef tanımlanmadı.')
    await user.click(screen.getByRole('button', { name: 'Yeni Hedef' }))
    await user.type(screen.getByLabelText('Hedef Adı'), 'Satış Artışı')
    await user.type(screen.getByLabelText('Ağırlık'), '40')
    expect(screen.getByText('Toplam ağırlık: 40/100')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    const table = await screen.findByRole('table')
    await within(table).findByText('Satış Artışı')
    expect(await screen.findByText('Hedef oluşturuldu')).toBeInTheDocument()
    expect(screen.getByText('Toplam ağırlık: 40/100')).toBeInTheDocument()

    await user.click(await within(table).findByRole('button', { name: 'Satış Artışı hedefini düzenle' }))
    // Düzenlerken bu kalemin KENDİ ağırlığı toplamdan HARİÇ tutulur (0), yeni
    // değer YAZILDIKÇA eklenir — liste ÜSTÜ gösterge (40) + diyalog İÇİ
    // gösterge (0+40=40, ön dolu değerle) AYNI metni üretir, iki eşleşme.
    expect(screen.getAllByText('Toplam ağırlık: 40/100')).toHaveLength(2)
    const weightField = screen.getByLabelText('Ağırlık')
    await user.clear(weightField)
    await user.type(weightField, '60')
    expect(screen.getByText('Toplam ağırlık: 60/100')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Kaydet' }))

    await within(table).findByText('60')
    expect(await screen.findByText('Hedef güncellendi')).toBeInTheDocument()

    await user.click(await within(table).findByRole('button', { name: 'Satış Artışı hedefini sil' }))
    await user.click(await screen.findByRole('button', { name: 'Sil' }))

    await screen.findByText('Henüz bir hedef tanımlanmadı.')
    expect(await screen.findByText('Hedef silindi')).toBeInTheDocument()
  })

  it('boş isimle submit edilince validasyon hatasını gösterir', async () => {
    server.use(...createPerformanceHandlers([]))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir hedef tanımlanmadı.')
    await user.click(screen.getByRole('button', { name: 'Yeni Hedef' }))
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    expect(await screen.findByText('Hedef adı boş olamaz.')).toBeInTheDocument()
    expect(screen.getByText('Ağırlık 1 ile 100 arasında olmalıdır.')).toBeInTheDocument()
  })

  it('100 üzerinde ağırlıkta submit edilince backend hatasını gösterir', async () => {
    const existing: Goal[] = [{ id: 1, name: 'Mevcut Hedef', weight: 70 }]
    server.use(...createPerformanceHandlers(existing))
    renderPage()
    const user = userEvent.setup()

    const table = await screen.findByRole('table')
    await within(table).findByText('Mevcut Hedef')
    expect(screen.getByText('Toplam ağırlık: 70/100')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Yeni Hedef' }))
    await user.type(screen.getByLabelText('Hedef Adı'), 'Fazla Hedef')
    await user.type(screen.getByLabelText('Ağırlık'), '50')
    expect(screen.getByText('Toplam ağırlık: 120/100')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    expect(
      await screen.findByText("Hedeflerin ağırlık toplamı 100'ü geçemez (mevcut toplam: 70, eklenmek istenen: 50)."),
    ).toBeInTheDocument()
  })
})
