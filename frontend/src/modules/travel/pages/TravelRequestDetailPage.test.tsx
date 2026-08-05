import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { authHandlers } from '../../../../test/msw/handlers/auth'
import { createTravelHandlers } from '../../../../test/msw/handlers/travel'
import { server } from '../../../../test/msw/server'
import { setToken } from '../../../shared/api/apiClient'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import { AuthProvider } from '../../auth/AuthProvider'
import type { ExpenseItem, TravelRequest } from '../types'
import { TravelRequestDetailPage } from './TravelRequestDetailPage'

const travelRequest: TravelRequest = {
  id: 1,
  employeeId: 1,
  location: 'İstanbul',
  startDate: '2026-09-01',
  endDate: '2026-09-05',
  purpose: 'Müşteri ziyareti',
}

function pdfFile(name = 'fatura.pdf', content = 'fatura içeriği') {
  return new File([content], name, { type: 'application/pdf' })
}

function renderPage() {
  setToken('test-token')
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter([{ path: '/travel/requests/:id', element: <TravelRequestDetailPage /> }], {
    initialEntries: ['/travel/requests/1'],
  })
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

describe('TravelRequestDetailPage', () => {
  it('CALISAN masraf kalemi ekler, Onayla/Reddet GÖRMEZ', async () => {
    server.use(authHandlers.meCalisan, ...createTravelHandlers([travelRequest], []))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir masraf kalemi eklenmedi.')
    await user.click(screen.getByRole('button', { name: 'Masraf Ekle' }))
    await user.type(screen.getByLabelText('Tutar'), '150.50')
    await user.upload(screen.getByLabelText('Belge'), pdfFile())
    await user.click(screen.getByRole('button', { name: 'Ekle' }))

    expect(await screen.findByText('Masraf kalemi eklendi')).toBeInTheDocument()
    const table = await screen.findByRole('table')
    await within(table).findByText('fatura.pdf')
    expect(within(table).queryByRole('button', { name: 'Onayla' })).not.toBeInTheDocument()
  })

  it('enfekte belge 422 ile reddedilir', async () => {
    server.use(authHandlers.meCalisan, ...createTravelHandlers([travelRequest], []))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir masraf kalemi eklenmedi.')
    await user.click(screen.getByRole('button', { name: 'Masraf Ekle' }))
    await user.type(screen.getByLabelText('Tutar'), '50')
    await user.upload(screen.getByLabelText('Belge'), pdfFile('enfekte.pdf'))
    await user.click(screen.getByRole('button', { name: 'Ekle' }))

    expect(await screen.findByText('Dosyada virüs/kötü amaçlı içerik tespit edildi.')).toBeInTheDocument()
  })

  it('YONETICI bekleyen bir kalemi onaylayabilir', async () => {
    const expenseItems: ExpenseItem[] = [
      { id: 1, travelRequestId: 1, amount: 150.5, documentFileName: 'fatura.pdf', documentContentType: 'application/pdf', status: 'PENDING', rejectionReason: null },
    ]
    server.use(authHandlers.meYonetici, ...createTravelHandlers([travelRequest], expenseItems))
    renderPage()
    const user = userEvent.setup()

    const table = await screen.findByRole('table')
    await within(table).findByText('fatura.pdf')
    await user.click(within(table).getByRole('button', { name: 'Onayla' }))

    expect(await screen.findByText('Masraf kalemi onaylandı')).toBeInTheDocument()
    await within(table).findByText('Onaylandı')
  })

  it('gerekçesiz ret denemesi validasyon hatası gösterir', async () => {
    const expenseItems: ExpenseItem[] = [
      { id: 1, travelRequestId: 1, amount: 150.5, documentFileName: 'fatura.pdf', documentContentType: 'application/pdf', status: 'PENDING', rejectionReason: null },
    ]
    server.use(authHandlers.meYonetici, ...createTravelHandlers([travelRequest], expenseItems))
    renderPage()
    const user = userEvent.setup()

    const table = await screen.findByRole('table')
    await within(table).findByText('fatura.pdf')
    await user.click(within(table).getByRole('button', { name: 'Reddet' }))

    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Reddet' }))

    expect(await screen.findByText('Ret gerekçesi zorunludur.')).toBeInTheDocument()
  })
})
