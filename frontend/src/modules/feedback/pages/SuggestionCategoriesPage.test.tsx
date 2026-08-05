import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createFeedbackHandlers } from '../../../../test/msw/handlers/feedback'
import { server } from '../../../../test/msw/server'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import { SuggestionCategoriesPage } from './SuggestionCategoriesPage'

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <SuggestionCategoriesPage />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

describe('SuggestionCategoriesPage', () => {
  it('oluşturur, düzenler ve siler', async () => {
    server.use(...createFeedbackHandlers([], []))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir kategori tanımlanmadı.')
    await user.click(screen.getByRole('button', { name: 'Yeni Kategori' }))
    await user.type(screen.getByLabelText('Kategori Adı'), 'İK Süreçleri')
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    const table = await screen.findByRole('table')
    await within(table).findByText('İK Süreçleri')
    expect(await screen.findByText('Kategori oluşturuldu')).toBeInTheDocument()

    await user.click(await within(table).findByRole('button', { name: 'İK Süreçleri kategorisini düzenle' }))
    await user.clear(screen.getByLabelText('Kategori Adı'))
    await user.type(screen.getByLabelText('Kategori Adı'), 'Ofis')
    await user.click(screen.getByRole('button', { name: 'Kaydet' }))

    await within(table).findByText('Ofis')
    expect(await screen.findByText('Kategori güncellendi')).toBeInTheDocument()

    await user.click(await within(table).findByRole('button', { name: 'Ofis kategorisini sil' }))
    await user.click(await screen.findByRole('button', { name: 'Sil' }))

    await screen.findByText('Henüz bir kategori tanımlanmadı.')
    expect(await screen.findByText('Kategori silindi')).toBeInTheDocument()
  })

  it('boş isimle submit edilince validasyon hatasını gösterir', async () => {
    server.use(...createFeedbackHandlers([], []))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir kategori tanımlanmadı.')
    await user.click(screen.getByRole('button', { name: 'Yeni Kategori' }))
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    expect(await screen.findByText('Kategori adı boş olamaz.')).toBeInTheDocument()
  })
})
