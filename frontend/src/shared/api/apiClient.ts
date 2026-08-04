import type { ProblemDetail } from '../types/ProblemDetail'
import { ApiError } from './ApiError'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
const TOKEN_STORAGE_KEY = 'dijitalik_token'
const LOGIN_PATH = '/api/auth/login'

export function getToken(): string | null {
  return window.localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY)
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: unknown
}

async function parseProblem(response: Response): Promise<ProblemDetail | null> {
  try {
    return (await response.json()) as ProblemDetail
  } catch {
    return null
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {}
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  // Bölüm 5.2: login isteğinin KENDİSİ hariç, herhangi bir 401 global oturum
  // temizleme + /login'e yönlendirme tetikler (TTL dolumu dahil).
  if (response.status === 401 && path !== LOGIN_PATH) {
    clearToken()
    if (!window.location.pathname.startsWith('/login')) {
      window.location.assign('/login?expired=1')
    }
    throw new ApiError(401, 'Oturum sona erdi', 'Oturumunuz sona erdi, tekrar giriş yapın.')
  }

  if (response.status === 204) {
    return undefined as T
  }

  if (!response.ok) {
    const problem = await parseProblem(response)
    throw new ApiError(
      response.status,
      problem?.title ?? 'Hata',
      problem?.detail ?? 'Beklenmeyen bir hata oluştu, tekrar deneyin.',
    )
  }

  return (await response.json()) as T
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
