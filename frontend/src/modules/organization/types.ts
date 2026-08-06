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

// Bölüm 13.7 — backend'in AssignEmployeeRequest'iyle BİREBİR eşleşir;
// EmployeeService.assign HER İKİ alanı da zorunlu kılar (biri null'sa 400).
export type AssignEmployeeRequest = {
  organizationUnitId: number
  jobTitleId: number
}

// GET /api/organization/employees ve .../export'un ORTAK filtre
// parametreleri (bkz. organization.EmployeeController#search/#export) —
// name kısmi/büyük-küçük harf duyarsız eşleşir (backend LIKE sorgusu).
export type EmployeeSearchParams = {
  name?: string
  organizationUnitId?: number
  jobTitleId?: number
}

// Bölüm 14.2 — backend'in EmployeeProfileResponse'uyla BİREBİR eşleşir; TÜM
// alanlar nullable (backend'de zorunlu değil). `gender`/`educationLevel`/
// `languageLevel` backend'de SABİT bir liste/enum DEĞİL, serbest metin —
// frontend bir seçenek kümesi İCAT ETMEZ.
export type EmployeeProfile = {
  employeeId: number
  birthDate: string | null
  birthPlace: string | null
  gender: string | null
  city: string | null
  district: string | null
  addressLine: string | null
  educationLevel: string | null
  schoolName: string | null
  graduationYear: number | null
  foreignLanguage: string | null
  languageLevel: string | null
}

export type EmployeeProfileRequest = Omit<EmployeeProfile, 'employeeId'>

// Bölüm 14.2 — backend'in EmployeeAssetResponse'uyla BİREBİR eşleşir
// (bkz. organization.dto.EmployeeAssetResponse) — `returnedAt` null'sa
// zimmet HÂLÂ çalışanda demektir.
export type EmployeeAsset = {
  id: number
  employeeId: number
  itemName: string
  deliveredAt: string
  returnedAt: string | null
}

export type CreateEmployeeAssetRequest = {
  itemName: string
  deliveredAt: string
}

export type ReturnEmployeeAssetRequest = {
  returnedAt: string
}

// Bölüm 14.2 — backend'in EmployeeAssignmentHistoryResponse'uyla BİREBİR
// eşleşir; `GET .../assignment-history` sonucu ZATEN `startDate` DESC
// (en yeni ÖNCE) sıralı döner — frontend AYRICA sıralama YAPMAZ.
// `endDate` null'sa bu kayıt HÂLÂ AÇIK (güncel atama) demektir.
export type EmployeeAssignmentHistoryEntry = {
  id: number
  employeeId: number
  organizationUnitId: number
  jobTitleId: number
  startDate: string
  endDate: string | null
}

// Bölüm 14.7/8I — backend DTO'larıyla BİREBİR eşleşir (bkz. organization.dto.*).

export type PolicyDocumentStatus = 'ACTIVE' | 'ARCHIVED'

export type PolicyDocument = {
  id: number
  title: string
  version: number
  fileName: string
  status: PolicyDocumentStatus
  previousVersionId: number | null
}

export type JobDescription = {
  id: number
  jobTitleId: number
  content: string
}

export type CreateJobDescriptionRequest = {
  jobTitleId: number
  content: string
}

export type OrganizationChartEmployee = {
  id: number
  firstName: string
  lastName: string
  jobTitleName: string | null
}

export type OrganizationChartNode = {
  id: number
  name: string
  employees: OrganizationChartEmployee[]
  children: OrganizationChartNode[]
}
