import { useMutation, useQueryClient } from '@tanstack/react-query'
import { recruitmentKeys } from '../queryKeys'
import * as recruitmentApi from './recruitmentApi'

export function useManagerDecideHiringRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      decision,
      teamOrganizationUnitIds,
    }: {
      id: number
      decision: 'APPROVED' | 'REJECTED'
      teamOrganizationUnitIds?: number[]
    }) => recruitmentApi.managerDecideHiringRequest(id, decision, teamOrganizationUnitIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.hiringRequests.all })
    },
  })
}
