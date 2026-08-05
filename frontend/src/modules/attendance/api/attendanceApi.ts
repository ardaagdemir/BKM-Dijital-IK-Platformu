import { apiClient } from '../../../shared/api/apiClient'
import type {
  AttendanceDeviation,
  AttendanceRecord,
  Timesheet,
  WorkModel,
  WorkModelAssignment,
  WorkModelRequest,
} from '../types'

export function listWorkModels(): Promise<WorkModel[]> {
  return apiClient.get<WorkModel[]>('/api/attendance/work-models')
}

export function createWorkModel(request: WorkModelRequest): Promise<WorkModel> {
  return apiClient.post<WorkModel>('/api/attendance/work-models', request)
}

export function updateWorkModel(id: number, request: WorkModelRequest): Promise<WorkModel> {
  return apiClient.put<WorkModel>(`/api/attendance/work-models/${id}`, request)
}

export function deleteWorkModel(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/attendance/work-models/${id}`)
}

export function getWorkModelAssignment(employeeId: number): Promise<WorkModelAssignment> {
  return apiClient.get<WorkModelAssignment>(`/api/attendance/employees/${employeeId}/work-model-assignment`)
}

export function assignWorkModel(employeeId: number, workModelId: number): Promise<WorkModelAssignment> {
  return apiClient.put<WorkModelAssignment>(`/api/attendance/employees/${employeeId}/work-model-assignment`, {
    workModelId,
  })
}

export function listAttendanceRecords(employeeId: number): Promise<AttendanceRecord[]> {
  return apiClient.get<AttendanceRecord[]>(`/api/attendance/attendance-records?employeeId=${employeeId}`)
}

export function listAttendanceDeviations(employeeId: number): Promise<AttendanceDeviation[]> {
  return apiClient.get<AttendanceDeviation[]>(`/api/attendance/attendance-records/deviations?employeeId=${employeeId}`)
}

// `leaveDates`: onaylı izin günleri — `leave` modülüne bağımlı OLMADIĞINDAN
// (bkz. TimesheetService javadoc'u) çağıran (frontend) kendi `leaveApi`
// sorgusundan türetip BURAYA sağlar (bkz. TimesheetPage'deki kompozisyon).
export function getTimesheet(params: {
  employeeId: number
  year: number
  month: number
  leaveDates: string[]
}): Promise<Timesheet> {
  const query = new URLSearchParams()
  query.set('employeeId', String(params.employeeId))
  query.set('year', String(params.year))
  query.set('month', String(params.month))
  params.leaveDates.forEach((date) => query.append('leaveDates', date))
  return apiClient.get<Timesheet>(`/api/attendance/timesheet?${query.toString()}`)
}
