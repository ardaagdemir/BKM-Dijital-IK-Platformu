import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { authHandlers } from '../../../../test/msw/handlers/auth'
import { server } from '../../../../test/msw/server'
import { AuthProvider } from '../AuthProvider'
import { LoginPage } from './LoginPage'

function renderLoginPage() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>Ana Sayfa</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('E-posta'), email)
  await user.type(screen.getByLabelText('Parola'), password)
  await user.click(screen.getByRole('button', { name: 'Giriş Yap' }))
}

describe('LoginPage', () => {
  it('doğru bilgiyle giriş yapınca ana sayfaya yönlendirir', async () => {
    server.use(authHandlers.loginSuccess)
    renderLoginPage()

    await fillAndSubmit('ik@dijitalik.local', 'dogru-parola')

    expect(await screen.findByText('Ana Sayfa')).toBeInTheDocument()
  })

  it('401 durumunda "E-posta veya parola hatalı." mesajını gösterir', async () => {
    server.use(authHandlers.loginInvalidCredentials)
    renderLoginPage()

    await fillAndSubmit('ik@dijitalik.local', 'yanlis-parola')

    expect(await screen.findByText('E-posta veya parola hatalı.')).toBeInTheDocument()
    expect(screen.getByLabelText('E-posta')).toHaveValue('ik@dijitalik.local')
    expect(screen.getByLabelText('Parola')).toHaveValue('')
  })

  it('423 durumunda hesap kilidi mesajını gösterir', async () => {
    server.use(authHandlers.loginAccountLocked)
    renderLoginPage()

    await fillAndSubmit('ik@dijitalik.local', 'dogru-parola')

    expect(
      await screen.findByText(
        'Hesap çok sayıda başarısız giriş denemesi nedeniyle geçici olarak kilitlendi.',
      ),
    ).toBeInTheDocument()
  })

  it('boş alanlarla submit edilince validasyon hatalarını gösterir', async () => {
    renderLoginPage()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Giriş Yap' }))

    await waitFor(() => {
      expect(screen.getByText('E-posta zorunludur.')).toBeInTheDocument()
      expect(screen.getByText('Parola zorunludur.')).toBeInTheDocument()
    })
  })
})
