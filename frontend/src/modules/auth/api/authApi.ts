import { apiClient } from '../../../shared/api/apiClient'
import type { LoginResponse, ProfileResponse, SessionResponse } from '../types'

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>('/api/auth/login', { email, password })
}

export function getSession(): Promise<SessionResponse> {
  return apiClient.get<SessionResponse>('/api/auth/session')
}

export function getProfile(): Promise<ProfileResponse> {
  return apiClient.get<ProfileResponse>('/api/auth/me')
}

export function logout(): Promise<void> {
  return apiClient.post<void>('/api/auth/logout')
}
