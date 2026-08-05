import { apiClient } from '../../../shared/api/apiClient'
import type {
  Award,
  CreateAwardRequest,
  CreateWarningRequest,
  DisciplinaryCase,
  DisciplinaryCaseRevision,
  Warning,
} from '../types'

export function createWarning(request: CreateWarningRequest): Promise<Warning> {
  return apiClient.post<Warning>('/api/discipline/warnings', request)
}

export function listWarnings(employeeId: number): Promise<Warning[]> {
  return apiClient.get<Warning[]>(`/api/discipline/warnings?employeeId=${employeeId}`)
}

export function createDisciplinaryCase(employeeId: number, reason: string): Promise<DisciplinaryCase> {
  return apiClient.post<DisciplinaryCase>('/api/discipline/cases', { employeeId, reason })
}

export function listDisciplinaryCases(employeeId: number): Promise<DisciplinaryCase[]> {
  return apiClient.get<DisciplinaryCase[]>(`/api/discipline/cases?employeeId=${employeeId}`)
}

export function recordDefense(id: number, defense: string): Promise<DisciplinaryCase> {
  return apiClient.put<DisciplinaryCase>(`/api/discipline/cases/${id}/defense`, { defense })
}

export function closeDisciplinaryCase(id: number): Promise<DisciplinaryCase> {
  return apiClient.put<DisciplinaryCase>(`/api/discipline/cases/${id}/close`, {})
}

export function getDisciplinaryCaseRevisions(id: number): Promise<DisciplinaryCaseRevision[]> {
  return apiClient.get<DisciplinaryCaseRevision[]>(`/api/discipline/cases/${id}/revisions`)
}

export function createAward(request: CreateAwardRequest): Promise<Award> {
  return apiClient.post<Award>('/api/discipline/awards', request)
}

export function listAwards(employeeId: number): Promise<Award[]> {
  return apiClient.get<Award[]>(`/api/discipline/awards?employeeId=${employeeId}`)
}
