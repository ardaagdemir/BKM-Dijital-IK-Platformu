import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BrandHeader } from './BrandHeader'

// Görev: "Masaüstü sidebar'ın üstüne ürün adı ekle: 'Dijital İK'. Altına
// küçük şekilde 'İnsan Kaynakları Platformu' yaz."
describe('BrandHeader', () => {
  it('genişletilmiş modda ürün adını ve alt başlığı gösterir', () => {
    render(<BrandHeader />)

    expect(screen.getByText('Dijital İK')).toBeInTheDocument()
    expect(screen.getByText('İnsan Kaynakları Platformu')).toBeInTheDocument()
  })

  it('daraltılmış (compact) modda yalnızca ikonu gösterir, metin RENDER EDİLMEZ', () => {
    render(<BrandHeader compact />)

    expect(screen.queryByText('Dijital İK')).not.toBeInTheDocument()
    expect(screen.queryByText('İnsan Kaynakları Platformu')).not.toBeInTheDocument()
  })
})
