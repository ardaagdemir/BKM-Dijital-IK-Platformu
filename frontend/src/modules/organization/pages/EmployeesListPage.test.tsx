import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { server } from '../../../../test/msw/server'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import type { Employee, JobTitle, OrganizationUnit } from '../types'
import { EmployeesListPage } from './EmployeesListPage'

const units: OrganizationUnit[] = [{ id: 1, name: 'İnsan Kaynakları', parentId: null }]
const jobTitles: JobTitle[] = [{ id: 1, name: 'Yazılım Mühendisi' }]

function makeEmployee(overrides: Partial<Employee>): Employee {
  return {
    id: 1,
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    nationalId: '10000000146',
    hireDate: '2026-01-15',
    email: 'ahmet@dijitalik.local',
    organizationUnitId: null,
    jobTitleId: null,
    iban: null,
    ...overrides,
  }
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(
    [
      { path: '/organization/employees', element: <EmployeesListPage /> },
      { path: '/organization/employees/new', element: <div>Yeni Çalışan Sayfası</div> },
      { path: '/organization/employees/:id', element: <div>Çalışan Detay Sayfası</div> },
    ],
    { initialEntries: ['/organization/employees'] },
  )
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

// Bölüm 13.6 Testler: "MSW ile boş liste, dolu liste, filtre uygulanmış
// liste senaryoları; ResponsiveTable'ın xs viewport'ta kart moduna
// geçtiğinin doğrulanması."
describe('EmployeesListPage', () => {
  it('hiç çalışan yokken (filtre YOKKEN) "Henüz çalışan kaydı yok" gösterir', async () => {
    server.use(...createOrganizationHandlers(jobTitles, units, []))
    renderPage()

    expect(await screen.findByText('Henüz çalışan kaydı yok.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'İlk Çalışanı Oluştur' })).toBeInTheDocument()
  })

  it('dolu listeyi hem tabloda hem kartta (aynı veriyle) render eder', async () => {
    server.use(
      ...createOrganizationHandlers(jobTitles, units, [
        makeEmployee({ id: 1, firstName: 'Ahmet', lastName: 'Yılmaz', organizationUnitId: 1, jobTitleId: 1 }),
      ]),
    )
    renderPage()

    // ResponsiveTable masaüstü VE mobil sürümünü AYNI ANDA render eder
    // (bkz. ResponsiveTable.tsx, JobTitlesPage.test.tsx'teki AYNI desen) —
    // bu yüzden `role="table"`'a scope edilir.
    const table = await screen.findByRole('table')
    expect(within(table).getByText('Ahmet Yılmaz')).toBeInTheDocument()
    expect(within(table).getByText('İnsan Kaynakları')).toBeInTheDocument()
    expect(within(table).getByText('Yazılım Mühendisi')).toBeInTheDocument()

    // Kart görünümünün de AYNI veriyle render edildiği (yalnızca CSS
    // display ile ayrışır) — getAllByText en az 2 eşleşme (tablo + kart).
    expect(screen.getAllByText('Ahmet Yılmaz').length).toBeGreaterThanOrEqual(2)
  })

  it('filtre sonucu boşsa "Bu filtrelere uygun çalışan bulunamadı" gösterir', async () => {
    server.use(
      ...createOrganizationHandlers(jobTitles, units, [makeEmployee({ id: 1, firstName: 'Ahmet' })]),
    )
    renderPage()
    const user = userEvent.setup()

    await screen.findByRole('table')
    await user.type(screen.getByLabelText('İsim ara'), 'olmayanisim')

    expect(await screen.findByText('Bu filtrelere uygun çalışan bulunamadı.')).toBeInTheDocument()
    // Hem FilterBar'ın kendi "Filtreleri Temizle" butonu hem de EmptyState'in
    // aksiyon butonu AYNI etikete sahip (bilinçli tekrar) — bu yüzden en az
    // bir eşleşme yeterli.
    expect(screen.getAllByRole('button', { name: 'Filtreleri Temizle' }).length).toBeGreaterThanOrEqual(1)
  })

  it('satıra tıklayınca detay sayfasına gider', async () => {
    server.use(
      ...createOrganizationHandlers(jobTitles, units, [makeEmployee({ id: 42, firstName: 'Ahmet' })]),
    )
    renderPage()
    const user = userEvent.setup()

    const table = await screen.findByRole('table')
    await user.click(within(table).getByRole('link', { name: /Ahmet Yılmaz/ }))

    expect(await screen.findByText('Çalışan Detay Sayfası')).toBeInTheDocument()
  })
})
