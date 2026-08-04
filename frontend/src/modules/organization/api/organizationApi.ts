import { apiClient } from '../../../shared/api/apiClient'
import type {
  CreateEmployeeRequest,
  CreateOrganizationUnitRequest,
  Employee,
  JobTitle,
  JobTitleRequest,
  OrganizationUnit,
} from '../types'

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
