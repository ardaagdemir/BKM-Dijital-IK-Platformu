import { describe, expect, it } from 'vitest'
import { formatAssignmentEndDate } from './assignmentHistory'

// Bölüm 14.2 Testler: "Unit: tarih sıralama" — backend zaten startDate DESC
// sıralı döndürdüğünden frontend'in kendi tarih-bağlı mantığı, açık/kapalı
// atama ayrımını doğru YANSITMASIDIR (bkz. assignmentHistory.ts'teki not).
describe('formatAssignmentEndDate', () => {
  it('endDate null ise "Halen Aktif" döner (açık/güncel atama)', () => {
    expect(formatAssignmentEndDate(null)).toBe('Halen Aktif')
  })

  it('endDate doluysa AYNEN döner (kapanmış atama)', () => {
    expect(formatAssignmentEndDate('2026-03-01')).toBe('2026-03-01')
  })
})
