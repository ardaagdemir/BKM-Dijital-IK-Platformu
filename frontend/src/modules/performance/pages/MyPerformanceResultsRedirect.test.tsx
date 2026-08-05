import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { server } from '../../../../test/msw/server'
import { setToken } from '../../../shared/api/apiClient'
import type { Employee } from '../../organization/types'
import { MyPerformanceResultsRedirect } from './MyPerformanceResultsRedirect'

function makeEmployee(overrides: Partial<Employee> = {}): Employee {
  return {
    id: 42,
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
      { path: '/performance/results/me', element: <MyPerformanceResultsRedirect /> },
      { path: '/performance/results/:employeeId', element: <div>Sonuçlar Sayfası (id: :employeeId)</div> },
    ],
    { initialEntries: ['/performance/results/me'] },
  )
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('MyPerformanceResultsRedirect', () => {
  it('kendi employeeId ile sonuç sayfasına yönlendirir', async () => {
    server.use(...createOrganizationHandlers([], [], [makeEmployee({ id: 42 })]))
    renderPage()

    expect(await screen.findByText('Sonuçlar Sayfası (id: :employeeId)')).toBeInTheDocument()
  })

  it('çalışan kaydı yoksa anlaşılır bir boş durum gösterir', async () => {
    server.use(...createOrganizationHandlers([], [], []))
    renderPage()

    expect(await screen.findByText('Sisteme bağlı bir çalışan kaydınız bulunamadı.')).toBeInTheDocument()
  })
})
