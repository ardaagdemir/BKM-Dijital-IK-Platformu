import { useQuery } from '@tanstack/react-query'
import { recruitmentKeys } from '../queryKeys'
import * as recruitmentApi from './recruitmentApi'

export function useStaffingNorms() {
  return useQuery({
    queryKey: recruitmentKeys.staffingNorms.list(),
    queryFn: recruitmentApi.listStaffingNorms,
  })
}
