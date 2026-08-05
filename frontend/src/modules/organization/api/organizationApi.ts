import { apiClient } from '../../../shared/api/apiClient'
import type { PageResponse } from '../../../shared/types/PageResponse'
import type {
  AssignEmployeeRequest,
  CreateEmployeeAssetRequest,
  CreateEmployeeRequest,
  CreateOrganizationUnitRequest,
  Employee,
  EmployeeAsset,
  EmployeeAssignmentHistoryEntry,
  EmployeeProfile,
  EmployeeProfileRequest,
  EmployeeSearchParams,
  JobTitle,
  JobTitleRequest,
  OrganizationUnit,
  ReturnEmployeeAssetRequest,
} from '../types'

function buildEmployeeQuery(params: EmployeeSearchParams): URLSearchParams {
  const query = new URLSearchParams()
  if (params.name) {
    query.set('name', params.name)
  }
  if (params.organizationUnitId) {
    query.set('organizationUnitId', String(params.organizationUnitId))
  }
  if (params.jobTitleId) {
    query.set('jobTitleId', String(params.jobTitleId))
  }
  return query
}

export function listUnits(): Promise<OrganizationUnit[]> {
  return apiClient.get<OrganizationUnit[]>('/api/organization/units')
}

export function createUnit(request: CreateOrganizationUnitRequest): Promise<OrganizationUnit> {
  return apiClient.post<OrganizationUnit>('/api/organization/units', request)
}

export function listJobTitles(): Promise<JobTitle[]> {
  return apiClient.get<JobTitle[]>('/api/organization/job-titles')
}

export function createJobTitle(request: JobTitleRequest): Promise<JobTitle> {
  return apiClient.post<JobTitle>('/api/organization/job-titles', request)
}

export function updateJobTitle(id: number, request: JobTitleRequest): Promise<JobTitle> {
  return apiClient.put<JobTitle>(`/api/organization/job-titles/${id}`, request)
}

export function deleteJobTitle(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/organization/job-titles/${id}`)
}

export function createEmployee(request: CreateEmployeeRequest): Promise<Employee> {
  return apiClient.post<Employee>('/api/organization/employees', request)
}

export function getEmployee(id: number): Promise<Employee> {
  return apiClient.get<Employee>(`/api/organization/employees/${id}`)
}

// Bölüm 14.3'ün ön-koşulu — oturum sahibinin KENDİ çalışan kaydı (e-posta
// eşleşmesi, bkz. backend'in EmployeeController#getMyEmployee). Employee ile
// User arasında bir FK bağı OLMADIĞINDAN bu, "benim employeeId'm nedir?"
// sorusuna cevap veren TEK yol — izin bakiyesi/talebi gibi ekranlar bunu
// kullanır. Kayıt yoksa (ör. çalışan olmayan bir hesap) 404 döner.
export function getMyEmployee(): Promise<Employee> {
  return apiClient.get<Employee>('/api/organization/employees/me')
}

// Bölüm 13.7 — yalnızca temel bilgileri günceller (organizationUnitId/
// jobTitleId/iban'a DOKUNMAZ, bkz. EmployeeService.update).
export function updateEmployee(id: number, request: CreateEmployeeRequest): Promise<Employee> {
  return apiClient.put<Employee>(`/api/organization/employees/${id}`, request)
}

// Atama, temel bilgi güncellemesinden AYRI bir uç (bkz. EmployeeService.assign)
// — her çağrı önceki atamayı TAMAMEN üzerine yazar (parçalı/kısmi atama YOK).
export function assignEmployee(id: number, request: AssignEmployeeRequest): Promise<Employee> {
  return apiClient.put<Employee>(`/api/organization/employees/${id}/assignment`, request)
}

export function searchEmployees(
  params: EmployeeSearchParams & { page: number; size?: number },
): Promise<PageResponse<Employee>> {
  const query = buildEmployeeQuery(params)
  query.set('page', String(params.page))
  query.set('size', String(params.size ?? 20))
  return apiClient.get<PageResponse<Employee>>(`/api/organization/employees?${query.toString()}`)
}

export function exportEmployees(
  params: EmployeeSearchParams & { format: 'csv' | 'xlsx' },
): Promise<Blob> {
  const query = buildEmployeeQuery(params)
  query.set('format', params.format)
  return apiClient.getBlob(`/api/organization/employees/export?${query.toString()}`)
}

// Bölüm 14.2 (US-03.3.1) — PUT bir UPSERT'tir (yoksa oluşturur/varsa
// günceller, bkz. EmployeeProfileService.save); GET, profil hiç
// kaydedilmemişse 404 döner ("Özlük bilgisi bulunamadı.").
export function getEmployeeProfile(id: number): Promise<EmployeeProfile> {
  return apiClient.get<EmployeeProfile>(`/api/organization/employees/${id}/profile`)
}

export function saveEmployeeProfile(id: number, request: EmployeeProfileRequest): Promise<EmployeeProfile> {
  return apiClient.put<EmployeeProfile>(`/api/organization/employees/${id}/profile`, request)
}

// Bölüm 14.2 (US-03.3.2) — dikkat: path değişkeni `id` DEĞİL `employeeId`
// (bkz. organization.controller.EmployeeAssetController).
export function listEmployeeAssets(employeeId: number): Promise<EmployeeAsset[]> {
  return apiClient.get<EmployeeAsset[]>(`/api/organization/employees/${employeeId}/assets`)
}

export function createEmployeeAsset(
  employeeId: number,
  request: CreateEmployeeAssetRequest,
): Promise<EmployeeAsset> {
  return apiClient.post<EmployeeAsset>(`/api/organization/employees/${employeeId}/assets`, request)
}

export function returnEmployeeAsset(
  employeeId: number,
  assetId: number,
  request: ReturnEmployeeAssetRequest,
): Promise<EmployeeAsset> {
  return apiClient.put<EmployeeAsset>(`/api/organization/employees/${employeeId}/assets/${assetId}/return`, request)
}

// Bölüm 14.2 (US-03.4.1) — salt-okunur, backend ZATEN startDate DESC
// (en yeni önce) sıralı döner.
export function listAssignmentHistory(employeeId: number): Promise<EmployeeAssignmentHistoryEntry[]> {
  return apiClient.get<EmployeeAssignmentHistoryEntry[]>(
    `/api/organization/employees/${employeeId}/assignment-history`,
  )
}
