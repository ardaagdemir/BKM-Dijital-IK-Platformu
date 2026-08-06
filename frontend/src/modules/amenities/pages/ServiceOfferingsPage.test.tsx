import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import 'dayjs/locale/tr'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createAppointmentHandlers } from '../../../../test/msw/handlers/amenities'
import { server } from '../../../../test/msw/server'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import { ServiceOfferingsPage } from './ServiceOfferingsPage'

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
        <ToastProvider>
          <ServiceOfferingsPage />
        </ToastProvider>
      </LocalizationProvider>
    </QueryClientProvider>,
  )
}

describe('ServiceOfferingsPage', () => {
  it('hizmet oluşturur, seçer ve slot ekler', async () => {
    server.use(...createAppointmentHandlers([]))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir hizmet tanımlanmadı.')
    await user.click(screen.getByRole('button', { name: 'Yeni Hizmet' }))
    await user.type(screen.getByLabelText('Hizmet Adı'), 'Diş Hekimi')
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    expect(await screen.findByText('Hizmet oluşturuldu')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Hizmet'))
    await user.click(await screen.findByRole('option', { name: 'Diş Hekimi' }))

    await screen.findByText('Bu hizmet için henüz bir slot tanımlanmadı.')
    await user.click(await screen.findByRole('button', { name: 'Yeni Slot' }))

    const startGroup = screen.getByRole('group', { name: 'Başlangıç' })
    await user.click(within(startGroup).getByRole('spinbutton', { name: 'Day' }))
    await user.keyboard('10')
    await user.click(within(startGroup).getByRole('spinbutton', { name: 'Month' }))
    await user.keyboard('03')
    await user.click(within(startGroup).getByRole('spinbutton', { name: 'Year' }))
    await user.keyboard('2026')
    await user.click(within(startGroup).getByRole('spinbutton', { name: 'Hours' }))
    await user.keyboard('09')
    await user.click(within(startGroup).getByRole('spinbutton', { name: 'Minutes' }))
    await user.keyboard('00')

    const endGroup = screen.getByRole('group', { name: 'Bitiş' })
    await user.click(within(endGroup).getByRole('spinbutton', { name: 'Day' }))
    await user.keyboard('10')
    await user.click(within(endGroup).getByRole('spinbutton', { name: 'Month' }))
    await user.keyboard('03')
    await user.click(within(endGroup).getByRole('spinbutton', { name: 'Year' }))
    await user.keyboard('2026')
    await user.click(within(endGroup).getByRole('spinbutton', { name: 'Hours' }))
    await user.keyboard('10')
    await user.click(within(endGroup).getByRole('spinbutton', { name: 'Minutes' }))
    await user.keyboard('00')

    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    expect(await screen.findByText('Slot oluşturuldu')).toBeInTheDocument()
    const tables = await screen.findAllByRole('table')
    await within(tables[1]).findByText('10.03.2026 09:00')
  })
})
