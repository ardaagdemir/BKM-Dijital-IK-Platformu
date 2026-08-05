import { useQuery } from '@tanstack/react-query'
import { recruitmentKeys } from '../queryKeys'
import * as recruitmentApi from './recruitmentApi'

export function useCandidateNotes(candidateId: number) {
  return useQuery({
    queryKey: recruitmentKeys.candidates.notes(candidateId),
    queryFn: () => recruitmentApi.listCandidateNotes(candidateId),
  })
}
