import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createClubHandlers } from '../../../../test/msw/handlers/amenities'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { server } from '../../../../test/msw/server'
import { setToken } from '../../../shared/api/apiClient'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import type { Employee } from '../../organization/types'
import type { Club } from '../types'
import { ClubDetailPage } from './ClubDetailPage'

function makeEmployee(overrides: Partial<Employee> = {}): Employee {
  return {
    id: 1,
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    nationalId: '10000000146',
    hireDate: '2020-01-15',
    email: 'ahmet@dijitalik.local',
    organizationUnitId: null,
    jobTitleId: null,
    iban: null,
    ...overrides,
  }
}

function renderPage() {
  setToken('test-token')
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter([{ path: '/clubs/:id', element: <ClubDetailPage /> }], {
    initialEntries: ['/clubs/1'],
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </LocalizationProvider>
    </QueryClientProvider>,
  )
}

describe('ClubDetailPage', () => {
  it('lider olan çalışan "Yeni Etkinlik" oluşturabilir', async () => {
    const club: Club = { id: 1, name: 'Satranç Kulübü', leaderId: 1 }
    server.use(...createOrganizationHandlers([], [], [makeEmployee({ id: 1 })]), ...createClubHandlers([club]))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Satranç Kulübü')
    await user.click(screen.getByRole('button', { name: 'Yeni Etkinlik' }))
    await user.type(screen.getByLabelText('Etkinlik Adı'), 'Turnuva')
    const group = screen.getByRole('group', { name: 'Tarih' })
    await user.click(within(group).getByRole('spinbutton', { name: 'Day' }))
    await user.keyboard('10')
    await user.click(within(group).getByRole('spinbutton', { name: 'Month' }))
    await user.keyboard('03')
    await user.click(within(group).getByRole('spinbutton', { name: 'Year' }))
    await user.keyboard('2026')
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    expect(await screen.findByText('Etkinlik oluşturuldu')).toBeInTheDocument()
    const table = await screen.findByRole('table')
    await within(table).findByText('Turnuva')
  })

  it('lider OLMAYAN çalışan "Yeni Etkinlik" butonunu GÖRMEZ', async () => {
    const club: Club = { id: 1, name: 'Satranç Kulübü', leaderId: 2 }
    server.use(...createOrganizationHandlers([], [], [makeEmployee({ id: 1 })]), ...createClubHandlers([club]))
    renderPage()

    await screen.findByText('Satranç Kulübü')
    expect(screen.queryByRole('button', { name: 'Yeni Etkinlik' })).not.toBeInTheDocument()
  })
})
