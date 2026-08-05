import { useMutation, useQueryClient } from '@tanstack/react-query'
import { leaveKeys } from '../queryKeys'
import type { LeaveTypeRequest } from '../types'
import * as leaveApi from './leaveApi'

export function useCreateLeaveType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: LeaveTypeRequest) => leaveApi.createLeaveType(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.types.list() })
    },
  })
}
