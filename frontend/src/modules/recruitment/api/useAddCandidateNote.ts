import { useMutation, useQueryClient } from '@tanstack/react-query'
import { recruitmentKeys } from '../queryKeys'
import * as recruitmentApi from './recruitmentApi'

export function useAddCandidateNote(candidateId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (noteText: string) => recruitmentApi.addCandidateNote(candidateId, noteText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.candidates.notes(candidateId) })
    },
  })
}
