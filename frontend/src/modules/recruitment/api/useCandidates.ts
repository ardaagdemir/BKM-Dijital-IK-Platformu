import { useQuery } from '@tanstack/react-query'
import { recruitmentKeys } from '../queryKeys'
import * as recruitmentApi from './recruitmentApi'

export function useCandidates() {
  return useQuery({
    queryKey: recruitmentKeys.candidates.list(),
    queryFn: recruitmentApi.listCandidates,
  })
}
