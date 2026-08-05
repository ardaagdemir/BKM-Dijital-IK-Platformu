import { useMutation, useQueryClient } from '@tanstack/react-query'
import { recruitmentKeys } from '../queryKeys'
import type { CandidateStage } from '../types'
import * as recruitmentApi from './recruitmentApi'

export function useChangeCandidateStage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, stage }: { id: number; stage: CandidateStage }) =>
      recruitmentApi.changeCandidateStage(id, stage),
    onSuccess: (candidate) => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.candidates.detail(candidate.id) })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.candidates.list() })
    },
  })
}
