import { describe, expect, it } from 'vitest'
import { canEditEmployee } from './employeeAccess'

// Bölüm 13.7 Testler: "Rol bazlı buton/sekme görünürlük mantığı (ADMIN vs
// CALISAN-kendi-kaydı vs CALISAN-başka-kayıt senaryoları)." — CALISAN-kendi
// ve CALISAN-başka senaryoları backend tarafında AYRIŞIR (bkz.
// employeeAccess.ts'teki not): ikisi de frontend'de "düzenleyemez" sonucuna
// varır, bu yüzden tek karar noktası olan canEditEmployee test edilir.
describe('canEditEmployee', () => {
  it('ADMIN rolü için düzenlemeye izin verir', () => {
    expect(canEditEmployee(['ADMIN'])).toBe(true)
  })

  it('IK rolü için düzenlemeye izin verir', () => {
    expect(canEditEmployee(['IK'])).toBe(true)
  })

  it('CALISAN rolü için (kendi kaydı olsa dahi) düzenlemeye İZİN VERMEZ', () => {
    expect(canEditEmployee(['CALISAN'])).toBe(false)
  })

  it('YONETICI rolü için düzenlemeye izin vermez', () => {
    expect(canEditEmployee(['YONETICI'])).toBe(false)
  })

  it('rolü olmayan kullanıcı için düzenlemeye izin vermez', () => {
    expect(canEditEmployee([])).toBe(false)
  })

  it('birden çok rolden biri ADMIN/IK ise düzenlemeye izin verir', () => {
    expect(canEditEmployee(['CALISAN', 'IK'])).toBe(true)
  })
})
