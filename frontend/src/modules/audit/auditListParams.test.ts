import { describe, expect, it } from 'vitest'
import {
  DEFAULT_AUDIT_LOG_LIST_FILTERS,
  buildAuditLogListSearchParams,
  isValidDateRange,
  parseAuditLogListFilters,
} from './auditListParams'

describe('parseAuditLogListFilters', () => {
  it('boş URLSearchParams için varsayılan filtreleri döner', () => {
    expect(parseAuditLogListFilters(new URLSearchParams())).toEqual(DEFAULT_AUDIT_LOG_LIST_FILTERS)
  })

  it('entityType/performedBy/from/to/page parametrelerini okur', () => {
    const params = new URLSearchParams(
      'entityType=Employee&performedBy=ahmet&from=2026-01-01&to=2026-01-31&page=2',
    )

    expect(parseAuditLogListFilters(params)).toEqual({
      entityType: 'Employee',
      performedBy: 'ahmet',
      from: '2026-01-01',
      to: '2026-01-31',
      page: 2,
    })
  })

  it('geçersiz veya negatif page değerini 0a düşürür', () => {
    expect(parseAuditLogListFilters(new URLSearchParams('page=-3')).page).toBe(0)
    expect(parseAuditLogListFilters(new URLSearchParams('page=abc')).page).toBe(0)
  })
})

describe('buildAuditLogListSearchParams', () => {
  it('varsayılan/boş değerleri URLe YAZMAZ', () => {
    expect(buildAuditLogListSearchParams(DEFAULT_AUDIT_LOG_LIST_FILTERS).toString()).toBe('')
  })

  it('dolu filtreleri doğru query string olarak üretir', () => {
    const params = buildAuditLogListSearchParams({
      entityType: 'Employee',
      performedBy: 'ahmet',
      from: '2026-01-01',
      to: '',
      page: 0,
    })

    expect(params.toString()).toBe('entityType=Employee&performedBy=ahmet&from=2026-01-01')
  })

  it('page sıfırdan büyükse page parametresini ekler', () => {
    const params = buildAuditLogListSearchParams({ ...DEFAULT_AUDIT_LOG_LIST_FILTERS, page: 3 })

    expect(params.get('page')).toBe('3')
  })
})

describe('parse ↔ build round-trip', () => {
  it('build sonucu tekrar parse edilince AYNI filtreleri üretir', () => {
    const filters = {
      entityType: 'JobTitle',
      performedBy: 'sistem',
      from: '2026-02-01',
      to: '2026-02-28',
      page: 1,
    }

    expect(parseAuditLogListFilters(buildAuditLogListSearchParams(filters))).toEqual(filters)
  })
})

// Bölüm 13.8 Testler: "Unit: Tarih aralığı validasyonu."
describe('isValidDateRange', () => {
  it('ikisi de boşsa geçerlidir', () => {
    expect(isValidDateRange('', '')).toBe(true)
  })

  it('yalnızca biri doluysa geçerlidir', () => {
    expect(isValidDateRange('2026-01-01', '')).toBe(true)
    expect(isValidDateRange('', '2026-01-01')).toBe(true)
  })

  it('bitiş başlangıçtan SONRA ise geçerlidir', () => {
    expect(isValidDateRange('2026-01-01', '2026-01-31')).toBe(true)
  })

  it('bitiş başlangıçla AYNI ise geçerlidir', () => {
    expect(isValidDateRange('2026-01-15', '2026-01-15')).toBe(true)
  })

  it('bitiş başlangıçtan ÖNCE ise GEÇERSİZDİR', () => {
    expect(isValidDateRange('2026-02-01', '2026-01-01')).toBe(false)
  })
})
