export type LoginResponse = {
  userId: number
  email: string
  token: string
  expiresAt: string
}

export type SessionResponse = {
  userId: number
  email: string
  expiresAt: string
}

export type ProfileResponse = {
  userId: number
  email: string
  fullName: string
  roles: string[]
}

// Bölüm 14.1 — backend'in UserSummaryResponse'uyla BİREBİR eşleşir (bkz.
// auth.controller.UserController).
export type UserSummary = {
  id: number
  email: string
  fullName: string | null
  roles: string[]
}

export type AssignRoleRequest = {
  roleCode: string
}
