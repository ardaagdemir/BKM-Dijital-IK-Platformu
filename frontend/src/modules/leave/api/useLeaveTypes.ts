import { useQuery } from '@tanstack/react-query'
import { leaveKeys } from '../queryKeys'
import * as leaveApi from './leaveApi'

export function useLeaveTypes() {
  return useQuery({
    queryKey: leaveKeys.types.list(),
    queryFn: leaveApi.listLeaveTypes,
  })
}
