export type AuditLogListFilters = {
  entityType: string
  performedBy: string
  from: string
  to: string
  page: number
}

export const DEFAULT_AUDIT_LOG_LIST_FILTERS: AuditLogListFilters = {
  entityType: '',
  performedBy: '',
  from: '',
  to: '',
  page: 0,
}

// Bölüm 13.6'daki employeeListParams.ts ile AYNI desen: filtre state'i URL
// query string'i ile senkron, sayfa yenilendiğinde/geri-ileri gidildiğinde
// kaybolmaz.
export function parseAuditLogListFilters(searchParams: URLSearchParams): AuditLogListFilters {
  const rawPage = Number(searchParams.get('page'))
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.trunc(rawPage) : 0
  return {
    entityType: searchParams.get('entityType') ?? '',
    performedBy: searchParams.get('performedBy') ?? '',
    from: searchParams.get('from') ?? '',
    to: searchParams.get('to') ?? '',
    page,
  }
}

export function buildAuditLogListSearchParams(filters: AuditLogListFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.entityType) {
    params.set('entityType', filters.entityType)
  }
  if (filters.performedBy) {
    params.set('performedBy', filters.performedBy)
  }
  if (filters.from) {
    params.set('from', filters.from)
  }
  if (filters.to) {
    params.set('to', filters.to)
  }
  if (filters.page > 0) {
    params.set('page', String(filters.page))
  }
  return params
}

// Bölüm 13.8 "Validasyon: Tarih aralığında bitiş, başlangıçtan önce
// olamaz (client-side)." — from/to boşsa (henüz seçilmemiş/tek taraflı
// seçilmiş) her zaman geçerlidir, yalnızca İKİSİ de doluyken kontrol edilir.
export function isValidDateRange(from: string, to: string): boolean {
  if (!from || !to) {
    return true
  }
  return to >= from
}
