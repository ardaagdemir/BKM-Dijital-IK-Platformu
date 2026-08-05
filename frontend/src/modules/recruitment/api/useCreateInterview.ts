import { useMutation, useQueryClient } from '@tanstack/react-query'
import { recruitmentKeys } from '../queryKeys'
import type { CreateInterviewRequest } from '../types'
import * as recruitmentApi from './recruitmentApi'

export function useCreateInterview(candidateId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateInterviewRequest) => recruitmentApi.createInterview(candidateId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.candidates.interviews(candidateId) })
    },
  })
}
