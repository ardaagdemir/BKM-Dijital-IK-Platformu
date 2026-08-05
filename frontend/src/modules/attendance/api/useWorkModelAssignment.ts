import { useQuery } from '@tanstack/react-query'
import { attendanceKeys } from '../queryKeys'
import * as attendanceApi from './attendanceApi'

// 404 (henüz atama yok) BEKLENEN bir durumdur, gereksiz retry YAPILMAZ
// (bkz. useMyEmployee'daki AYNI gerekçe).
export function useWorkModelAssignment(employeeId: number) {
  return useQuery({
    queryKey: attendanceKeys.workModelAssignment.byEmployee(employeeId),
    queryFn: () => attendanceApi.getWorkModelAssignment(employeeId),
    retry: false,
  })
}
