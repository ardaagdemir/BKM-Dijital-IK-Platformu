import { useQuery } from '@tanstack/react-query'
import { recruitmentKeys } from '../queryKeys'
import * as recruitmentApi from './recruitmentApi'

export function useCandidate(id: number) {
  return useQuery({
    queryKey: recruitmentKeys.candidates.detail(id),
    queryFn: () => recruitmentApi.getCandidate(id),
  })
}
