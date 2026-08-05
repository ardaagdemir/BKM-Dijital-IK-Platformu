import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createPerformanceHandlers } from '../../../../test/msw/handlers/performance'
import { server } from '../../../../test/msw/server'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import { RatingScaleSettingsPage } from './RatingScaleSettingsPage'

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RatingScaleSettingsPage />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

describe('RatingScaleSettingsPage', () => {
  it('henüz tanımlanmamışken boş formla ilk kez oluşturulabilir', async () => {
    server.use(...createPerformanceHandlers())
    renderPage()
    const user = userEvent.setup()

    await user.type(await screen.findByLabelText('Alt Sınır'), '1')
    await user.type(screen.getByLabelText('Üst Sınır'), '5')
    await user.click(screen.getAllByRole('button', { name: 'Kaydet' })[0])
    expect(await screen.findByText('Puanlama skalası kaydedildi')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Hedef Ağırlığı (%)'), '60')
    await user.type(screen.getByLabelText('Yetkinlik Ağırlığı (%)'), '40')
    await user.click(screen.getAllByRole('button', { name: 'Kaydet' })[1])
    expect(await screen.findByText('Nihai not ağırlıklandırması kaydedildi')).toBeInTheDocument()
  })

  it('mevcut değerler önceden dolu gelir ve güncellenebilir', async () => {
    server.use(
      ...createPerformanceHandlers([], [], { id: 1, minValue: 1, maxValue: 5 }, { id: 1, goalWeight: 50, competencyWeight: 50 }),
    )
    renderPage()
    const user = userEvent.setup()

    const minField = await screen.findByLabelText('Alt Sınır')
    expect(minField).toHaveValue(1)
    expect(screen.getByLabelText('Üst Sınır')).toHaveValue(5)
    expect(await screen.findByLabelText('Hedef Ağırlığı (%)')).toHaveValue(50)

    await user.clear(screen.getByLabelText('Üst Sınır'))
    await user.type(screen.getByLabelText('Üst Sınır'), '10')
    await user.click(screen.getAllByRole('button', { name: 'Kaydet' })[0])
    expect(await screen.findByText('Puanlama skalası kaydedildi')).toBeInTheDocument()
  })

  it('toplamı 100 olmayan ağırlıklarla submit edilince backend hatasını gösterir', async () => {
    server.use(...createPerformanceHandlers())
    renderPage()
    const user = userEvent.setup()

    await user.type(await screen.findByLabelText('Hedef Ağırlığı (%)'), '70')
    await user.type(screen.getByLabelText('Yetkinlik Ağırlığı (%)'), '50')
    await user.click(screen.getAllByRole('button', { name: 'Kaydet' })[1])

    expect(await screen.findByText('Hedef ve yetkinlik ağırlıklarının toplamı 100 olmalıdır.')).toBeInTheDocument()
  })
})
