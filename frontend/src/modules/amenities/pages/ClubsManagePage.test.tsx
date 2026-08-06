import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createClubHandlers } from '../../../../test/msw/handlers/amenities'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { server } from '../../../../test/msw/server'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import type { Employee } from '../../organization/types'
import { ClubsManagePage } from './ClubsManagePage'

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
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ClubsManagePage />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

describe('ClubsManagePage', () => {
  it('lider seçilerek kulüp oluşturulur, düzenlenir ve silinir', async () => {
    server.use(...createOrganizationHandlers([], [], [makeEmployee()]), ...createClubHandlers([]))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir kulüp tanımlanmadı.')
    await user.click(screen.getByRole('button', { name: 'Yeni Kulüp' }))
    await user.type(screen.getByLabelText('Kulüp Adı'), 'Satranç Kulübü')

    const leaderInput = screen.getByRole('combobox', { name: 'Kulüp Lideri' })
    await user.click(leaderInput)
    await user.type(leaderInput, 'Ahmet')
    await user.click(await screen.findByRole('option', { name: 'Ahmet Yılmaz' }))

    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    const table = await screen.findByRole('table')
    await within(table).findByText('Satranç Kulübü')
    await within(table).findByText('#1')
    expect(await screen.findByText('Kulüp oluşturuldu')).toBeInTheDocument()

    await user.click(await within(table).findByRole('button', { name: 'Satranç Kulübü kulübünü düzenle' }))
    await user.clear(screen.getByLabelText('Kulüp Adı'))
    await user.type(screen.getByLabelText('Kulüp Adı'), 'Satranç ve Zeka Kulübü')
    await user.click(screen.getByRole('button', { name: 'Kaydet' }))

    await within(table).findByText('Satranç ve Zeka Kulübü')
    expect(await screen.findByText('Kulüp güncellendi')).toBeInTheDocument()

    await user.click(await within(table).findByRole('button', { name: 'Satranç ve Zeka Kulübü kulübünü sil' }))
    await user.click(await screen.findByRole('button', { name: 'Sil' }))

    await screen.findByText('Henüz bir kulüp tanımlanmadı.')
    expect(await screen.findByText('Kulüp silindi')).toBeInTheDocument()
  })

  it('boş isimle submit edilince validasyon hatasını gösterir', async () => {
    server.use(...createOrganizationHandlers([], [], []), ...createClubHandlers([]))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir kulüp tanımlanmadı.')
    await user.click(screen.getByRole('button', { name: 'Yeni Kulüp' }))
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    expect(await screen.findByText('Kulüp adı boş olamaz.')).toBeInTheDocument()
  })
})
