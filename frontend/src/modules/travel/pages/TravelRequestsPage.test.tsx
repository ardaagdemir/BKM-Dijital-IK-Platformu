import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { authHandlers } from '../../../../test/msw/handlers/auth'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { createTravelHandlers } from '../../../../test/msw/handlers/travel'
import { server } from '../../../../test/msw/server'
import { setToken } from '../../../shared/api/apiClient'
import { AuthProvider } from '../../auth/AuthProvider'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import type { Employee } from '../../organization/types'
import type { TravelRequest } from '../types'
import { TravelRequestsPage } from './TravelRequestsPage'

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
  const router = createMemoryRouter(
    [
      { path: '/travel/requests', element: <TravelRequestsPage /> },
      { path: '/travel/requests/:id', element: <div>Talep Detay Sayfası</div> },
    ],
    { initialEntries: ['/travel/requests'] },
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

describe('TravelRequestsPage', () => {
  it('CALISAN kendi talebini oluşturur ve listede görür, çalışan seçici GÖRMEZ', async () => {
    server.use(authHandlers.meCalisan, ...createOrganizationHandlers([], [], [makeEmployee({ email: 'calisan@dijitalik.local' })]), ...createTravelHandlers([]))
    renderPage()
    const user = userEvent.setup()

    expect(screen.queryByRole('combobox', { name: 'Başka bir çalışanı görüntüle' })).not.toBeInTheDocument()

    await screen.findByText('Henüz bir seyahat talebi yok.')
    await user.click(screen.getByRole('button', { name: 'Yeni Talep' }))
    await user.type(screen.getByLabelText('Lokasyon'), 'İstanbul')
    await user.type(screen.getByLabelText('Başlangıç Tarihi'), '2026-09-01')
    await user.type(screen.getByLabelText('Bitiş Tarihi'), '2026-09-05')
    await user.type(screen.getByLabelText('Amaç'), 'Müşteri ziyareti')
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    expect(await screen.findByText('Seyahat talebi oluşturuldu')).toBeInTheDocument()
    const table = await screen.findByRole('table')
    await within(table).findByText('İstanbul')
  })

  it('ADMIN başka bir çalışanı görüntüleyebilir', async () => {
    const requests: TravelRequest[] = [
      { id: 1, employeeId: 2, location: 'Ankara', startDate: '2026-09-01', endDate: '2026-09-03', purpose: 'Toplantı' },
    ]
    server.use(
      authHandlers.meAdmin,
      ...createOrganizationHandlers([], [], [makeEmployee({ id: 1, email: 'admin@dijitalik.local' }), makeEmployee({ id: 2, firstName: 'Ayşe', lastName: 'Demir' })]),
      ...createTravelHandlers(requests),
    )
    renderPage()
    const user = userEvent.setup()

    const picker = await screen.findByRole('combobox', { name: 'Başka bir çalışanı görüntüle' })
    await user.click(picker)
    await user.type(picker, 'Ayşe')
    await user.click(await screen.findByRole('option', { name: 'Ayşe Demir' }))

    const table = await screen.findByRole('table')
    await within(table).findByText('Ankara')
  })

  it('bitiş tarihi başlangıçtan önceyse validasyon hatasını gösterir', async () => {
    server.use(authHandlers.meCalisan, ...createOrganizationHandlers([], [], [makeEmployee({ email: 'calisan@dijitalik.local' })]), ...createTravelHandlers([]))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir seyahat talebi yok.')
    await user.click(screen.getByRole('button', { name: 'Yeni Talep' }))
    await user.type(screen.getByLabelText('Lokasyon'), 'İstanbul')
    await user.type(screen.getByLabelText('Başlangıç Tarihi'), '2026-09-05')
    await user.type(screen.getByLabelText('Bitiş Tarihi'), '2026-09-01')
    await user.type(screen.getByLabelText('Amaç'), 'Müşteri ziyareti')
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    expect(await screen.findByText('Bitiş tarihi başlangıç tarihinden önce olamaz.')).toBeInTheDocument()
  })
})
