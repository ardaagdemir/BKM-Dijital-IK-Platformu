import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createPerformanceHandlers } from '../../../../test/msw/handlers/performance'
import { server } from '../../../../test/msw/server'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import { CompetenciesPage } from './CompetenciesPage'

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <CompetenciesPage />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

// `GoalsPage.test.tsx`'teki AYNI kapsam — burada yalnızca CRUD + tekil
// alan validasyonu doğrulanır, ağırlık toplamı göstergesi zaten `GoalsPage`
// tarafında (AYNI mantık) kapsamlı olarak test edildi.
describe('CompetenciesPage', () => {
  it('oluşturur, düzenler ve siler', async () => {
    server.use(...createPerformanceHandlers([], []))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir yetkinlik tanımlanmadı.')
    await user.click(screen.getByRole('button', { name: 'Yeni Yetkinlik' }))
    await user.type(screen.getByLabelText('Yetkinlik Adı'), 'Takım Çalışması')
    await user.type(screen.getByLabelText('Ağırlık'), '30')
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    const table = await screen.findByRole('table')
    await within(table).findByText('Takım Çalışması')
    expect(await screen.findByText('Yetkinlik oluşturuldu')).toBeInTheDocument()

    await user.click(await within(table).findByRole('button', { name: 'Takım Çalışması yetkinliğini düzenle' }))
    await user.clear(screen.getByLabelText('Yetkinlik Adı'))
    await user.type(screen.getByLabelText('Yetkinlik Adı'), 'İletişim')
    await user.click(screen.getByRole('button', { name: 'Kaydet' }))

    await within(table).findByText('İletişim')
    expect(await screen.findByText('Yetkinlik güncellendi')).toBeInTheDocument()

    await user.click(await within(table).findByRole('button', { name: 'İletişim yetkinliğini sil' }))
    await user.click(await screen.findByRole('button', { name: 'Sil' }))

    await screen.findByText('Henüz bir yetkinlik tanımlanmadı.')
    expect(await screen.findByText('Yetkinlik silindi')).toBeInTheDocument()
  })

  it('boş isimle submit edilince validasyon hatasını gösterir', async () => {
    server.use(...createPerformanceHandlers([], []))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir yetkinlik tanımlanmadı.')
    await user.click(screen.getByRole('button', { name: 'Yeni Yetkinlik' }))
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    expect(await screen.findByText('Yetkinlik adı boş olamaz.')).toBeInTheDocument()
    expect(screen.getByText('Ağırlık 1 ile 100 arasında olmalıdır.')).toBeInTheDocument()
  })
})
