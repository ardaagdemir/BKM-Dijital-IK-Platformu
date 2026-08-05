// Backend DTO'larıyla BİREBİR eşleşir (bkz. attendance.dto.* — Bölüm 14.6).
// `LocalTime` alanları ("HH:mm:ss" veya "HH:mm") ve `OffsetDateTime`
// alanları (ISO 8601, ör. "2026-03-10T09:05:00+03:00") backend'den STRING
// olarak gelir — frontend'de `dayjs` ile ayrıştırılır.

export type WorkModel = {
  id: number
  name: string
  plannedStartTime: string
  plannedEndTime: string
}

export type WorkModelRequest = {
  name: string
  plannedStartTime: string
  plannedEndTime: string
}

export type WorkModelAssignment = {
  employeeId: number
  workModelId: number
}

export type AttendanceRecord = {
  id: number
  employeeId: number
  checkInAt: string
  checkOutAt: string | null
}

export type AttendanceDeviation = {
  attendanceRecordId: number
  employeeId: number
  checkInAt: string
  checkOutAt: string | null
  plannedStartTime: string
  plannedEndTime: string
  lateMinutes: number
  earlyDepartureMinutes: number | null
}

export type TimesheetDayStatus = 'NORMAL' | 'EKSIK' | 'FAZLA_MESAI' | 'IZINLI'

export type TimesheetDay = {
  date: string
  status: TimesheetDayStatus
  workedMinutes: number | null
  plannedMinutes: number
}

export type Timesheet = {
  employeeId: number
  year: number
  month: number
  days: TimesheetDay[]
}
