import { describe, expect, it } from 'vitest'
import {
  DEFAULT_EMPLOYEE_LIST_FILTERS,
  buildEmployeeListSearchParams,
  parseEmployeeListFilters,
} from './employeeListParams'

// Bölüm 13.6 Testler: "Filtre state'inin URL query string'ine senkron
// olması (ör. ?name=ahmet&organizationUnitId=3) — sayfa yenilendiğinde
// filtrenin kaybolmaması."
describe('parseEmployeeListFilters', () => {
  it('boş URLSearchParams için varsayılan filtreleri döner', () => {
    expect(parseEmployeeListFilters(new URLSearchParams())).toEqual(DEFAULT_EMPLOYEE_LIST_FILTERS)
  })

  it('name/organizationUnitId/jobTitleId/page parametrelerini okur', () => {
    const params = new URLSearchParams('name=ahmet&organizationUnitId=3&jobTitleId=5&page=2')

    expect(parseEmployeeListFilters(params)).toEqual({
      name: 'ahmet',
      organizationUnitId: '3',
      jobTitleId: '5',
      page: 2,
    })
  })

  it('geçersiz veya negatif page değerini 0a düşürür', () => {
    expect(parseEmployeeListFilters(new URLSearchParams('page=-5')).page).toBe(0)
    expect(parseEmployeeListFilters(new URLSearchParams('page=abc')).page).toBe(0)
  })
})

describe('buildEmployeeListSearchParams', () => {
  it('varsayılan/boş değerleri URLe YAZMAZ', () => {
    expect(buildEmployeeListSearchParams(DEFAULT_EMPLOYEE_LIST_FILTERS).toString()).toBe('')
  })

  it('dolu filtreleri doğru query string olarak üretir', () => {
    const params = buildEmployeeListSearchParams({
      name: 'ahmet',
      organizationUnitId: '3',
      jobTitleId: '',
      page: 0,
    })

    expect(params.toString()).toBe('name=ahmet&organizationUnitId=3')
  })

  it('page sıfırdan büyükse page parametresini ekler', () => {
    const params = buildEmployeeListSearchParams({ ...DEFAULT_EMPLOYEE_LIST_FILTERS, page: 2 })

    expect(params.get('page')).toBe('2')
  })
})

describe('parse ↔ build round-trip', () => {
  it('build sonucu tekrar parse edilince AYNI filtreleri üretir (sayfa yenilendiğinde kayıp YOK)', () => {
    const filters = { name: 'ahmet', organizationUnitId: '3', jobTitleId: '', page: 2 }

    const roundTripped = parseEmployeeListFilters(buildEmployeeListSearchParams(filters))

    expect(roundTripped).toEqual(filters)
  })
})
