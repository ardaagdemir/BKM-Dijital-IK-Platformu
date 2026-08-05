import dayjs from 'dayjs'
import type { LeaveRequest } from '../leave/types'

// US-07.3.1: `TimesheetService`'in `leaveDates` parametresi — onaylı izin
// taleplerinin BAŞLANGIÇ/BİTİŞ aralığını GÜNLÜK tarih listesine açar (bkz.
// `attendanceApi.getTimesheet`'in kompozisyon notu). Yalnızca `APPROVED`
// talepler dahil edilir (`PENDING` henüz kesinleşmedi, `REJECTED` geçersiz).
export function expandLeaveDates(requests: LeaveRequest[]): string[] {
  const dates: string[] = []
  requests
    .filter((request) => request.status === 'APPROVED')
    .forEach((request) => {
      let current = dayjs(request.startDate)
      const end = dayjs(request.endDate)
      while (!current.isAfter(end)) {
        dates.push(current.format('YYYY-MM-DD'))
        current = current.add(1, 'day')
      }
    })
  return dates
}
