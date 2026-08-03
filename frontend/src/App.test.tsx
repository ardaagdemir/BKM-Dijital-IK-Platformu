import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

/**
 * US-01.1.2 kabul kriteri: "Proje derlenir, boş bir ana sayfa açılır;
 * component kütüphanesi seçilmiştir (ör. MUI/Ant Design)."
 */
describe('App', () => {
  it('ana sayfa başlığını görüntüler', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: 'Dijital İK Platformu' }),
    ).toBeInTheDocument()
  })
})
