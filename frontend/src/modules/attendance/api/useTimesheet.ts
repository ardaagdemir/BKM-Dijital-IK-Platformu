import { useQuery } from '@tanstack/react-query'
import { attendanceKeys } from '../queryKeys'
import * as attendanceApi from './attendanceApi'

// Atama yokken 404 döner (bkz. TimesheetService) — BEKLENEN bir durum,
// gereksiz retry YAPILMAZ.
export function useTimesheet(
  params: { employeeId: number; year: number; month: number; leaveDates: string[] } | undefined,
) {
  return useQuery({
    queryKey: attendanceKeys.timesheet.detail(params?.employeeId ?? 0, params?.year ?? 0, params?.month ?? 0),
    queryFn: () => attendanceApi.getTimesheet(params!),
    enabled: !!params,
    retry: false,
  })
}
