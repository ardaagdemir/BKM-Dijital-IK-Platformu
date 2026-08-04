// Backend DTO'larıyla BİREBİR eşleşir (bkz.
// organization.dto.OrganizationUnitResponse/JobTitleResponse) — GET
// /api/organization/units DÜZ liste döner, backend ağaç DÖNDÜRMEZ.
export type OrganizationUnit = {
  id: number
  name: string
  parentId: number | null
}

export type CreateOrganizationUnitRequest = {
  name: string
  parentId: number | null
}

export type JobTitle = {
  id: number
  name: string
}

export type JobTitleRequest = {
  name: string
}

// Backend DTO'larıyla BİREBİR eşleşir (bkz.
// organization.dto.EmployeeResponse) — organizationUnitId/jobTitleId/iban,
// atama (13.7'de) yapılana kadar null'dur; 13.5 bunları YAZMAZ, yalnızca
// temel alanları oluşturur.
export type Employee = {
  id: number
  firstName: string
  lastName: string
  nationalId: string
  hireDate: string
  email: string
  organizationUnitId: number | null
  jobTitleId: number | null
  iban: string | null
}

export type CreateEmployeeRequest = {
  firstName: string
  lastName: string
  nationalId: string
  hireDate: string
  email: string
}
