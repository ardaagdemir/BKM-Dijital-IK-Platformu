import { apiClient } from '../../../shared/api/apiClient'
import type {
  CreateLeaveRequestRequest,
  LeaveBalance,
  LeaveRequest,
  LeaveRequestDecisionRequest,
  LeaveType,
  LeaveTypeRequest,
} from '../types'

export function listLeaveTypes(): Promise<LeaveType[]> {
  return apiClient.get<LeaveType[]>('/api/leave/types')
}

export function createLeaveType(request: LeaveTypeRequest): Promise<LeaveType> {
  return apiClient.post<LeaveType>('/api/leave/types', request)
}

export function updateLeaveType(id: number, request: LeaveTypeRequest): Promise<LeaveType> {
  return apiClient.put<LeaveType>(`/api/leave/types/${id}`, request)
}

export function deleteLeaveType(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/leave/types/${id}`)
}

// `hireDate` zorunlu (backend, `yearsOfService`/`entitlementDays`'i bundan
// hesaplar — bkz. LeaveBalanceService); `asOfDate` opsiyonel, backend
// bugüne varsayar.
export function getLeaveBalance(params: {
  employeeId: number
  hireDate: string
  asOfDate?: string
}): Promise<LeaveBalance> {
  const query = new URLSearchParams()
  query.set('employeeId', String(params.employeeId))
  query.set('hireDate', params.hireDate)
  if (params.asOfDate) {
    query.set('asOfDate', params.asOfDate)
  }
  return apiClient.get<LeaveBalance>(`/api/leave/balance?${query.toString()}`)
}

// `hireDate` VERİLMEZSE backend bakiye kontrolünü HİÇ YAPMAZ (`balanceWarning`
// her zaman null) — roadmap'in "bakiye yetersizse uyarı gösterilir, ENGELLENMEZ"
// kabul kriterini karşılamak için frontend bunu HER ZAMAN gönderir.
export function createLeaveRequest(
  request: CreateLeaveRequestRequest,
  options: { hireDate?: string; employeeEmail?: string } = {},
): Promise<LeaveRequest> {
  const query = new URLSearchParams()
  if (options.hireDate) {
    query.set('hireDate', options.hireDate)
  }
  if (options.employeeEmail) {
    query.set('employeeEmail', options.employeeEmail)
  }
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return apiClient.post<LeaveRequest>(`/api/leave/requests${suffix}`, request)
}

// Sayfalanmamış DÜZ liste (backend zaten startDate DESC sıralı döner).
export function listLeaveRequests(employeeId: number): Promise<LeaveRequest[]> {
  return apiClient.get<LeaveRequest[]>(`/api/leave/requests?employeeId=${employeeId}`)
}

// `teamEmployeeIds`: YONETICI için ZORUNLU (bkz. LeaveRequestAccessGuard —
// backend organization'a bağımlı olmadığından "bu çalışan gerçekten benim
// ekibimde mi" sorusunu SUNUCU TARAFINDA doğrulayamıyor; çağıran taraf
// kendi ekibi olarak İDDİA ettiği employeeId listesini sağlıyor). ADMIN/IK
// için gerekmez (rolleri zaten yeterli).
export function decideLeaveRequest(
  id: number,
  request: LeaveRequestDecisionRequest,
  teamEmployeeIds?: number[],
): Promise<LeaveRequest> {
  const query = new URLSearchParams()
  teamEmployeeIds?.forEach((employeeId) => query.append('teamEmployeeIds', String(employeeId)))
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return apiClient.put<LeaveRequest>(`/api/leave/requests/${id}/decision${suffix}`, request)
}

export function exportLeaveRequests(params: { employeeId: number; format: 'csv' | 'xlsx' }): Promise<Blob> {
  const query = new URLSearchParams()
  query.set('employeeId', String(params.employeeId))
  query.set('format', params.format)
  return apiClient.getBlob(`/api/leave/requests/export?${query.toString()}`)
}
