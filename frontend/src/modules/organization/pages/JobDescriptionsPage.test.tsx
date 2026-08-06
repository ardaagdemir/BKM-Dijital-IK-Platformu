import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { server } from '../../../../test/msw/server'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import type { JobTitle } from '../types'
import { JobDescriptionsPage } from './JobDescriptionsPage'

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <JobDescriptionsPage />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

const jobTitle: JobTitle = { id: 1, name: 'Yazılım Mühendisi' }

describe('JobDescriptionsPage', () => {
  it('unvan seçilip görev tanımı yazılır ve listede görünür', async () => {
    server.use(...createOrganizationHandlers([jobTitle]))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Görev tanımlarını görüntülemek için bir unvan seçin.')
    await user.click(screen.getByLabelText('Unvan'))
    await user.click(await screen.findByRole('option', { name: 'Yazılım Mühendisi' }))

    await screen.findByText('Bu unvan için henüz bir görev tanımı yazılmadı.')
    await user.click(screen.getByRole('button', { name: 'Yeni Görev Tanımı' }))
    await user.type(screen.getByLabelText('Görev Tanımı'), 'Backend servislerini geliştirir.')
    await user.click(screen.getByRole('button', { name: 'Kaydet' }))

    expect(await screen.findByText('Görev tanımı kaydedildi')).toBeInTheDocument()
    const table = await screen.findByRole('table')
    await within(table).findByText('Backend servislerini geliştirir.')
  })

  it('boş içerikle submit edilince validasyon hatasını gösterir', async () => {
    server.use(...createOrganizationHandlers([jobTitle]))
    renderPage()
    const user = userEvent.setup()

    await user.click(screen.getByLabelText('Unvan'))
    await user.click(await screen.findByRole('option', { name: 'Yazılım Mühendisi' }))
    await screen.findByText('Bu unvan için henüz bir görev tanımı yazılmadı.')

    await user.click(screen.getByRole('button', { name: 'Yeni Görev Tanımı' }))
    await user.click(screen.getByRole('button', { name: 'Kaydet' }))

    expect(await screen.findByText('Görev tanımı boş olamaz.')).toBeInTheDocument()
  })
})
