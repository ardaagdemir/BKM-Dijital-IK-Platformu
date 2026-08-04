// Bölüm 13.6 Testler: "Filtre state'inin URL query string'ine senkron
// olması (ör. ?name=ahmet&organizationUnitId=3) — sayfa yenilendiğinde
// filtrenin kaybolmaması." Saf fonksiyonlar olarak tutulur (React Router'a
// bağımlı DEĞİL) — izole birim testi için.
export type EmployeeListFilters = {
  name: string
  organizationUnitId: string
  jobTitleId: string
  page: number
}

export const DEFAULT_EMPLOYEE_LIST_FILTERS: EmployeeListFilters = {
  name: '',
  organizationUnitId: '',
  jobTitleId: '',
  page: 0,
}

export function parseEmployeeListFilters(searchParams: URLSearchParams): EmployeeListFilters {
  const pageRaw = Number(searchParams.get('page'))
  return {
    name: searchParams.get('name') ?? '',
    organizationUnitId: searchParams.get('organizationUnitId') ?? '',
    jobTitleId: searchParams.get('jobTitleId') ?? '',
    page: Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 0,
  }
}

// Varsayılan/boş değerler URL'e YAZILMAZ — temiz bir URL için (ör. ilk
// sayfada `?page=0` göstermek yerine hiç `page` parametresi OLMAZ).
export function buildEmployeeListSearchParams(filters: EmployeeListFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.name) {
    params.set('name', filters.name)
  }
  if (filters.organizationUnitId) {
    params.set('organizationUnitId', filters.organizationUnitId)
  }
  if (filters.jobTitleId) {
    params.set('jobTitleId', filters.jobTitleId)
  }
  if (filters.page > 0) {
    params.set('page', String(filters.page))
  }
  return params
}
