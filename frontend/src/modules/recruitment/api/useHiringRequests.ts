import { useQuery } from '@tanstack/react-query'
import { recruitmentKeys } from '../queryKeys'
import * as recruitmentApi from './recruitmentApi'

export function useHiringRequests(organizationUnitId?: number) {
  return useQuery({
    queryKey: recruitmentKeys.hiringRequests.list(organizationUnitId),
    queryFn: () => recruitmentApi.listHiringRequests(organizationUnitId),
  })
}
