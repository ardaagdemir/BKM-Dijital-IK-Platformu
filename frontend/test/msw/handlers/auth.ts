import { HttpResponse, http } from 'msw'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

function profileOf(email: string, fullName: string, roles: string[]) {
  return { userId: 1, email, fullName, roles }
}

export const authHandlers = {
  loginSuccess: http.post(`${BASE_URL}/api/auth/login`, () =>
    HttpResponse.json({
      userId: 1,
      email: 'ik@dijitalik.local',
      token: 'test-token',
      expiresAt: '2026-01-01T00:00:00Z',
    }),
  ),

  loginInvalidCredentials: http.post(`${BASE_URL}/api/auth/login`, () =>
    HttpResponse.json(
      {
        type: 'about:blank',
        title: 'Kimlik doğrulama başarısız',
        status: 401,
        detail: 'E-posta veya parola hatalı.',
      },
      { status: 401 },
    ),
  ),

  loginAccountLocked: http.post(`${BASE_URL}/api/auth/login`, () =>
    HttpResponse.json(
      {
        type: 'about:blank',
        title: 'Hesap kilitli',
        status: 423,
        detail: 'Hesap çok sayıda başarısız giriş denemesi nedeniyle geçici olarak kilitlendi.',
      },
      { status: 423 },
    ),
  ),

  meAdmin: http.get(`${BASE_URL}/api/auth/me`, () =>
    HttpResponse.json(profileOf('admin@dijitalik.local', 'Sistem Yöneticisi', ['ADMIN'])),
  ),

  meCalisan: http.get(`${BASE_URL}/api/auth/me`, () =>
    HttpResponse.json(profileOf('calisan@dijitalik.local', 'Ayşe Yılmaz', ['CALISAN'])),
  ),

  meUnauthorized: http.get(`${BASE_URL}/api/auth/me`, () =>
    HttpResponse.json(
      {
        type: 'about:blank',
        title: 'Kimlik doğrulama gerekli',
        status: 401,
        detail: 'Bu işlem için geçerli bir oturum tokenı gereklidir.',
      },
      { status: 401 },
    ),
  ),

  logoutSuccess: http.post(`${BASE_URL}/api/auth/logout`, () => new HttpResponse(null, { status: 204 })),
}

export const handlers = [authHandlers.loginSuccess, authHandlers.meAdmin, authHandlers.logoutSuccess]
