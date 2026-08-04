import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { server } from '../../../../test/msw/server'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import { JobTitlesPage } from './JobTitlesPage'

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <JobTitlesPage />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

// Bölüm 13.4 Testler: "Unvan CRUD akışı."
describe('JobTitlesPage — unvan CRUD akışı (13.4)', () => {
  it('oluşturur, düzenler ve siler', async () => {
    server.use(...createOrganizationHandlers())
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir unvan tanımlanmadı.')

    await user.click(screen.getByRole('button', { name: 'Yeni Unvan' }))
    await user.type(screen.getByLabelText('Unvan Adı'), 'Yazılım Mühendisi')
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    // ResponsiveTable, masaüstü tablo VE mobil kartı AYNI ANDA render eder
    // (yalnızca CSS display ile ayrışır, jsdom bunu değerlendirmez) — bu
    // yüzden sorgular tabloya SCOPE edilir (bkz. ResponsiveTable.tsx).
    const table = await screen.findByRole('table')
    await within(table).findByText('Yazılım Mühendisi')
    expect(await screen.findByText('Unvan oluşturuldu')).toBeInTheDocument()

    await user.click(await within(table).findByRole('button', { name: 'Yazılım Mühendisi unvanını düzenle' }))
    const nameInput = screen.getByLabelText('Unvan Adı')
    await user.clear(nameInput)
    await user.type(nameInput, 'Kıdemli Yazılım Mühendisi')
    await user.click(screen.getByRole('button', { name: 'Kaydet' }))

    await within(table).findByText('Kıdemli Yazılım Mühendisi')
    expect(await screen.findByText('Unvan güncellendi')).toBeInTheDocument()

    // MUI Dialog'un kapanış GEÇİŞİ tamamlanana kadar arka plan geçici olarak
    // aria-hidden kalır (bkz. AppShell.breakpoint.test.tsx'teki AYNI not) —
    // bu yüzden getByRole DEĞİL, yeniden deneyen findByRole kullanılır.
    await user.click(await within(table).findByRole('button', { name: 'Kıdemli Yazılım Mühendisi unvanını sil' }))
    await user.click(await screen.findByRole('button', { name: 'Sil' }))

    await screen.findByText('Henüz bir unvan tanımlanmadı.')
    expect(await screen.findByText('Unvan silindi')).toBeInTheDocument()
  })

  it('boş isimle submit edilince validasyon hatasını gösterir ve API çağrılmaz', async () => {
    server.use(...createOrganizationHandlers())
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir unvan tanımlanmadı.')
    await user.click(screen.getByRole('button', { name: 'Yeni Unvan' }))
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    expect(await screen.findByText('Unvan adı boş olamaz.')).toBeInTheDocument()
    expect(screen.getByText('Henüz bir unvan tanımlanmadı.')).toBeInTheDocument()
  })
})
