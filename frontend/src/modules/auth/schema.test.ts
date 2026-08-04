import { describe, expect, it } from 'vitest'
import { loginSchema } from './schema'

describe('loginSchema', () => {
  it('boş e-posta ve parolayı reddeder', () => {
    const result = loginSchema.safeParse({ email: '', password: '' })

    expect(result.success).toBe(false)
    if (!result.success) {
      const issues = result.error.issues.map((issue) => issue.path[0])
      expect(issues).toContain('email')
      expect(issues).toContain('password')
    }
  })

  it('geçersiz e-posta formatını reddeder', () => {
    const result = loginSchema.safeParse({ email: 'gecersiz-eposta', password: 'gizli123' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path[0]).toBe('email')
    }
  })

  it('geçerli e-posta ve parolayı kabul eder', () => {
    const result = loginSchema.safeParse({ email: 'ik@dijitalik.local', password: 'gizli123' })

    expect(result.success).toBe(true)
  })
})
