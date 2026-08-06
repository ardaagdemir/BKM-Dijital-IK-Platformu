import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { server } from '../../../../test/msw/server'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import type { PolicyDocument } from '../types'
import { PolicyDocumentsPage } from './PolicyDocumentsPage'

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <PolicyDocumentsPage />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

function makeFile(name: string) {
  return new File(['içerik'], name, { type: 'application/pdf' })
}

describe('PolicyDocumentsPage', () => {
  it('başlık+dosyayla ilk versiyon yüklenir', async () => {
    server.use(...createOrganizationHandlers())
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir doküman yüklenmedi.')
    await user.click(screen.getByRole('button', { name: 'Yeni Doküman' }))
    await user.type(screen.getByLabelText('Başlık'), 'İzin Politikası')
    await user.upload(screen.getByLabelText('Doküman'), makeFile('izin.pdf'))
    await user.click(screen.getByRole('button', { name: 'Yükle' }))

    expect(await screen.findByText('Doküman yüklendi')).toBeInTheDocument()
    expect(await screen.findByText('İzin Politikası')).toBeInTheDocument()
    expect(screen.getByText('v1')).toBeInTheDocument()
  })

  it('yeni versiyon yükleyince eskisi arşivlenir, başlık alanı GÖRÜNMEZ', async () => {
    const v1: PolicyDocument = {
      id: 1,
      title: 'Seyahat Politikası',
      version: 1,
      fileName: 'v1.pdf',
      status: 'ACTIVE',
      previousVersionId: null,
    }
    server.use(...createOrganizationHandlers([], [], [], [], [], [v1]))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Seyahat Politikası')
    await user.click(screen.getByRole('button', { name: 'Yeni Versiyon Yükle' }))
    expect(screen.queryByLabelText('Başlık')).not.toBeInTheDocument()
    await user.upload(screen.getByLabelText('Doküman'), makeFile('v2.pdf'))
    await user.click(screen.getByRole('button', { name: 'Yükle' }))

    expect(await screen.findByText('Yeni versiyon yüklendi')).toBeInTheDocument()
    expect(await screen.findByText('v2')).toBeInTheDocument()

    const table = await screen.findByRole('table')
    await within(table).findByText('Arşivlendi')
  })

  it('dosya seçilmeden submit edilince validasyon hatasını gösterir', async () => {
    server.use(...createOrganizationHandlers())
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Henüz bir doküman yüklenmedi.')
    await user.click(screen.getByRole('button', { name: 'Yeni Doküman' }))
    await user.type(screen.getByLabelText('Başlık'), 'Doküman')
    await user.click(screen.getByRole('button', { name: 'Yükle' }))

    expect(await screen.findByText('Doküman dosyası boş olamaz.')).toBeInTheDocument()
  })
})
