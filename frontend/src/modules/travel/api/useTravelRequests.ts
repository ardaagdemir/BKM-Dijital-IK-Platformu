import { useQuery } from '@tanstack/react-query'
import { travelKeys } from '../queryKeys'
import * as travelApi from './travelApi'

export function useTravelRequests(employeeId: number | undefined) {
  return useQuery({
    queryKey: travelKeys.requests.byEmployee(employeeId ?? 0),
    queryFn: () => travelApi.listTravelRequests(employeeId ?? 0),
    enabled: !!employeeId,
  })
}
