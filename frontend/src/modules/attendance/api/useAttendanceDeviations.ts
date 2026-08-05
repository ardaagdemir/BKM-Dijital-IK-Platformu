import { useQuery } from '@tanstack/react-query'
import { attendanceKeys } from '../queryKeys'
import * as attendanceApi from './attendanceApi'

// Atama yokken 404 döner (bkz. AttendanceDeviationService) — BEKLENEN bir
// durum, gereksiz retry YAPILMAZ.
export function useAttendanceDeviations(employeeId: number | undefined) {
  return useQuery({
    queryKey: attendanceKeys.deviations.byEmployee(employeeId ?? 0),
    queryFn: () => attendanceApi.listAttendanceDeviations(employeeId ?? 0),
    enabled: !!employeeId,
    retry: false,
  })
}
