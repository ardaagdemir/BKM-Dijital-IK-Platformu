import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { authHandlers } from '../../../../test/msw/handlers/auth'
import { createFeedbackHandlers } from '../../../../test/msw/handlers/feedback'
import { server } from '../../../../test/msw/server'
import { setToken } from '../../../shared/api/apiClient'
import { AuthProvider } from '../../auth/AuthProvider'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import { SurveysPage } from './SurveysPage'

function renderPage() {
  setToken('test-token')
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(
    [
      { path: '/surveys', element: <SurveysPage /> },
      { path: '/surveys/:id/answer', element: <div>Yanıtlama Sayfası</div> },
      { path: '/surveys/:id/results', element: <div>Sonuç Sayfası</div> },
    ],
    { initialEntries: ['/surveys'] },
  )
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>,
  )
}

describe('SurveysPage', () => {
  it('ADMIN soru+en az iki seçenekle anket oluşturur ve listede görür', async () => {
    server.use(authHandlers.meAdmin, ...createFeedbackHandlers([]))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir anket oluşturulmadı.')
    await user.click(screen.getByRole('button', { name: 'Yeni Anket' }))
    await user.type(screen.getByLabelText('Soru'), 'Ofise dönüş sıklığı nasıl olmalı?')
    await user.type(screen.getByLabelText('Seçenek 1'), 'Haftada 2 gün')
    await user.type(screen.getByLabelText('Seçenek 2'), 'Tam zamanlı ofis')
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    expect(await screen.findByText('Anket oluşturuldu')).toBeInTheDocument()
    const table = await screen.findByRole('table')
    await within(table).findByText('Ofise dönüş sıklığı nasıl olmalı?')
    expect(within(table).getByRole('button', { name: /anketinin sonuçlarını gör/ })).toBeInTheDocument()
  })

  it('boş soru ve tek seçenekle submit edilince validasyon hatalarını gösterir', async () => {
    server.use(authHandlers.meAdmin, ...createFeedbackHandlers([]))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir anket oluşturulmadı.')
    await user.click(screen.getByRole('button', { name: 'Yeni Anket' }))
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    expect(await screen.findByText('Soru boş olamaz.')).toBeInTheDocument()
    expect(screen.getAllByText('Seçenek metni boş olamaz.')).toHaveLength(2)
  })

  it('CALISAN "Yeni Anket" düğmesini GÖRMEZ, yalnızca "Yanıtla" aksiyonunu görür', async () => {
    server.use(
      authHandlers.meCalisan,
      ...createFeedbackHandlers([
        { id: 1, question: 'Yemekhane memnuniyeti?', anonymous: false, options: [{ id: 1, text: 'Evet' }, { id: 2, text: 'Hayır' }] },
      ]),
    )
    renderPage()
    const user = userEvent.setup()

    const table = await screen.findByRole('table')
    expect(screen.queryByRole('button', { name: 'Yeni Anket' })).not.toBeInTheDocument()
    expect(within(table).queryByRole('button', { name: /sonuçlarını gör/ })).not.toBeInTheDocument()

    await user.click(within(table).getByRole('button', { name: /anketini yanıtla/ }))
    await screen.findByText('Yanıtlama Sayfası')
  })
})
