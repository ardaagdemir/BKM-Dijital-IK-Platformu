import { useMutation, useQueryClient } from '@tanstack/react-query'
import { amenitiesKeys } from '../queryKeys'
import * as clubsApi from './clubsApi'

export function useDecideMembershipRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      status,
      rejectionReason,
    }: {
      id: number
      status: 'APPROVED' | 'REJECTED'
      rejectionReason: string | null
    }) => clubsApi.decideMembershipRequest(id, status, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.membershipRequests.all })
    },
  })
}
