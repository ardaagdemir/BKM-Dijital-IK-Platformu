import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { UnitTreeNode } from '../utils/buildUnitTree'
import { CreateUnitDialog } from './CreateUnitDialog'

const tree: UnitTreeNode[] = [
  {
    id: 1,
    name: 'İK',
    parentId: null,
    children: [{ id: 2, name: 'İşe Alım', parentId: 1, children: [] }],
  },
]

// Bölüm 13.4 Testler: "Yeni birim ekleme formunun doğru parentId ile submit
// ettiği."
describe('CreateUnitDialog', () => {
  it('bir üst birim seçildiğinde doğru parentId ile submit eder', async () => {
    const handleSubmit = vi.fn()
    render(
      <CreateUnitDialog
        open
        tree={tree}
        submitting={false}
        errorMessage={null}
        onSubmit={handleSubmit}
        onClose={() => {}}
      />,
    )
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Birim Adı'), 'Bordro')
    await user.click(screen.getByLabelText('Üst Birim'))
    await user.click(await screen.findByRole('option', { name: /İşe Alım/ }))
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    expect(handleSubmit).toHaveBeenCalledTimes(1)
    expect(handleSubmit.mock.calls[0][0]).toEqual({ name: 'Bordro', parentId: 2 })
  })

  it('üst birim seçilmezse kök birim olarak (parentId: null) submit eder', async () => {
    const handleSubmit = vi.fn()
    render(
      <CreateUnitDialog
        open
        tree={tree}
        submitting={false}
        errorMessage={null}
        onSubmit={handleSubmit}
        onClose={() => {}}
      />,
    )
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Birim Adı'), 'Pazarlama')
    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    expect(handleSubmit).toHaveBeenCalledTimes(1)
    expect(handleSubmit.mock.calls[0][0]).toEqual({ name: 'Pazarlama', parentId: null })
  })

  it('boş isimle submit edilince validasyon hatasını gösterir', async () => {
    const handleSubmit = vi.fn()
    render(
      <CreateUnitDialog
        open
        tree={tree}
        submitting={false}
        errorMessage={null}
        onSubmit={handleSubmit}
        onClose={() => {}}
      />,
    )
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Oluştur' }))

    expect(await screen.findByText('Birim adı boş olamaz.')).toBeInTheDocument()
    expect(handleSubmit).not.toHaveBeenCalled()
  })
})
