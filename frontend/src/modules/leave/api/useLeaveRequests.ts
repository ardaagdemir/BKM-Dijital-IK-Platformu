import { useQuery } from '@tanstack/react-query'
import { leaveKeys } from '../queryKeys'
import * as leaveApi from './leaveApi'

export function useLeaveRequests(employeeId: number | undefined) {
  return useQuery({
    queryKey: leaveKeys.requests.byEmployee(employeeId ?? 0),
    queryFn: () => leaveApi.listLeaveRequests(employeeId ?? 0),
    enabled: Number.isFinite(employeeId),
  })
}
