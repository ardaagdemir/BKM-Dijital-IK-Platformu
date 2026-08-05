import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createTrainingHandlers } from '../../../../test/msw/handlers/training'
import { server } from '../../../../test/msw/server'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import { TrainingCatalogPage } from './TrainingCatalogPage'

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <TrainingCatalogPage />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

describe('TrainingCatalogPage', () => {
  it('oluşturur, düzenler ve siler', async () => {
    server.use(...createTrainingHandlers([]))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir eğitim tanımlanmadı.')
    await user.click(screen.getByRole('button', { name: 'Yeni Eğitim' }))
    await user.type(screen.getByLabelText('Eğitim Adı'), 'İletişim Becerileri')
    await user.type(screen.getByLabelText('Tür'), 'Yumuşak Beceri')
    await user.type(screen.getByLabelText('Süre (Saat)'), '8')
    await user.type(screen.getByLabelText('Sağlayıcı'), 'Akademi X')
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    const table = await screen.findByRole('table')
    await within(table).findByText('İletişim Becerileri')
    expect(await screen.findByText('Eğitim oluşturuldu')).toBeInTheDocument()

    await user.click(await within(table).findByRole('button', { name: 'İletişim Becerileri eğitimini düzenle' }))
    await user.clear(screen.getByLabelText('Eğitim Adı'))
    await user.type(screen.getByLabelText('Eğitim Adı'), 'Liderlik')
    await user.click(screen.getByRole('button', { name: 'Kaydet' }))

    await within(table).findByText('Liderlik')
    expect(await screen.findByText('Eğitim güncellendi')).toBeInTheDocument()

    await user.click(await within(table).findByRole('button', { name: 'Liderlik eğitimini sil' }))
    await user.click(await screen.findByRole('button', { name: 'Sil' }))

    await screen.findByText('Henüz bir eğitim tanımlanmadı.')
    expect(await screen.findByText('Eğitim silindi')).toBeInTheDocument()
  })

  it('boş isimle submit edilince validasyon hatasını gösterir', async () => {
    server.use(...createTrainingHandlers([]))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir eğitim tanımlanmadı.')
    await user.click(screen.getByRole('button', { name: 'Yeni Eğitim' }))
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    expect(await screen.findByText('Eğitim adı boş olamaz.')).toBeInTheDocument()
    expect(screen.getByText('Eğitim türü boş olamaz.')).toBeInTheDocument()
  })
})
