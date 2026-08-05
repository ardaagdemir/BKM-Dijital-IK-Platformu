import { useMutation, useQueryClient } from '@tanstack/react-query'
import { leaveKeys } from '../queryKeys'
import type { LeaveRequestDecisionRequest } from '../types'
import * as leaveApi from './leaveApi'

export function useDecideLeaveRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      request,
      teamEmployeeIds,
    }: {
      id: number
      request: LeaveRequestDecisionRequest
      teamEmployeeIds?: number[]
    }) => leaveApi.decideLeaveRequest(id, request, teamEmployeeIds),
    onSuccess: (decided) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.requests.byEmployee(decided.employeeId) })
      queryClient.invalidateQueries({ queryKey: leaveKeys.balance.detail(decided.employeeId) })
      // Onaylanan/reddedilen talep, YÖNETİCİNİN "bekleyenler" listesindeki
      // TÜM ekip üyelerinin sorgularını etkileyebilir — modülün TÜM
      // `requests` anahtarı invalidate edilir (bkz. Approvals sayfasının
      // N sorgu birleştirme deseni).
      queryClient.invalidateQueries({ queryKey: leaveKeys.requests.all })
    },
  })
}
