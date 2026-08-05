import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createAuditLogHandlers } from '../../../../test/msw/handlers/audit'
import { server } from '../../../../test/msw/server'
import type { AuditLogEntry } from '../types'
import { AuditLogPage } from './AuditLogPage'

function makeEntry(overrides: Partial<AuditLogEntry> = {}): AuditLogEntry {
  return {
    id: 1,
    entityType: 'Employee',
    entityId: '12',
    operation: 'CREATE',
    performedBy: 'ik@dijitalik.local',
    performedAt: '2026-01-15T14:32:00Z',
    ...overrides,
  }
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter([{ path: '/audit', element: <AuditLogPage /> }], {
    initialEntries: ['/audit'],
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
        <RouterProvider router={router} />
      </LocalizationProvider>
    </QueryClientProvider>,
  )
}

// Bölüm 13.8 Testler: "Entegrasyon: MSW ile filtre kombinasyonlarının
// doğru query string'e dönüştüğü."
describe('AuditLogPage', () => {
  it('hiç kayıt yokken "Bu kriterlere uygun audit kaydı yok" gösterir', async () => {
    server.use(...createAuditLogHandlers([]))
    renderPage()

    expect(await screen.findByText('Bu kriterlere uygun audit kaydı yok.')).toBeInTheDocument()
  })

  it('dolu listeyi tabloda render eder', async () => {
    server.use(
      ...createAuditLogHandlers([
        makeEntry({ id: 1, entityType: 'Employee', entityId: '12', operation: 'CREATE', performedBy: 'ik@dijitalik.local' }),
      ]),
    )
    renderPage()

    const table = await screen.findByRole('table')
    expect(within(table).getByText('Employee')).toBeInTheDocument()
    expect(within(table).getByText('12')).toBeInTheDocument()
    expect(within(table).getByText('ik@dijitalik.local')).toBeInTheDocument()
    expect(within(table).getByText('Oluşturma')).toBeInTheDocument()
  })

  it('Varlık Türü filtresi sonucu daraltır', async () => {
    server.use(
      ...createAuditLogHandlers([
        makeEntry({ id: 1, entityType: 'Employee' }),
        makeEntry({ id: 2, entityType: 'JobTitle' }),
      ]),
    )
    renderPage()
    const user = userEvent.setup()

    const table = await screen.findByRole('table')
    await user.click(screen.getByLabelText('Varlık Türü'))
    await user.click(await screen.findByRole('option', { name: 'JobTitle' }))

    // Tablo YERİNDE güncellenir (yeniden mount edilmez) — bu yüzden
    // `within(table)` ile scope edilmiş bekleme, Select'in kendi
    // gösterdiği "JobTitle" metniyle ÇAKIŞMAZ.
    await within(table).findByText('JobTitle')
    expect(within(table).getAllByRole('row')).toHaveLength(2) // başlık + 1 veri satırı
    expect(within(table).queryByText('Employee')).not.toBeInTheDocument()
  })

  it('Kullanıcı arama filtresi (debounced) sonucu daraltır', async () => {
    server.use(
      ...createAuditLogHandlers([
        makeEntry({ id: 1, performedBy: 'ahmet@dijitalik.local' }),
        makeEntry({ id: 2, performedBy: 'zeynep@dijitalik.local' }),
      ]),
    )
    renderPage()
    const user = userEvent.setup()

    const table = await screen.findByRole('table')
    // "zeynep@dijitalik.local" filtre UYGULANMADAN ÖNCE de görünür (iki
    // kayıt da başlangıçta listede) — bu yüzden asıl doğrulama, 400ms'lik
    // debounce SONRASI "ahmet@dijitalik.local"ın KAYBOLMASINI beklemektir.
    await user.type(screen.getByLabelText('Kullanıcı ara'), 'zeynep')

    await waitFor(
      () => expect(within(table).queryByText('ahmet@dijitalik.local')).not.toBeInTheDocument(),
      { timeout: 2000 },
    )
    expect(within(table).getByText('zeynep@dijitalik.local')).toBeInTheDocument()
  })

  it('bitiş tarihi başlangıçtan önce seçilirse hata gösterir ve listeyi GİZLER', async () => {
    server.use(...createAuditLogHandlers([makeEntry()]))

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const router = createMemoryRouter([{ path: '/audit', element: <AuditLogPage /> }], {
      // URL üzerinden geçersiz bir aralık simüle edilir (DatePicker segment
      // etkileşimi jsdom'da güvenilir değil — bkz. 13.5'teki AYNI not).
      initialEntries: ['/audit?from=2026-02-01&to=2026-01-01'],
    })
    render(
      <QueryClientProvider client={queryClient}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
          <RouterProvider router={router} />
        </LocalizationProvider>
      </QueryClientProvider>,
    )

    expect(
      await screen.findByText('Bitiş tarihi başlangıç tarihinden önce olamaz.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})
