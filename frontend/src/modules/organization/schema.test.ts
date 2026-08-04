import { describe, expect, it } from 'vitest'
import { employeeSchema, isValidNationalId } from './schema'

// Bölüm 13.5 Testler: "backend testindeki AYNI '10000000146' gibi bilinen
// geçerli örnekler kullanılır" (bkz. organization.EmployeeControllerTest).
describe('isValidNationalId', () => {
  it.each(['10000000146', '12345678950', '11111111110'])(
    '%s geçerli TC Kimlik No olarak kabul edilir',
    (value) => {
      expect(isValidNationalId(value)).toBe(true)
    },
  )

  it.each([
    ['12345678901', 'kontrol basamağı yanlış'],
    ['123', '11 haneden kısa'],
    ['00000000146', 'ilk hane 0'],
    ['abcdefghijk', 'sayısal değil'],
  ])('%s geçersiz TC Kimlik No olarak reddedilir (%s)', (value) => {
    expect(isValidNationalId(value)).toBe(false)
  })
})

describe('employeeSchema', () => {
  it('geçerli veriyi kabul eder', () => {
    const result = employeeSchema.safeParse({
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      nationalId: '10000000146',
      hireDate: '2026-01-15',
      email: 'ahmet@dijitalik.local',
    })

    expect(result.success).toBe(true)
  })

  it('geçersiz TC Kimlik No için backend ile BİREBİR aynı mesajı döner', () => {
    const result = employeeSchema.safeParse({
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      nationalId: '12345678901',
      hireDate: '2026-01-15',
      email: 'ahmet@dijitalik.local',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('TC Kimlik No geçersiz.')
    }
  })

  it('boş alanlar için backend ile BİREBİR aynı mesajları döner', () => {
    const result = employeeSchema.safeParse({
      firstName: '',
      lastName: '',
      nationalId: '',
      hireDate: '',
      email: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message)
      expect(messages).toContain('Ad boş olamaz.')
      expect(messages).toContain('Soyad boş olamaz.')
      expect(messages).toContain('TC Kimlik No geçersiz.')
      expect(messages).toContain('İşe giriş tarihi boş olamaz.')
      expect(messages).toContain('E-posta boş olamaz.')
    }
  })
})
