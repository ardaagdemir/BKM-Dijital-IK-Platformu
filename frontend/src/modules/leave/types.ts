// Backend DTO'larıyla BİREBİR eşleşir (bkz. leave.dto.LeaveTypeResponse).
export type LeaveType = {
  id: number
  name: string
  code: string
}

export type LeaveTypeRequest = {
  name: string
  code: string
}

// Backend'in LeaveRequestStatus enum'ıyla BİREBİR AYNI 3 değer — İNGİLİZCE
// (bkz. leave.entity.LeaveRequestStatus); Türkçe etiketler yalnızca UI
// katmanında (statusLabels.ts).
export type LeaveRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

// Backend'in LeaveBalanceResponse'uyla BİREBİR eşleşir.
export type LeaveBalance = {
  employeeId: number
  hireDate: string
  asOfDate: string
  yearsOfService: number
  entitlementDays: number
  usedDays: number
  pendingDays: number
  remainingDays: number
}

// Backend'in LeaveRequestResponse'uyla BİREBİR eşleşir —
// `balanceWarning`/`rejectionReason`/`employeeEmail` yoksa null (JSON'da
// ABSENT, apiClient bunu null'a normalize eder).
export type LeaveRequest = {
  id: number
  employeeId: number
  leaveTypeId: number
  startDate: string
  endDate: string
  status: LeaveRequestStatus
  requestedDays: number
  balanceWarning: string | null
  rejectionReason: string | null
  employeeEmail: string | null
}

export type CreateLeaveRequestRequest = {
  employeeId: number
  leaveTypeId: number
  startDate: string
  endDate: string
}

// `decision` backend'de BİLİNÇLİ OLARAK düz bir String (tipli enum DEĞİL,
// geçersiz değer Jackson 500'ü yerine kontrollü 400 versin diye) — yine de
// yalnızca bu iki değeri kabul eder.
export type LeaveRequestDecisionRequest = {
  decision: 'APPROVED' | 'REJECTED'
  rejectionReason: string | null
}
