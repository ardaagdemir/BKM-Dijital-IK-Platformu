import { apiClient } from '../../../shared/api/apiClient'
import type {
  CompletedTraining,
  CreateTrainingEnrollmentRequest,
  Training,
  TrainingEnrollment,
  TrainingEnrollmentDecisionRequest,
  TrainingRequest,
} from '../types'

export function listTrainings(): Promise<Training[]> {
  return apiClient.get<Training[]>('/api/training/trainings')
}

export function createTraining(request: TrainingRequest): Promise<Training> {
  return apiClient.post<Training>('/api/training/trainings', request)
}

export function updateTraining(id: number, request: TrainingRequest): Promise<Training> {
  return apiClient.put<Training>(`/api/training/trainings/${id}`, request)
}

export function deleteTraining(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/training/trainings/${id}`)
}

export function createEnrollment(request: CreateTrainingEnrollmentRequest): Promise<TrainingEnrollment> {
  return apiClient.post<TrainingEnrollment>('/api/training/enrollments', request)
}

export function listEnrollments(employeeId: number): Promise<TrainingEnrollment[]> {
  return apiClient.get<TrainingEnrollment[]>(`/api/training/enrollments?employeeId=${employeeId}`)
}

// `teamEmployeeIds`: YONETICI için ZORUNLU — `leaveApi.decideLeaveRequest`'teki
// AYNI güven-sınırı deseni (bkz. TrainingEnrollmentAccessGuard). ADMIN/IK için gerekmez.
export function decideEnrollment(
  id: number,
  request: TrainingEnrollmentDecisionRequest,
  teamEmployeeIds?: number[],
): Promise<TrainingEnrollment> {
  const query = new URLSearchParams()
  teamEmployeeIds?.forEach((employeeId) => query.append('teamEmployeeIds', String(employeeId)))
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return apiClient.put<TrainingEnrollment>(`/api/training/enrollments/${id}/decision${suffix}`, request)
}

export function completeEnrollment(id: number, completedDate: string): Promise<TrainingEnrollment> {
  return apiClient.put<TrainingEnrollment>(`/api/training/enrollments/${id}/complete`, { completedDate })
}

export function listCompletedTrainings(employeeId?: number): Promise<CompletedTraining[]> {
  const suffix = employeeId !== undefined ? `?employeeId=${employeeId}` : ''
  return apiClient.get<CompletedTraining[]>(`/api/training/enrollments/completed${suffix}`)
}
