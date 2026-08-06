import { useMutation, useQueryClient } from '@tanstack/react-query'
import { amenitiesKeys } from '../queryKeys'
import * as clubsApi from './clubsApi'

export function useCreateMembershipRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ clubId, employeeId }: { clubId: number; employeeId: number }) =>
      clubsApi.createMembershipRequest(clubId, employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.membershipRequests.all })
    },
  })
}
