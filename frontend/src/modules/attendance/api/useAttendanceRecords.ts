import { useQuery } from '@tanstack/react-query'
import { attendanceKeys } from '../queryKeys'
import * as attendanceApi from './attendanceApi'

export function useAttendanceRecords(employeeId: number | undefined) {
  return useQuery({
    queryKey: attendanceKeys.records.byEmployee(employeeId ?? 0),
    queryFn: () => attendanceApi.listAttendanceRecords(employeeId ?? 0),
    enabled: !!employeeId,
  })
}
