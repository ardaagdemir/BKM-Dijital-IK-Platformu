import { useMutation, useQueryClient } from '@tanstack/react-query'
import { leaveKeys } from '../queryKeys'
import type { LeaveTypeRequest } from '../types'
import * as leaveApi from './leaveApi'

export function useUpdateLeaveType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: LeaveTypeRequest }) => leaveApi.updateLeaveType(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.types.list() })
    },
  })
}
