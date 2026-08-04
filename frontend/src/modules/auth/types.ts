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
