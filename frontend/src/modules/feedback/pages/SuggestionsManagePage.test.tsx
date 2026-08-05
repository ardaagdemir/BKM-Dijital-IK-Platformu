import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createFeedbackHandlers } from '../../../../test/msw/handlers/feedback'
import { server } from '../../../../test/msw/server'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import type { Suggestion, SuggestionCategory } from '../types'
import { SuggestionsManagePage } from './SuggestionsManagePage'

const category: SuggestionCategory = { id: 1, name: 'Ofis' }

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <SuggestionsManagePage />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

describe('SuggestionsManagePage', () => {
  it('anonim ve isimli talepleri birlikte listeler, durumu günceller', async () => {
    const suggestions: Suggestion[] = [
      { id: 1, categoryId: 1, employeeId: 5, description: 'İsimli talep', status: 'PENDING' },
      { id: 2, categoryId: 1, employeeId: null, description: 'Anonim talep', status: 'PENDING' },
    ]
    server.use(...createFeedbackHandlers([], [category], suggestions))
    renderPage()
    const user = userEvent.setup()

    const table = await screen.findByRole('table')
    await within(table).findByText('İsimli talep')
    await within(table).findByText('#5')
    await within(table).findByText('Anonim talep')
    await within(table).findByText('Anonim')

    await user.click(within(table).getByLabelText('Anonim talep durumu'))
    await user.click(await screen.findByRole('option', { name: 'Tamamlandı' }))

    expect(await screen.findByText('Durum güncellendi')).toBeInTheDocument()
  })
})
