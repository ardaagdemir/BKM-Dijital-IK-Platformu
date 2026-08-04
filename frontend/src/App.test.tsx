import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

/**
 * US-01.1.2 kabul kriteri: "Proje derlenir, boş bir ana sayfa açılır;
 * component kütüphanesi seçilmiştir (ör. MUI/Ant Design)." — 13.1 Login
 * ekranı eklendiğinden bu artık korumalı; oturumsuz ziyaretçi "/"
 * üzerinden otomatik olarak "/login"e yönlendirilir (bkz. ProtectedRoute).
 */
describe('App', () => {
  it('oturumsuz ziyaretçi için giriş ekranını görüntüler', async () => {
    render(<App />)

    expect(
      await screen.findByRole('heading', { name: 'Dijital İK Platformu' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('E-posta')).toBeInTheDocument()
    expect(screen.getByLabelText('Parola')).toBeInTheDocument()
  })
})
