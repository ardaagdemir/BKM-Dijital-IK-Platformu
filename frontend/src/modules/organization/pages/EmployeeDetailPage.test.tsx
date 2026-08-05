import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { authHandlers } from '../../../../test/msw/handlers/auth'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { server } from '../../../../test/msw/server'
import { setToken } from '../../../shared/api/apiClient'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import { AuthProvider } from '../../auth/AuthProvider'
import type { Employee, EmployeeAssignmentHistoryEntry, JobTitle, OrganizationUnit } from '../types'
import { EmployeeDetailPage } from './EmployeeDetailPage'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

const units: OrganizationUnit[] = [{ id: 1, name: 'İnsan Kaynakları', parentId: null }]
const jobTitles: JobTitle[] = [{ id: 1, name: 'Uzman' }]

function makeEmployee(overrides: Partial<Employee> = {}): Employee {
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

function renderPage(employeeId: number) {
  setToken('test-token')
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter([{ path: '/organization/employees/:id', element: <EmployeeDetailPage /> }], {
    initialEntries: [`/organization/employees/${employeeId}`],
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
        <AuthProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </AuthProvider>
      </LocalizationProvider>
    </QueryClientProvider>,
  )
}

// Bölüm 13.7 Testler: "Formun mevcut veriyle önceden dolduğunun, kaydetmenin
// doğru PUT'u tetiklediğinin doğrulanması" + rol bazlı görünürlük.
describe('EmployeeDetailPage', () => {
  it('ADMIN için formlar mevcut veriyle önceden dolu gelir ve kaydetme PUT tetikler', async () => {
    server.use(...createOrganizationHandlers(jobTitles, units, [makeEmployee()]), authHandlers.meAdmin)
    renderPage(1)
    const user = userEvent.setup()

    expect(await screen.findByLabelText('Ad', { exact: true })).toHaveValue('Ahmet')
    expect(screen.getByLabelText('Soyad')).toHaveValue('Yılmaz')
    expect(screen.getByLabelText('TC Kimlik No')).toHaveValue('10000000146')
    expect(screen.getByLabelText('E-posta')).toHaveValue('ahmet@dijitalik.local')

    await user.clear(screen.getByLabelText('Soyad'))
    await user.type(screen.getByLabelText('Soyad'), 'Kaya')
    // Sayfada İKİ "Kaydet" butonu var (Genel Bilgiler + Atama) — ilki bu forma ait.
    await user.click(screen.getAllByRole('button', { name: 'Kaydet' })[0])

    expect(await screen.findByText('Çalışan bilgileri güncellendi')).toBeInTheDocument()
    expect(screen.getByLabelText('Soyad')).toHaveValue('Kaya')
  })

  it('ADMIN atama formuyla birim/unvan seçip kaydedebilir', async () => {
    server.use(...createOrganizationHandlers(jobTitles, units, [makeEmployee()]), authHandlers.meAdmin)
    renderPage(1)
    const user = userEvent.setup()

    await screen.findByLabelText('Ad', { exact: true })
    await user.click(screen.getByLabelText('Birim'))
    await user.click(await screen.findByRole('option', { name: 'İnsan Kaynakları' }))
    await user.click(screen.getByLabelText('Unvan'))
    await user.click(await screen.findByRole('option', { name: 'Uzman' }))

    const assignmentSaveButtons = screen.getAllByRole('button', { name: 'Kaydet' })
    await user.click(assignmentSaveButtons[assignmentSaveButtons.length - 1])

    expect(await screen.findByText('Atama güncellendi')).toBeInTheDocument()
  })

  it('kendi kaydına bakan CALISAN salt-okunur görür, form alanı YOKTUR', async () => {
    server.use(
      ...createOrganizationHandlers(jobTitles, units, [makeEmployee({ email: 'calisan@dijitalik.local' })]),
      authHandlers.meCalisan,
    )
    renderPage(1)

    expect(await screen.findByText('Ahmet')).toBeInTheDocument()
    expect(screen.getByText('Yılmaz')).toBeInTheDocument()
    expect(screen.queryByLabelText('Ad', { exact: true })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Kaydet' })).not.toBeInTheDocument()
  })

  it('var olmayan çalışan için "Çalışan bulunamadı" gösterir', async () => {
    server.use(...createOrganizationHandlers(jobTitles, units, []), authHandlers.meAdmin)
    renderPage(999)

    expect(await screen.findByText('Çalışan bulunamadı')).toBeInTheDocument()
  })

  it('başkasının kaydına erişimi olmayan kullanıcı için "Bu kayda erişim yetkiniz yok" gösterir', async () => {
    server.use(
      // ÖNCE tanımlanır: MSW handler'ları kayıt sırasına göre eşleştirir,
      // bu spesifik override createOrganizationHandlers'ın kendi (404 dönen)
      // GET /employees/:id'sinden ÖNCE gelmelidir.
      http.get(`${BASE_URL}/api/organization/employees/1`, () =>
        HttpResponse.json(
          {
            type: 'about:blank',
            title: 'Erişim reddedildi',
            status: 403,
            detail: 'Bu işlemi yapmaya yetkiniz yok.',
          },
          { status: 403 },
        ),
      ),
      ...createOrganizationHandlers(jobTitles, units, []),
      authHandlers.meCalisan,
    )
    renderPage(1)

    expect(await screen.findByText('Bu kayda erişim yetkiniz yok')).toBeInTheDocument()
  })
})

// Bölüm 14.2 Testler: "Entegrasyon: upsert (yoksa oluştur/varsa günceller)
// davranışı" (Özlük) + "E2E: zimmet ekleyip iade etme" senaryosunun
// entegrasyon karşılığı + Atama Geçmişi'nin doğru render edildiği.
describe('EmployeeDetailPage — 14.2 sekmeleri', () => {
  it('Genişletilmiş Özlük: profil hiç yokken boş form gelir, doldurulup kaydedilince kalıcı olur', async () => {
    server.use(...createOrganizationHandlers(jobTitles, units, [makeEmployee()]), authHandlers.meAdmin)
    renderPage(1)
    const user = userEvent.setup()

    await screen.findByLabelText('Ad', { exact: true })
    await user.click(screen.getByRole('tab', { name: 'Genişletilmiş Özlük' }))

    expect(await screen.findByLabelText('Doğum Yeri')).toHaveValue('')
    await user.type(screen.getByLabelText('Doğum Yeri'), 'İstanbul')
    await user.type(screen.getByLabelText('Şehir'), 'İstanbul')
    await user.click(screen.getByRole('button', { name: 'Kaydet' }))

    expect(await screen.findByText('Özlük bilgileri güncellendi')).toBeInTheDocument()
    expect(screen.getByLabelText('Doğum Yeri')).toHaveValue('İstanbul')
  })

  it('Zimmetler: yeni zimmet eklenebilir ve iade alınabilir', async () => {
    server.use(...createOrganizationHandlers(jobTitles, units, [makeEmployee()]), authHandlers.meAdmin)
    renderPage(1)
    const user = userEvent.setup()

    await screen.findByLabelText('Ad', { exact: true })
    await user.click(screen.getByRole('tab', { name: 'Zimmetler' }))

    expect(await screen.findByText('Henüz zimmet kaydı yok.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Yeni Zimmet' }))
    const createDialog = await screen.findByRole('dialog')
    await user.type(within(createDialog).getByLabelText('Zimmet Kalemi'), 'Dizüstü Bilgisayar')
    // MUI X DatePicker'ın segmentli girişi: gün/ay/yıl AYRI spinbutton'lar —
    // segmentler arası otomatik geçiş jsdom'da güvenilir olmadığından
    // (bkz. EmployeeCreatePage.test.tsx'teki AYNI desen) her biri AYRI
    // odaklanıp yazılır (takvim ikonuna tıklamak yerine).
    await user.click(within(createDialog).getByRole('spinbutton', { name: 'Day' }))
    await user.keyboard('15')
    await user.click(within(createDialog).getByRole('spinbutton', { name: 'Month' }))
    await user.keyboard('01')
    await user.click(within(createDialog).getByRole('spinbutton', { name: 'Year' }))
    await user.keyboard('2026')
    await user.click(within(createDialog).getByRole('button', { name: 'Ekle' }))

    expect(await screen.findByText('Zimmet eklendi')).toBeInTheDocument()
    // ResponsiveTable masaüstü tablo VE mobil kartı AYNI ANDA render eder
    // (bkz. 13.6'daki AYNI not) — "İade Al" butonu da HER İKİSİNDE ayrı ayrı
    // var; ilk (tablodaki) kopyaya scope edilir.
    const table = await screen.findByRole('table')
    await within(table).findByText('Dizüstü Bilgisayar')

    await user.click(within(table).getByRole('button', { name: 'İade Al' }))
    const returnDialog = await screen.findByRole('dialog')
    await user.click(within(returnDialog).getByRole('button', { name: 'İade Al' }))

    expect(await screen.findByText('Zimmet iade alındı')).toBeInTheDocument()
    // Onay diyaloğunun KENDİ "İade Al" butonu, kapanış animasyonu sırasında
    // KISA bir süre DOM'da kalabiliyor (bkz. 13.7'de keşfedilen AYNI
    // davranış) — bu yüzden satır aksiyonuna tabloya scope edilerek bakılır.
    expect(within(table).queryByRole('button', { name: 'İade Al' })).not.toBeInTheDocument()
  })

  it('Atama Geçmişi: kayıtlar (açık/kapalı) doğru render edilir', async () => {
    const history: EmployeeAssignmentHistoryEntry[] = [
      { id: 2, employeeId: 1, organizationUnitId: 1, jobTitleId: 1, startDate: '2026-03-01', endDate: null },
      { id: 1, employeeId: 1, organizationUnitId: 1, jobTitleId: 1, startDate: '2026-01-01', endDate: '2026-02-28' },
    ]
    server.use(
      ...createOrganizationHandlers(jobTitles, units, [makeEmployee()], [], history),
      authHandlers.meAdmin,
    )
    renderPage(1)
    const user = userEvent.setup()

    await screen.findByLabelText('Ad', { exact: true })
    await user.click(screen.getByRole('tab', { name: 'Atama Geçmişi' }))

    const table = await screen.findByRole('table')
    expect(within(table).getByText('Halen Aktif')).toBeInTheDocument()
    expect(within(table).getByText('2026-02-28')).toBeInTheDocument()
  })

  it('kendi kaydına bakan CALISAN için Zimmetler/Atama Geçmişi sekmeleri HİÇ görünmez', async () => {
    server.use(
      ...createOrganizationHandlers(jobTitles, units, [makeEmployee({ email: 'calisan@dijitalik.local' })]),
      authHandlers.meCalisan,
    )
    renderPage(1)

    await screen.findByRole('tab', { name: 'Genel Bilgiler' })
    expect(screen.getByRole('tab', { name: 'Genişletilmiş Özlük' })).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Zimmetler' })).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Atama Geçmişi' })).not.toBeInTheDocument()
  })
})
