import { useMutation, useQueryClient } from '@tanstack/react-query'
import { recruitmentKeys } from '../queryKeys'
import * as recruitmentApi from './recruitmentApi'

export function useHrDecideHiringRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, decision }: { id: number; decision: 'APPROVED' | 'REJECTED' }) =>
      recruitmentApi.hrDecideHiringRequest(id, decision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.hiringRequests.all })
    },
  })
}
