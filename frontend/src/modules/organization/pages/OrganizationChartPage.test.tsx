import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { server } from '../../../../test/msw/server'
import type { OrganizationChartNode } from '../types'
import { OrganizationChartPage } from './OrganizationChartPage'

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <OrganizationChartPage />
    </QueryClientProvider>,
  )
}

const chart: OrganizationChartNode[] = [
  {
    id: 1,
    name: 'Genel Müdürlük',
    employees: [{ id: 1, firstName: 'Ahmet', lastName: 'Yılmaz', jobTitleName: 'Genel Müdür' }],
    children: [
      {
        id: 2,
        name: 'İnsan Kaynakları',
        employees: [{ id: 2, firstName: 'Ayşe', lastName: 'Kaya', jobTitleName: 'İK Uzmanı' }],
        children: [],
      },
    ],
  },
]

describe('OrganizationChartPage', () => {
  it('birim ağacını gösterir, genişletilince çalışanlar görünür', async () => {
    server.use(...createOrganizationHandlers([], [], [], [], [], [], [], chart))
    renderPage()
    const user = userEvent.setup()

    await screen.findByText('Genel Müdürlük')
    expect(screen.queryByText(/Ahmet/)).not.toBeInTheDocument()

    await user.click(screen.getByText('Genel Müdürlük'))
    await screen.findByText(/Ahmet/)
    await screen.findByText('İnsan Kaynakları')
  })

  it('hiç birim yoksa boş durum gösterir', async () => {
    server.use(...createOrganizationHandlers())
    renderPage()

    await screen.findByText('Henüz bir organizasyon birimi tanımlanmadı.')
  })
})
