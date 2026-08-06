import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createClubHandlers } from '../../../../test/msw/handlers/amenities'
import { server } from '../../../../test/msw/server'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import type { Club, ClubMembershipRequest } from '../types'
import { ClubMembershipRequestsPage } from './ClubMembershipRequestsPage'

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ClubMembershipRequestsPage />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

const club: Club = { id: 1, name: 'Satranç Kulübü', leaderId: 2 }

describe('ClubMembershipRequestsPage', () => {
  it('bekleyen talebi onaylar', async () => {
    const requests: ClubMembershipRequest[] = [
      { id: 1, clubId: 1, employeeId: 5, status: 'PENDING', rejectionReason: null },
    ]
    server.use(...createClubHandlers([club], requests))
    renderPage()
    const user = userEvent.setup()

    const table = await screen.findByRole('table')
    await within(table).findByText('Satranç Kulübü')
    await within(table).findByText('#5')
    await user.click(within(table).getByRole('button', { name: 'Onayla' }))

    expect(await screen.findByText('Talep onaylandı')).toBeInTheDocument()
    await screen.findByText('Onay bekleyen üyelik talebi yok.')
  })

  it('gerekçe girilmeden reddedilemez, gerekçeyle reddedilir', async () => {
    const requests: ClubMembershipRequest[] = [
      { id: 1, clubId: 1, employeeId: 5, status: 'PENDING', rejectionReason: null },
    ]
    server.use(...createClubHandlers([club], requests))
    renderPage()
    const user = userEvent.setup()

    const table = await screen.findByRole('table')
    await user.click(within(table).getByRole('button', { name: 'Reddet' }))
    await user.click(await screen.findByRole('button', { name: 'Reddet' }))

    expect(await screen.findByText('Ret gerekçesi zorunludur.')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Ret Gerekçesi'), 'Kontenjan dolu.')
    await user.click(screen.getByRole('button', { name: 'Reddet' }))

    expect(await screen.findByText('Talep reddedildi')).toBeInTheDocument()
  })
})
