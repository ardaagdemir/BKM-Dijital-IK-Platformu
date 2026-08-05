import { useQuery } from '@tanstack/react-query'
import { leaveKeys } from '../queryKeys'
import * as leaveApi from './leaveApi'

export function useLeaveBalance(params: { employeeId: number; hireDate: string } | undefined) {
  return useQuery({
    queryKey: leaveKeys.balance.detail(params?.employeeId ?? 0),
    queryFn: () => leaveApi.getLeaveBalance(params ?? { employeeId: 0, hireDate: '' }),
    enabled: !!params,
  })
}
