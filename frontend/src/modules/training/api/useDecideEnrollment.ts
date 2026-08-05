import { useMutation, useQueryClient } from '@tanstack/react-query'
import { trainingKeys } from '../queryKeys'
import type { TrainingEnrollmentDecisionRequest } from '../types'
import * as trainingApi from './trainingApi'

export function useDecideEnrollment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      request,
      teamEmployeeIds,
    }: {
      id: number
      request: TrainingEnrollmentDecisionRequest
      teamEmployeeIds?: number[]
    }) => trainingApi.decideEnrollment(id, request, teamEmployeeIds),
    onSuccess: (decided) => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.enrollments.byEmployee(decided.employeeId) })
      // Onaylanan/reddedilen talep, YÖNETİCİNİN "bekleyenler" listesindeki
      // TÜM ekip üyelerinin sorgularını etkileyebilir (bkz.
      // `leave.useDecideLeaveRequest`'teki AYNI gerekçe).
      queryClient.invalidateQueries({ queryKey: trainingKeys.enrollments.all })
    },
  })
}
