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
import { ClubsPage } from './ClubsPage'

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

const club: Club = { id: 1, name: 'Satranç Kulübü', leaderId: 2 }

function renderPage() {
  setToken('test-token')
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(
    [
      { path: '/clubs', element: <ClubsPage /> },
      { path: '/clubs/:id', element: <div>Kulüp Detayı</div> },
    ],
    { initialEntries: ['/clubs'] },
  )
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

describe('ClubsPage', () => {
  it('kulüp listesinde üyelik talep eder ve durumu görür', async () => {
    server.use(
      ...createOrganizationHandlers([], [], [makeEmployee()]),
      ...createClubHandlers([club]),
    )
    renderPage()
    const user = userEvent.setup()

    const table = await screen.findByRole('table')
    await within(table).findByText('Satranç Kulübü')
    await user.click(within(table).getByRole('button', { name: 'Üyelik Talep Et' }))

    expect(await screen.findByText('Üyelik talebi gönderildi')).toBeInTheDocument()
    await within(table).findByText('Bekliyor')
    expect(within(table).getByRole('button', { name: 'Üyelik Talep Et' })).toBeDisabled()
  })

  it('kulüp satırına tıklayınca detay sayfasına gider', async () => {
    server.use(
      ...createOrganizationHandlers([], [], [makeEmployee()]),
      ...createClubHandlers([club]),
    )
    renderPage()
    const user = userEvent.setup()

    const table = await screen.findByRole('table')
    await user.click(within(table).getByText('Satranç Kulübü'))

    await screen.findByText('Kulüp Detayı')
  })
})
