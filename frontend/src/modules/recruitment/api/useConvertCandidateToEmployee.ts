import { useMutation, useQueryClient } from '@tanstack/react-query'
import { recruitmentKeys } from '../queryKeys'
import * as recruitmentApi from './recruitmentApi'

export function useConvertCandidateToEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => recruitmentApi.convertCandidateToEmployee(id),
    onSuccess: (draft) => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.candidates.detail(draft.candidateId) })
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.candidates.list() })
    },
  })
}
