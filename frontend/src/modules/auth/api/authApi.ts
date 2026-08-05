import { apiClient } from '../../../shared/api/apiClient'
import type { AssignRoleRequest, LoginResponse, ProfileResponse, SessionResponse, UserSummary } from '../types'

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

// Bölüm 14.1 — `GET /api/auth/users`, roller ZATEN her kullanıcı satırına
// GÖMÜLÜ döner (bkz. UserController#toSummary) — ayrı bir
// `GET /{id}/roles` çağrısına GEREK YOK.
export function listUsers(): Promise<UserSummary[]> {
  return apiClient.get<UserSummary[]>('/api/auth/users')
}

export function assignRole(userId: number, roleCode: string): Promise<void> {
  return apiClient.post<void>(`/api/auth/users/${userId}/roles`, { roleCode } satisfies AssignRoleRequest)
}

export function removeRole(userId: number, roleCode: string): Promise<void> {
  return apiClient.delete<void>(`/api/auth/users/${userId}/roles/${roleCode}`)
}
