import { apiClient } from '../../../shared/api/apiClient'
import type { PageResponse } from '../../../shared/types/PageResponse'
import type {
  CreateEmployeeRequest,
  CreateOrganizationUnitRequest,
  Employee,
  EmployeeSearchParams,
  JobTitle,
  JobTitleRequest,
  OrganizationUnit,
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
