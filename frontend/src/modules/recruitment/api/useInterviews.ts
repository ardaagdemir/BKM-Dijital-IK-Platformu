import { useQuery } from '@tanstack/react-query'
import { recruitmentKeys } from '../queryKeys'
import * as recruitmentApi from './recruitmentApi'

export function useInterviews(candidateId: number) {
  return useQuery({
    queryKey: recruitmentKeys.candidates.interviews(candidateId),
    queryFn: () => recruitmentApi.listInterviews(candidateId),
  })
}
