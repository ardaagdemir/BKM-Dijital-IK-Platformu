import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { server } from '../../../../test/msw/server'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import { EmployeeCreatePage } from './EmployeeCreatePage'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(
    [
      { path: '/organization/employees/new', element: <EmployeeCreatePage /> },
      { path: '/organization/employees/:id', element: <div>Detay Sayfası</div> },
    ],
    { initialEntries: ['/organization/employees/new'] },
  )
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

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Ad', { exact: true }), 'Ahmet')
  await user.type(screen.getByLabelText('Soyad'), 'Yılmaz')
  await user.type(screen.getByLabelText('TC Kimlik No'), '10000000146')
  // MUI X DatePicker, gün/ay/yıl için AYRI spinbutton'lar render eder;
  // segmentler ARASI otomatik geçiş jsdom'da GÜVENİLİR çalışmadığından
  // (bkz. E2E'de keşfedilen AYNI davranış) her segment AYRI odaklanıp
  // yazılır.
  await user.click(screen.getByRole('spinbutton', { name: 'Day' }))
  await user.keyboard('15')
  await user.click(screen.getByRole('spinbutton', { name: 'Month' }))
  await user.keyboard('01')
  await user.click(screen.getByRole('spinbutton', { name: 'Year' }))
  await user.keyboard('2026')
  await user.type(screen.getByLabelText('E-posta'), 'ahmet@dijitalik.local')
}

// Bölüm 13.5 Testler: "Form submit → API çağrısı doğru gövdeyle yapılıyor
// mu; 409 senaryosunda banner doğru gösteriliyor mu."
describe('EmployeeCreatePage', () => {
  it('formu doğru gövdeyle submit eder ve detay sayfasına yönlendirir', async () => {
    let capturedBody: unknown = null
    server.use(
      http.post(`${BASE_URL}/api/organization/employees`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json(
          { id: 42, ...(capturedBody as object), organizationUnitId: null, jobTitleId: null, iban: null },
          { status: 201 },
        )
      }),
    )
    renderPage()
    const user = userEvent.setup()
    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    await screen.findByText('Detay Sayfası')
    expect(capturedBody).toEqual({
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      nationalId: '10000000146',
      hireDate: '2026-01-15',
      email: 'ahmet@dijitalik.local',
    })
  })

  it('409 (mükerrer TC No) durumunda form üstü banner gösterir', async () => {
    server.use(
      http.post(`${BASE_URL}/api/organization/employees`, () =>
        HttpResponse.json(
          {
            type: 'about:blank',
            title: 'Çalışan zaten kayıtlı',
            status: 409,
            detail: 'Bu TC Kimlik No ile kayıtlı bir çalışan zaten var.',
          },
          { status: 409 },
        ),
      ),
    )
    renderPage()
    const user = userEvent.setup()
    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    expect(
      await screen.findByText('Bu TC Kimlik No ile kayıtlı bir çalışan zaten var.'),
    ).toBeInTheDocument()
  })

  it('boş formu submit edince validasyon hatalarını gösterir', async () => {
    renderPage()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    expect(await screen.findByText('Ad boş olamaz.')).toBeInTheDocument()
    expect(screen.getByText('Soyad boş olamaz.')).toBeInTheDocument()
    expect(screen.getByText('E-posta boş olamaz.')).toBeInTheDocument()
  })
})
