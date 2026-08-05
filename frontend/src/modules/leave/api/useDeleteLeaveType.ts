import { useMutation, useQueryClient } from '@tanstack/react-query'
import { leaveKeys } from '../queryKeys'
import * as leaveApi from './leaveApi'

export function useDeleteLeaveType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => leaveApi.deleteLeaveType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.types.list() })
    },
  })
}
