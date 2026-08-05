import { useMutation, useQueryClient } from '@tanstack/react-query'
import { leaveKeys } from '../queryKeys'
import type { CreateLeaveRequestRequest } from '../types'
import * as leaveApi from './leaveApi'

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      request,
      options,
    }: {
      request: CreateLeaveRequestRequest
      options?: { hireDate?: string; employeeEmail?: string }
    }) => leaveApi.createLeaveRequest(request, options),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.requests.byEmployee(created.employeeId) })
      queryClient.invalidateQueries({ queryKey: leaveKeys.balance.detail(created.employeeId) })
    },
  })
}
