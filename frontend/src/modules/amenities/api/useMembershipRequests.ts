import { useQuery } from '@tanstack/react-query'
import { amenitiesKeys } from '../queryKeys'
import * as clubsApi from './clubsApi'

export function useMembershipRequests(employeeId?: number) {
  return useQuery({
    queryKey: amenitiesKeys.membershipRequests.list(employeeId),
    queryFn: () => clubsApi.listMembershipRequests(employeeId),
  })
}
